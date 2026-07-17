figma.showUI(__html__, { width: 600, height: 500 });

const COMPONENT_MAP: Record<string, string> = {
  "sg-text-field": "sg-text-field",
  "sg-button": "sg-button",
  "sg-dropdown-combo": "sg-dropdown-combo"
};

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === "GENERATE") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({ type: "ERROR", message: "No hay nada seleccionado." });
      return;
    }
    try {
      let html = `<!-- Generated from Figma -->\n`;
      for (const node of selection) {
        html += await renderNode(node, 0);
      }
      figma.ui.postMessage({ type: "CODE_READY", code: html });
    } catch (e: any) {
      figma.ui.postMessage({ type: "ERROR", message: e.message || String(e) });
    }
  }
};

// --------------------------------------------------
// Render principal
// --------------------------------------------------

async function renderNode(node: SceneNode, depth: number): Promise<string> {
  const pad = "  ".repeat(depth);

  if ("visible" in node && node.visible === false) return "";

  // Caso 1: instancia mapeada -> tag Angular
  if (node.type === "INSTANCE") {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent) {
      let baseName = mainComponent.name;
      let selector = COMPONENT_MAP[baseName];

      if (!selector && mainComponent.parent) {
        baseName = mainComponent.parent.name ?? "";
        if (baseName) selector = COMPONENT_MAP[baseName];
      }

      if (selector) {
        console.log("Selector encontrado para el basename " + baseName + ", selector: " + selector);

        const defaults = getDefaultPropertyDefinitions(mainComponent);
        const props = await angularProps(node.componentProperties || {}, defaults);
        return `${pad}<${selector}${props ? " " + props : ""}></${selector}>\n`;
      } else {
        console.log("Selector no encontrado para el basename " + baseName);
      }
    }
  }
  // Caso 2: texto
  if (node.type === "TEXT") {
    const style = textStyle(node);
    const content = escapeHtml(node.characters);
    return `${pad}<span style="${style}">${content}</span>\n`;
  }

  // Caso 3: contenedor con hijos (frame, group, component, instancia no mapeada)
  if ("children" in node && (node as any).children.length > 0) {
    const style = containerStyle(node as FrameNode);
    let inner = `${pad}<div style="${style}">\n`;
    for (const child of (node as any).children as SceneNode[]) {
      inner += await renderNode(child, depth + 1);
    }
    inner += `${pad}</div>\n`;
    return inner;
  }

  // Caso 4: shape simple sin hijos (rectángulo, elipse, vector, frame vacío)
  const style = shapeStyle(node);
  return `${pad}<div style="${style}"></div>\n`;
}

// --------------------------------------------------
// Estilos: fills, strokes, radius
// --------------------------------------------------

function fillsToCss(node: any): string {
  if (!("fills" in node) || node.fills === figma.mixed || !node.fills || node.fills.length === 0) {
    return "";
  }
  const fill = (node.fills as Paint[]).find((f) => f.visible !== false && f.type === "SOLID") as
    | SolidPaint
    | undefined;
  if (!fill) return "";
  const { r, g, b } = fill.color;
  const a = fill.opacity !== undefined ? fill.opacity : 1;
  return `background-color: rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a});`;
}

function strokesToCss(node: any): string {
  if (!("strokes" in node) || !node.strokes || node.strokes.length === 0) return "";
  const stroke = (node.strokes as Paint[]).find((s) => s.visible !== false && s.type === "SOLID") as
    | SolidPaint
    | undefined;
  if (!stroke) return "";
  const { r, g, b } = stroke.color;
  const width = "strokeWeight" in node && typeof node.strokeWeight === "number" ? node.strokeWeight : 1;
  return `border: ${width}px solid rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)});`;
}

function radiusToCss(node: any): string {
  if (!("cornerRadius" in node)) return "";

  if (typeof node.cornerRadius === "number") {
    return node.cornerRadius > 0 ? `border-radius: ${node.cornerRadius}px;` : "";
  }

  // Radios individuales por esquina (cornerRadius === figma.mixed)
  if ("topLeftRadius" in node) {
    const tl = node.topLeftRadius || 0;
    const tr = node.topRightRadius || 0;
    const br = node.bottomRightRadius || 0;
    const bl = node.bottomLeftRadius || 0;
    if (tl || tr || br || bl) {
      return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
    }
  }

  return "";
}

function opacityToCss(node: any): string {
  if ("opacity" in node && typeof node.opacity === "number" && node.opacity < 1) {
    return `opacity: ${node.opacity};`;
  }
  return "";
}

// --------------------------------------------------
// Estilos: contenedor (con soporte Auto Layout -> Flexbox)
// --------------------------------------------------

function containerStyle(node: FrameNode): string {
  const styles: string[] = [];

  styles.push(`width: ${Math.round(node.width)}px;`);
  styles.push(`height: ${Math.round(node.height)}px;`);

  const fills = fillsToCss(node);
  if (fills) styles.push(fills);

  const strokes = strokesToCss(node);
  if (strokes) styles.push(strokes);

  const radius = radiusToCss(node);
  if (radius) styles.push(radius);

  const opacity = opacityToCss(node);
  if (opacity) styles.push(opacity);

  // Auto Layout -> Flexbox
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    styles.push("display: flex;");
    styles.push(`flex-direction: ${node.layoutMode === "HORIZONTAL" ? "row" : "column"};`);

    if (typeof node.itemSpacing === "number") {
      styles.push(`gap: ${node.itemSpacing}px;`);
    }

    const paddingTop = node.paddingTop || 0;
    const paddingRight = node.paddingRight || 0;
    const paddingBottom = node.paddingBottom || 0;
    const paddingLeft = node.paddingLeft || 0;
    if (paddingTop || paddingRight || paddingBottom || paddingLeft) {
      styles.push(`padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;`);
    }

    styles.push(`align-items: ${mapCounterAxisAlign(node.counterAxisAlignItems)};`);
    styles.push(`justify-content: ${mapPrimaryAxisAlign(node.primaryAxisAlignItems)};`);

    if (node.layoutWrap === "WRAP") {
      styles.push("flex-wrap: wrap;");
    }
  } else {
    // Sin auto-layout: posicionamiento relativo simple para que los hijos
    // absolutos (si los hubiera) se comporten bien
    styles.push("position: relative;");
  }

  return styles.join(" ");
}

function mapPrimaryAxisAlign(value: string): string {
  switch (value) {
    case "MIN": return "flex-start";
    case "CENTER": return "center";
    case "MAX": return "flex-end";
    case "SPACE_BETWEEN": return "space-between";
    default: return "flex-start";
  }
}

function mapCounterAxisAlign(value: string): string {
  switch (value) {
    case "MIN": return "flex-start";
    case "CENTER": return "center";
    case "MAX": return "flex-end";
    case "BASELINE": return "baseline";
    default: return "flex-start";
  }
}

// --------------------------------------------------
// Estilos: texto
// --------------------------------------------------

function textStyle(node: TextNode): string {
  const styles: string[] = [];

  const fills = fillsToCss(node);
  if (fills) {
    // Para texto, el "fill" es el color de la letra, no el fondo
    styles.push(fills.replace("background-color", "color"));
  }

  if (typeof node.fontSize === "number") {
    styles.push(`font-size: ${node.fontSize}px;`);
  }

  if (node.fontName !== figma.mixed) {
    const family = (node.fontName as FontName).family;
    const style = (node.fontName as FontName).style;
    styles.push(`font-family: '${family}', sans-serif;`);
    if (/bold/i.test(style)) styles.push("font-weight: 700;");
    else if (/medium/i.test(style)) styles.push("font-weight: 500;");
    else if (/light/i.test(style)) styles.push("font-weight: 300;");
  }

  if (typeof node.lineHeight === "object" && "value" in node.lineHeight) {
    const lh = node.lineHeight as { value: number; unit: string };
    if (lh.unit === "PIXELS") styles.push(`line-height: ${lh.value}px;`);
    else if (lh.unit === "PERCENT") styles.push(`line-height: ${lh.value}%;`);
  }

  if (node.textAlignHorizontal) {
    styles.push(`text-align: ${node.textAlignHorizontal.toLowerCase()};`);
  }

  styles.push("display: block;");

  return styles.join(" ");
}

// --------------------------------------------------
// Estilos: shapes simples (rect, elipse, vector, frame vacío)
// --------------------------------------------------

function shapeStyle(node: any): string {
  const styles: string[] = [];

  if ("width" in node && "height" in node) {
    styles.push(`width: ${Math.round(node.width)}px;`);
    styles.push(`height: ${Math.round(node.height)}px;`);
  }

  const fills = fillsToCss(node);
  if (fills) styles.push(fills);

  const strokes = strokesToCss(node);
  if (strokes) styles.push(strokes);

  const radius = radiusToCss(node);
  if (radius) styles.push(radius);

  const opacity = opacityToCss(node);
  if (opacity) styles.push(opacity);

  if (node.type === "ELLIPSE") {
    styles.push("border-radius: 50%;");
  }

  return styles.join(" ");
}

// --------------------------------------------------
// Props Angular + utils
// --------------------------------------------------

function getDefaultPropertyDefinitions(
  mainComponent: ComponentNode
): ComponentPropertyDefinitions {
  const parent = mainComponent.parent;
  // If it's a variant, the full defs (incl. VARIANT defaults) live on the ComponentSetNode
  if (parent && parent.type === "COMPONENT_SET") {
    return parent.componentPropertyDefinitions;
  }
  return mainComponent.componentPropertyDefinitions ?? {};
}

async function resolveIconName(nodeId: string): Promise<string | null> {
  try {
    const swappedNode = await figma.getNodeByIdAsync(nodeId);
    if (!swappedNode) return null;

    // Estructura esperada: contenedor => icono (un único hijo con el icono real)
    if ("children" in swappedNode && swappedNode.children.length > 0) {
      return swappedNode.children[1].name;
    }
    return swappedNode.name;
  } catch (e) {
    console.log("No se pudo resolver el icono para el id " + nodeId + ": " + e);
    return null;
  }
}

async function angularProps(
  properties: Record<string, any>,
  defaults: ComponentPropertyDefinitions = {}
): Promise<string> {
  const parts: string[] = [];

  for (const [key, propData] of Object.entries(properties)) {
    const rawValue = propData?.value !== undefined ? propData.value : propData;
    const propType = propData?.type ?? defaults[key]?.type;
    const propName = key.split("#")[0];
    const defaultValue = defaults[key]?.defaultValue;

    let outputValue: any = rawValue;

    console.log("PRE INSTANCE Prop key: " + key + ", value: " + (outputValue ?? "") + ", typeof: " + typeof outputValue);

    if (
      propType === "INSTANCE_SWAP" &&
      typeof rawValue === "string" &&
      propName.toLowerCase().includes("icon") &&
      !propName.toLowerCase().includes("class") &&
      !propName.toLowerCase().includes("filled")
    ) {
      const [iconName, defaultIconName] = await Promise.all([
        resolveIconName(rawValue),
        typeof defaultValue === "string" ? resolveIconName(defaultValue) : Promise.resolve(null),
      ]);

      console.log(
        "ICON DEBUG key=" + key +
        " rawValue=" + rawValue +
        " defaultValue=" + defaultValue +
        " iconName=" + iconName +
        " defaultIconName=" + defaultIconName
      );

      if (iconName && iconName === defaultIconName) {
        continue;
      }
      outputValue = iconName ?? rawValue;
    } else if (outputValue === defaultValue) {
      continue;
    }

    console.log("Prop key: " + key + ", value: " + (outputValue ?? "") + ", typeof: " + typeof outputValue);

    if (typeof outputValue === "boolean" || typeof outputValue === "number") {
      parts.push(`[${propName}]="${outputValue}"`);
    } else {
      parts.push(`[${propName}]="'${outputValue}'"`);
    }
  }

  return parts.join(" ");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}