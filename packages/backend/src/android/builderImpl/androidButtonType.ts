import { AndroidType, androidNameParser } from "./androidNameParser"

export enum ButtonType {
  Button,
  ImageButton,
  ImageTextButton,
  IconTextButton,
  BackgroundImageButton
}

export const androidButtonType = (node: SceneNode & BaseFrameMixin ): {
  type: ButtonType, 
  value: string, 
  foreground: SceneNode | undefined,
  background: SceneNode | undefined,
  text: TextNode | undefined
} => {
  const linear = node.children.filter(child => androidNameParser(child.name).type === AndroidType.linearLayout)
  const layout = getLayout(node)
  const childText = getChildText(node)

  if (getIsAsset(layout.foreground) && getIsAsset(layout.backgorund)) {
    return {
      type: ButtonType.BackgroundImageButton,
      value: "ImageButton",
      background: layout.backgorund, 
      foreground: layout.foreground,
      text: undefined 
    }
  } else if (linear.length !== 0 && getLayout(linear[0]).foreground && getChildText(linear[0])) {
    return {
      type: ButtonType.IconTextButton,
      value: "",
      foreground: getLayout(linear[0]).foreground,
      background: undefined,
      text: getChildText(linear[0]) 
    }
  } else if (childText === undefined) {
    return {
      type: ButtonType.ImageButton,
      value: "ImageButton",
      foreground: layout.foreground,
      background: undefined,
      text: undefined 
    }
  } else if (getIsAsset(layout.foreground)) {
    return {
      type: ButtonType.ImageTextButton, 
      value: "androidx.appcompat.widget.AppCompatButton", 
      foreground: layout.foreground, 
      background: undefined, 
      text: childText 
    }
  } else {
    return {
      type: ButtonType.Button,
      value: "androidx.appcompat.widget.AppCompatButton",
      foreground: layout.foreground,
      background: undefined,
      text: childText 
    }
  }
}

const getChildText = (node: SceneNode & BaseFrameMixin): TextNode | undefined => {
  if (node.children.filter(child => androidNameParser(child.name).type === AndroidType.text).length !== 0) {
    return node.children.filter((child): child is SceneNode & BaseFrameMixin => 
      androidNameParser(child.name).type === AndroidType.text
    )[0].children.filter((child): child is SceneNode & BaseFrameMixin =>
      androidNameParser(child.name).type === AndroidType.frameLayout
    )[0].children.filter((child): child is SceneNode & TextNode => child.type === "TEXT")[0]
  }
}

const getLayout = (node: SceneNode & BaseFrameMixin): { foreground: SceneNode | undefined, backgorund: SceneNode | undefined} => {
  const layout = node.children.filter(child =>
    child.type == "RECTANGLE" 
    || child.type == "GROUP" 
    || (androidNameParser(child.name).type !== AndroidType.text 
    && (child.type === "COMPONENT" 
    || child.type === "INSTANCE"))
  )

  layout.forEach((child, index) => {
    if (androidNameParser(child.name).type === AndroidType.view) {
      let id = androidNameParser(child.name).id.split("_")
      id.shift()
      layout[index].name = id.join("_") ?? child.name
    }
  });

  switch(layout.length) {
    case 1:
      return { foreground: layout[0], backgorund: undefined }
    case 2:
      return { foreground: layout[1], backgorund: layout[0] }
    default:
      return { foreground: undefined, backgorund: undefined }
  }
}

const getIsAsset = (layout: SceneNode | undefined): boolean => {
  if (layout !== undefined) {
    return ("isAsset" in layout 
    && layout.isAsset) 
    || layout.type === "GROUP" 
    || (androidNameParser(layout.name).type !== AndroidType.text
    && (layout.type === "COMPONENT" 
    || layout.type === "INSTANCE"))
  } else {
    return false
  }
}
