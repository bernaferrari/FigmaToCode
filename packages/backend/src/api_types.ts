// Copied from https://github.com/figma/rest-api-spec/blob/main/dist/api_types.ts

export type IsLayerTrait = {
    /**
     * A string uniquely identifying this node within the document.
     */
    id: string
  
    /**
     * The name given to the node by the user in the tool.
     */
    name: string
  
    /**
     * The type of the node
     */
    type: string
  
    /**
     * Whether or not the node is visible on the canvas.
     */
    visible?: boolean
  
    /**
     * If true, layer is locked and cannot be edited
     */
    locked?: boolean
  
    /**
     * Whether the layer is fixed while the parent is scrolling
     *
     * @deprecated
     */
    isFixed?: boolean
  
    /**
     * How layer should be treated when the frame is resized
     */
    scrollBehavior: 'SCROLLS' | 'FIXED' | 'STICKY_SCROLLS'
  
    /**
     * The rotation of the node, if not 0.
     */
    rotation?: number
  
    /**
     * A mapping of a layer's property to component property name of component properties attached to
     * this node. The component property name can be used to look up more information on the
     * corresponding component's or component set's componentPropertyDefinitions.
     */
    componentPropertyReferences?: { [key: string]: string }
  
    /**
     * Data written by plugins that is visible only to the plugin that wrote it. Requires the
     * `pluginData` to include the ID of the plugin.
     */
    pluginData?: unknown
  
    /**
     * Data written by plugins that is visible to all plugins. Requires the `pluginData` parameter to
     * include the string "shared".
     */
    sharedPluginData?: unknown
  
    /**
     * A mapping of field to the variables applied to this field. Most fields will only map to a single
     * `VariableAlias`. However, for properties like `fills`, `strokes`, `size`, `componentProperties`,
     * and `textRangeFills`, it is possible to have multiple variables bound to the field.
     */
    boundVariables?: {
      size?: {
        x?: VariableAlias
  
        y?: VariableAlias
      }
  
      individualStrokeWeights?: {
        top?: VariableAlias
  
        bottom?: VariableAlias
  
        left?: VariableAlias
  
        right?: VariableAlias
      }
  
      characters?: VariableAlias
  
      itemSpacing?: VariableAlias
  
      paddingLeft?: VariableAlias
  
      paddingRight?: VariableAlias
  
      paddingTop?: VariableAlias
  
      paddingBottom?: VariableAlias
  
      visible?: VariableAlias
  
      topLeftRadius?: VariableAlias
  
      topRightRadius?: VariableAlias
  
      bottomLeftRadius?: VariableAlias
  
      bottomRightRadius?: VariableAlias
  
      minWidth?: VariableAlias
  
      maxWidth?: VariableAlias
  
      minHeight?: VariableAlias
  
      maxHeight?: VariableAlias
  
      counterAxisSpacing?: VariableAlias
  
      opacity?: VariableAlias
  
      fontFamily?: VariableAlias[]
  
      fontSize?: VariableAlias[]
  
      fontStyle?: VariableAlias[]
  
      fontWeight?: VariableAlias[]
  
      letterSpacing?: VariableAlias[]
  
      lineHeight?: VariableAlias[]
  
      paragraphSpacing?: VariableAlias[]
  
      paragraphIndent?: VariableAlias[]
  
      fills?: VariableAlias[]
  
      strokes?: VariableAlias[]
  
      componentProperties?: { [key: string]: VariableAlias }
  
      textRangeFills?: VariableAlias[]
  
      effects?: VariableAlias[]
  
      layoutGrids?: VariableAlias[]
    }
  
    /**
     * A mapping of variable collection ID to mode ID representing the explicitly set modes for this
     * node.
     */
    explicitVariableModes?: { [key: string]: string }
  }
  
  export type HasChildrenTrait = {
    /**
     * An array of nodes that are direct children of this node
     */
    children: SubcanvasNode[]
  }
  
  export type HasLayoutTrait = {
    /**
     * Bounding box of the node in absolute space coordinates.
     */
    absoluteBoundingBox: Rectangle | null
  
    /**
     * The actual bounds of a node accounting for drop shadows, thick strokes, and anything else that
     * may fall outside the node's regular bounding box defined in `x`, `y`, `width`, and `height`. The
     * `x` and `y` inside this property represent the absolute position of the node on the page. This
     * value will be `null` if the node is invisible.
     */
    absoluteRenderBounds: Rectangle | null
  
    /**
     * Keep height and width constrained to same ratio.
     */
    preserveRatio?: boolean
  
    /**
     * Horizontal and vertical layout constraints for node.
     */
    constraints?: LayoutConstraint
  
    /**
     * The top two rows of a matrix that represents the 2D transform of this node relative to its
     * parent. The bottom row of the matrix is implicitly always (0, 0, 1). Use to transform coordinates
     * in geometry. Only present if `geometry=paths` is passed.
     */
    relativeTransform?: Transform
  
    /**
     * Width and height of element. This is different from the width and height of the bounding box in
     * that the absolute bounding box represents the element after scaling and rotation. Only present if
     * `geometry=paths` is passed.
     */
    size?: Vector
  
    /**
     * Determines if the layer should stretch along the parent's counter axis. This property is only
     * provided for direct children of auto-layout frames.
     *
     * - `INHERIT`
     * - `STRETCH`
     *
     * In previous versions of auto layout, determined how the layer is aligned inside an auto-layout
     * frame. This property is only provided for direct children of auto-layout frames.
     *
     * - `MIN`
     * - `CENTER`
     * - `MAX`
     * - `STRETCH`
     *
     * In horizontal auto-layout frames, "MIN" and "MAX" correspond to "TOP" and "BOTTOM". In vertical
     * auto-layout frames, "MIN" and "MAX" correspond to "LEFT" and "RIGHT".
     */
    layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX'
  
    /**
     * This property is applicable only for direct children of auto-layout frames, ignored otherwise.
     * Determines whether a layer should stretch along the parent's primary axis. A `0` corresponds to a
     * fixed size and `1` corresponds to stretch.
     */
    layoutGrow?: 0 | 1
  
    /**
     * Determines whether a layer's size and position should be determined by auto-layout settings or
     * manually adjustable.
     */
    layoutPositioning?: 'AUTO' | 'ABSOLUTE'
  
    /**
     * The minimum width of the frame. This property is only applicable for auto-layout frames or direct
     * children of auto-layout frames.
     */
    minWidth?: number
  
    /**
     * The maximum width of the frame. This property is only applicable for auto-layout frames or direct
     * children of auto-layout frames.
     */
    maxWidth?: number
  
    /**
     * The minimum height of the frame. This property is only applicable for auto-layout frames or
     * direct children of auto-layout frames.
     */
    minHeight?: number
  
    /**
     * The maximum height of the frame. This property is only applicable for auto-layout frames or
     * direct children of auto-layout frames.
     */
    maxHeight?: number
  
    /**
     * The horizontal sizing setting on this auto-layout frame or frame child.
     *
     * - `FIXED`
     * - `HUG`: only valid on auto-layout frames and text nodes
     * - `FILL`: only valid on auto-layout frame children
     */
    layoutSizingHorizontal?: 'FIXED' | 'HUG' | 'FILL'
  
    /**
     * The vertical sizing setting on this auto-layout frame or frame child.
     *
     * - `FIXED`
     * - `HUG`: only valid on auto-layout frames and text nodes
     * - `FILL`: only valid on auto-layout frame children
     */
    layoutSizingVertical?: 'FIXED' | 'HUG' | 'FILL'
  }
  
  export type HasFramePropertiesTrait = {
    /**
     * Whether or not this node clip content outside of its bounds
     */
    clipsContent: boolean
  
    /**
     * Background of the node. This is deprecated, as backgrounds for frames are now in the `fills`
     * field.
     *
     * @deprecated
     */
    background?: Paint[]
  
    /**
     * Background color of the node. This is deprecated, as frames now support more than a solid color
     * as a background. Please use the `fills` field instead.
     *
     * @deprecated
     */
    backgroundColor?: RGBA
  
    /**
     * An array of layout grids attached to this node (see layout grids section for more details). GROUP
     * nodes do not have this attribute
     */
    layoutGrids?: LayoutGrid[]
  
    /**
     * Whether a node has primary axis scrolling, horizontal or vertical.
     */
    overflowDirection?:
      | 'HORIZONTAL_SCROLLING'
      | 'VERTICAL_SCROLLING'
      | 'HORIZONTAL_AND_VERTICAL_SCROLLING'
      | 'NONE'
  
    /**
     * Whether this layer uses auto-layout to position its children.
     */
    layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  
    /**
     * Whether the primary axis has a fixed length (determined by the user) or an automatic length
     * (determined by the layout engine). This property is only applicable for auto-layout frames.
     */
    primaryAxisSizingMode?: 'FIXED' | 'AUTO'
  
    /**
     * Whether the counter axis has a fixed length (determined by the user) or an automatic length
     * (determined by the layout engine). This property is only applicable for auto-layout frames.
     */
    counterAxisSizingMode?: 'FIXED' | 'AUTO'
  
    /**
     * Determines how the auto-layout frame's children should be aligned in the primary axis direction.
     * This property is only applicable for auto-layout frames.
     */
    primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN'
  
    /**
     * Determines how the auto-layout frame's children should be aligned in the counter axis direction.
     * This property is only applicable for auto-layout frames.
     */
    counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE'
  
    /**
     * The padding between the left border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingLeft?: number
  
    /**
     * The padding between the right border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingRight?: number
  
    /**
     * The padding between the top border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingTop?: number
  
    /**
     * The padding between the bottom border of the frame and its children. This property is only
     * applicable for auto-layout frames.
     */
    paddingBottom?: number
  
    /**
     * The distance between children of the frame. Can be negative. This property is only applicable for
     * auto-layout frames.
     */
    itemSpacing?: number
  
    /**
     * Determines the canvas stacking order of layers in this frame. When true, the first layer will be
     * draw on top. This property is only applicable for auto-layout frames.
     */
    itemReverseZIndex?: boolean
  
    /**
     * Determines whether strokes are included in layout calculations. When true, auto-layout frames
     * behave like css "box-sizing: border-box". This property is only applicable for auto-layout
     * frames.
     */
    strokesIncludedInLayout?: boolean
  
    /**
     * Whether this auto-layout frame has wrapping enabled.
     */
    layoutWrap?: 'NO_WRAP' | 'WRAP'
  
    /**
     * The distance between wrapped tracks of an auto-layout frame. This property is only applicable for
     * auto-layout frames with `layoutWrap: "WRAP"`
     */
    counterAxisSpacing?: number
  
    /**
     * Determines how the auto-layout frame’s wrapped tracks should be aligned in the counter axis
     * direction. This property is only applicable for auto-layout frames with `layoutWrap: "WRAP"`.
     */
    counterAxisAlignContent?: 'AUTO' | 'SPACE_BETWEEN'
  }
  
  export type HasBlendModeAndOpacityTrait = {
    /**
     * How this node blends with nodes behind it in the scene (see blend mode section for more details)
     */
    blendMode: BlendMode
  
    /**
     * Opacity of the node
     */
    opacity?: number
  }
  
  export type HasExportSettingsTrait = {
    /**
     * An array of export settings representing images to export from the node.
     */
    exportSettings?: ExportSetting[]
  }
  
  export type HasGeometryTrait = MinimalFillsTrait &
    MinimalStrokesTrait & {
      /**
       * Map from ID to PaintOverride for looking up fill overrides. To see which regions are overriden,
       * you must use the `geometry=paths` option. Each path returned may have an `overrideID` which maps
       * to this table.
       */
      fillOverrideTable?: { [key: string]: PaintOverride | null }
  
      /**
       * Only specified if parameter `geometry=paths` is used. An array of paths representing the object
       * fill.
       */
      fillGeometry?: Path[]
  
      /**
       * Only specified if parameter `geometry=paths` is used. An array of paths representing the object
       * stroke.
       */
      strokeGeometry?: Path[]
  
      /**
       * A string enum describing the end caps of vector paths.
       */
      strokeCap?:
        | 'NONE'
        | 'ROUND'
        | 'SQUARE'
        | 'LINE_ARROW'
        | 'TRIANGLE_ARROW'
        | 'DIAMOND_FILLED'
        | 'CIRCLE_FILLED'
        | 'TRIANGLE_FILLED'
        | 'WASHI_TAPE_1'
        | 'WASHI_TAPE_2'
        | 'WASHI_TAPE_3'
        | 'WASHI_TAPE_4'
        | 'WASHI_TAPE_5'
        | 'WASHI_TAPE_6'
  
      /**
       * Only valid if `strokeJoin` is "MITER". The corner angle, in degrees, below which `strokeJoin`
       * will be set to "BEVEL" to avoid super sharp corners. By default this is 28.96 degrees.
       */
      strokeMiterAngle?: number
    }
  
  export type MinimalFillsTrait = {
    /**
     * An array of fill paints applied to the node.
     */
    fills: Paint[]
  
    /**
     * A mapping of a StyleType to style ID (see Style) of styles present on this node. The style ID can
     * be used to look up more information about the style in the top-level styles field.
     */
    styles?: { [key: string]: string }
  }
  
  export type MinimalStrokesTrait = {
    /**
     * An array of stroke paints applied to the node.
     */
    strokes?: Paint[]
  
    /**
     * The weight of strokes on the node.
     */
    strokeWeight?: number
  
    /**
     * Position of stroke relative to vector outline, as a string enum
     *
     * - `INSIDE`: stroke drawn inside the shape boundary
     * - `OUTSIDE`: stroke drawn outside the shape boundary
     * - `CENTER`: stroke drawn centered along the shape boundary
     */
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER'
  
    /**
     * A string enum with value of "MITER", "BEVEL", or "ROUND", describing how corners in vector paths
     * are rendered.
     */
    strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND'
  
    /**
     * An array of floating point numbers describing the pattern of dash length and gap lengths that the
     * vector stroke will use when drawn.
     *
     * For example a value of [1, 2] indicates that the stroke will be drawn with a dash of length 1
     * followed by a gap of length 2, repeated.
     */
    strokeDashes?: number[]
  }
  
  export type IndividualStrokesTrait = {
    /**
     * An object including the top, bottom, left, and right stroke weights. Only returned if individual
     * stroke weights are used.
     */
    individualStrokeWeights?: StrokeWeights
  }
  
  export type CornerTrait = {
    /**
     * Radius of each corner if a single radius is set for all corners
     */
    cornerRadius?: number
  
    /**
     * A value that lets you control how "smooth" the corners are. Ranges from 0 to 1. 0 is the default
     * and means that the corner is perfectly circular. A value of 0.6 means the corner matches the iOS
     * 7 "squircle" icon shape. Other values produce various other curves.
     */
    cornerSmoothing?: number
  
    /**
     * Array of length 4 of the radius of each corner of the frame, starting in the top left and
     * proceeding clockwise.
     *
     * Values are given in the order top-left, top-right, bottom-right, bottom-left.
     */
    rectangleCornerRadii?: number[]
  }
  
  export type HasEffectsTrait = {
    /**
     * An array of effects attached to this node (see effects section for more details)
     */
    effects: Effect[]
  }
  
  export type HasMaskTrait = {
    /**
     * Does this node mask sibling nodes in front of it?
     */
    isMask?: boolean
  
    /**
     * If this layer is a mask, this property describes the operation used to mask the layer's siblings.
     * The value may be one of the following:
     *
     * - ALPHA: the mask node's alpha channel will be used to determine the opacity of each pixel in the
     *   masked result.
     * - VECTOR: if the mask node has visible fill paints, every pixel inside the node's fill regions will
     *   be fully visible in the masked result. If the mask has visible stroke paints, every pixel
     *   inside the node's stroke regions will be fully visible in the masked result.
     * - LUMINANCE: the luminance value of each pixel of the mask node will be used to determine the
     *   opacity of that pixel in the masked result.
     */
    maskType?: 'ALPHA' | 'VECTOR' | 'LUMINANCE'
  
    /**
     * True if maskType is VECTOR. This field is deprecated; use maskType instead.
     *
     * @deprecated
     */
    isMaskOutline?: boolean
  }
  
  export type ComponentPropertiesTrait = {
    /**
     * A mapping of name to `ComponentPropertyDefinition` for every component property on this
     * component. Each property has a type, defaultValue, and other optional values.
     */
    componentPropertyDefinitions?: { [key: string]: ComponentPropertyDefinition }
  }
  
  export type TypePropertiesTrait = {
    /**
     * The raw characters in the text node.
     */
    characters: string
  
    /**
     * Style of text including font family and weight.
     */
    style: TypeStyle
  
    /**
     * The array corresponds to characters in the text box, where each element references the
     * 'styleOverrideTable' to apply specific styles to each character. The array's length can be less
     * than or equal to the number of characters due to the removal of trailing zeros. Elements with a
     * value of 0 indicate characters that use the default type style. If the array is shorter than the
     * total number of characters, the characters beyond the array's length also use the default style.
     */
    characterStyleOverrides: number[]
  
    /**
     * Internal property, preserved for backward compatibility. Avoid using this value.
     */
    layoutVersion?: number
  
    /**
     * Map from ID to TypeStyle for looking up style overrides.
     */
    styleOverrideTable: { [key: string]: TypeStyle }
  
    /**
     * An array with the same number of elements as lines in the text node, where lines are delimited by
     * newline or paragraph separator characters. Each element in the array corresponds to the list type
     * of a specific line. List types are represented as string enums with one of these possible
     * values:
     *
     * - `NONE`: Not a list item.
     * - `ORDERED`: Text is an ordered list (numbered).
     * - `UNORDERED`: Text is an unordered list (bulleted).
     */
    lineTypes: ('NONE' | 'ORDERED' | 'UNORDERED')[]
  
    /**
     * An array with the same number of elements as lines in the text node, where lines are delimited by
     * newline or paragraph separator characters. Each element in the array corresponds to the
     * indentation level of a specific line.
     */
    lineIndentations: number[]
  }
  
  export type HasTextSublayerTrait = {
    /**
     * Text contained within a text box.
     */
    characters: string
  }
  
  export type TransitionSourceTrait = {
    /**
     * Node ID of node to transition to in prototyping
     */
    transitionNodeID?: string
  
    /**
     * The duration of the prototyping transition on this node (in milliseconds). This will override the
     * default transition duration on the prototype, for this node.
     */
    transitionDuration?: number
  
    /**
     * The easing curve used in the prototyping transition on this node.
     */
    transitionEasing?: EasingType
  
    interactions?: Interaction[]
  }
  
  export type DevStatusTrait = {
    /**
     * Represents whether or not a node has a particular handoff (or dev) status applied to it.
     */
    devStatus?: {
      type: 'NONE' | 'READY_FOR_DEV' | 'COMPLETED'
  
      /**
       * An optional field where the designer can add more information about the design and what has
       * changed.
       */
      description?: string
    }
  }
  
  export type AnnotationsTrait = object
  
  export type FrameTraits = IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    HasFramePropertiesTrait &
    CornerTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait &
    IndividualStrokesTrait &
    DevStatusTrait &
    AnnotationsTrait
  
  export type DefaultShapeTraits = IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasLayoutTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait
  
  export type CornerRadiusShapeTraits = DefaultShapeTraits & CornerTrait
  
  export type RectangularShapeTraits = DefaultShapeTraits &
    CornerTrait &
    IndividualStrokesTrait &
    AnnotationsTrait
  
  export type Node =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | ConnectorNode
    | EllipseNode
    | EmbedNode
    | FrameNode
    | GroupNode
    | InstanceNode
    | LineNode
    | LinkUnfurlNode
    | RectangleNode
    | RegularPolygonNode
    | SectionNode
    | ShapeWithTextNode
    | SliceNode
    | StarNode
    | StickyNode
    | TableNode
    | TableCellNode
    | TextNode
    | VectorNode
    | WashiTapeNode
    | WidgetNode
    | DocumentNode
    | CanvasNode
  
  export type DocumentNode = {
    type: 'DOCUMENT'
  
    children: CanvasNode[]
  } & IsLayerTrait
  
  export type CanvasNode = {
    type: 'CANVAS'
  
    children: SubcanvasNode[]
  
    /**
     * Background color of the canvas.
     */
    backgroundColor: RGBA
  
    /**
     * Node ID that corresponds to the start frame for prototypes. This is deprecated with the
     * introduction of multiple flows. Please use the `flowStartingPoints` field.
     *
     * @deprecated
     */
    prototypeStartNodeID: string | null
  
    /**
     * An array of flow starting points sorted by its position in the prototype settings panel.
     */
    flowStartingPoints: FlowStartingPoint[]
  
    /**
     * The device used to view a prototype.
     */
    prototypeDevice: PrototypeDevice
  
    measurements?: Measurement[]
  } & IsLayerTrait &
    HasExportSettingsTrait
  
  export type SubcanvasNode =
    | BooleanOperationNode
    | ComponentNode
    | ComponentSetNode
    | ConnectorNode
    | EllipseNode
    | EmbedNode
    | FrameNode
    | GroupNode
    | InstanceNode
    | LineNode
    | LinkUnfurlNode
    | RectangleNode
    | RegularPolygonNode
    | SectionNode
    | ShapeWithTextNode
    | SliceNode
    | StarNode
    | StickyNode
    | TableNode
    | TableCellNode
    | TextNode
    | VectorNode
    | WashiTapeNode
    | WidgetNode
  
  export type BooleanOperationNode = {
    /**
     * The type of this node, represented by the string literal "BOOLEAN_OPERATION"
     */
    type: 'BOOLEAN_OPERATION'
  
    /**
     * A string enum indicating the type of boolean operation applied.
     */
    booleanOperation: 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE'
  } & IsLayerTrait &
    HasBlendModeAndOpacityTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    HasGeometryTrait &
    HasExportSettingsTrait &
    HasEffectsTrait &
    HasMaskTrait &
    TransitionSourceTrait
  
  export type SectionNode = {
    /**
     * The type of this node, represented by the string literal "SECTION"
     */
    type: 'SECTION'
  
    /**
     * Whether the contents of the section are visible
     */
    sectionContentsHidden: boolean
  } & IsLayerTrait &
    HasGeometryTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    DevStatusTrait
  
  export type FrameNode = {
    /**
     * The type of this node, represented by the string literal "FRAME"
     */
    type: 'FRAME'
  } & FrameTraits
  
  export type GroupNode = {
    /**
     * The type of this node, represented by the string literal "GROUP"
     */
    type: 'GROUP'
  } & FrameTraits
  
  export type ComponentNode = {
    /**
     * The type of this node, represented by the string literal "COMPONENT"
     */
    type: 'COMPONENT'
  } & FrameTraits &
    ComponentPropertiesTrait
  
  export type ComponentSetNode = {
    /**
     * The type of this node, represented by the string literal "COMPONENT_SET"
     */
    type: 'COMPONENT_SET'
  } & FrameTraits &
    ComponentPropertiesTrait
  
  export type VectorNode = {
    /**
     * The type of this node, represented by the string literal "VECTOR"
     */
    type: 'VECTOR'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait
  
  export type StarNode = {
    /**
     * The type of this node, represented by the string literal "STAR"
     */
    type: 'STAR'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait
  
  export type LineNode = {
    /**
     * The type of this node, represented by the string literal "LINE"
     */
    type: 'LINE'
  } & DefaultShapeTraits &
    AnnotationsTrait
  
  export type EllipseNode = {
    /**
     * The type of this node, represented by the string literal "ELLIPSE"
     */
    type: 'ELLIPSE'
  
    arcData: ArcData
  } & DefaultShapeTraits &
    AnnotationsTrait
  
  export type RegularPolygonNode = {
    /**
     * The type of this node, represented by the string literal "REGULAR_POLYGON"
     */
    type: 'REGULAR_POLYGON'
  } & CornerRadiusShapeTraits &
    AnnotationsTrait
  
  export type RectangleNode = {
    /**
     * The type of this node, represented by the string literal "RECTANGLE"
     */
    type: 'RECTANGLE'
  } & RectangularShapeTraits
  
  export type TextNode = {
    /**
     * The type of this node, represented by the string literal "TEXT"
     */
    type: 'TEXT'
  } & DefaultShapeTraits &
    TypePropertiesTrait &
    AnnotationsTrait
  
  export type TableNode = {
    /**
     * The type of this node, represented by the string literal "TABLE"
     */
    type: 'TABLE'
  } & IsLayerTrait &
    HasChildrenTrait &
    HasLayoutTrait &
    MinimalStrokesTrait &
    HasEffectsTrait &
    HasBlendModeAndOpacityTrait &
    HasExportSettingsTrait
  
  export type TableCellNode = {
    /**
     * The type of this node, represented by the string literal "TABLE_CELL"
     */
    type: 'TABLE_CELL'
  } & IsLayerTrait &
    MinimalFillsTrait &
    HasLayoutTrait &
    HasTextSublayerTrait
  
  export type SliceNode = {
    /**
     * The type of this node, represented by the string literal "SLICE"
     */
    type: 'SLICE'
  } & IsLayerTrait
  
  export type InstanceNode = {
    /**
     * The type of this node, represented by the string literal "INSTANCE"
     */
    type: 'INSTANCE'
  
    /**
     * ID of component that this instance came from.
     */
    componentId: string
  
    /**
     * If true, this node has been marked as exposed to its containing component or component set.
     */
    isExposedInstance?: boolean
  
    /**
     * IDs of instances that have been exposed to this node's level.
     */
    exposedInstances?: string[]
  
    /**
     * A mapping of name to `ComponentProperty` for all component properties on this instance. Each
     * property has a type, value, and other optional values.
     */
    componentProperties?: { [key: string]: ComponentProperty }
  
    /**
     * An array of all of the fields directly overridden on this instance. Inherited overrides are not
     * included.
     */
    overrides: Overrides[]
  } & FrameTraits
  
  export type EmbedNode = {
    /**
     * The type of this node, represented by the string literal "EMBED"
     */
    type: 'EMBED'
  } & IsLayerTrait &
    HasExportSettingsTrait
  
  export type LinkUnfurlNode = {
    /**
     * The type of this node, represented by the string literal "LINK_UNFURL"
     */
    type: 'LINK_UNFURL'
  } & IsLayerTrait &
    HasExportSettingsTrait
  
  export type StickyNode = {
    /**
     * The type of this node, represented by the string literal "STICKY"
     */
    type: 'STICKY'
  
    /**
     * If true, author name is visible.
     */
    authorVisible?: boolean
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    MinimalFillsTrait &
    HasMaskTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait
  
  export type ShapeWithTextNode = {
    /**
     * The type of this node, represented by the string literal "SHAPE_WITH_TEXT"
     */
    type: 'SHAPE_WITH_TEXT'
  
    /**
     * Geometric shape type. Most shape types have the same name as their tooltip but there are a few
     * exceptions. ENG_DATABASE: Cylinder, ENG_QUEUE: Horizontal cylinder, ENG_FILE: File, ENG_FOLDER:
     * Folder.
     */
    shapeType: ShapeType
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    MinimalFillsTrait &
    HasMaskTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait &
    CornerTrait &
    MinimalStrokesTrait
  
  export type ConnectorNode = {
    /**
     * The type of this node, represented by the string literal "CONNECTOR"
     */
    type: 'CONNECTOR'
  
    /**
     * The starting point of the connector.
     */
    connectorStart: ConnectorEndpoint
  
    /**
     * The ending point of the connector.
     */
    connectorEnd: ConnectorEndpoint
  
    /**
     * A string enum describing the end cap of the start of the connector.
     */
    connectorStartStrokeCap:
      | 'NONE'
      | 'LINE_ARROW'
      | 'TRIANGLE_ARROW'
      | 'DIAMOND_FILLED'
      | 'CIRCLE_FILLED'
      | 'TRIANGLE_FILLED'
  
    /**
     * A string enum describing the end cap of the end of the connector.
     */
    connectorEndStrokeCap:
      | 'NONE'
      | 'LINE_ARROW'
      | 'TRIANGLE_ARROW'
      | 'DIAMOND_FILLED'
      | 'CIRCLE_FILLED'
      | 'TRIANGLE_FILLED'
  
    /**
     * Connector line type.
     */
    connectorLineType: ConnectorLineType
  
    /**
     * Connector text background.
     */
    textBackground?: ConnectorTextBackground
  } & IsLayerTrait &
    HasLayoutTrait &
    HasBlendModeAndOpacityTrait &
    HasEffectsTrait &
    HasExportSettingsTrait &
    HasTextSublayerTrait &
    MinimalStrokesTrait
  
  export type WashiTapeNode = {
    /**
     * The type of this node, represented by the string literal "WASHI_TAPE"
     */
    type: 'WASHI_TAPE'
  } & DefaultShapeTraits
  
  export type WidgetNode = {
    /**
     * The type of this node, represented by the string literal "WIDGET"
     */
    type: 'WIDGET'
  } & IsLayerTrait &
    HasExportSettingsTrait &
    HasChildrenTrait
  
  /**
   * An RGB color
   */
  export type RGB = {
    /**
     * Red channel value, between 0 and 1.
     */
    r: number
  
    /**
     * Green channel value, between 0 and 1.
     */
    g: number
  
    /**
     * Blue channel value, between 0 and 1.
     */
    b: number
  }
  
  /**
   * An RGBA color
   */
  export type RGBA = {
    /**
     * Red channel value, between 0 and 1.
     */
    r: number
  
    /**
     * Green channel value, between 0 and 1.
     */
    g: number
  
    /**
     * Blue channel value, between 0 and 1.
     */
    b: number
  
    /**
     * Alpha channel value, between 0 and 1.
     */
    a: number
  }
  
  /**
   * A flow starting point used when launching a prototype to enter Presentation view.
   */
  export type FlowStartingPoint = {
    /**
     * Unique identifier specifying the frame.
     */
    nodeId: string
  
    /**
     * Name of flow.
     */
    name: string
  }
  
  /**
   * A width and a height.
   */
  export type Size = {
    /**
     * The width of a size.
     */
    width: number
  
    /**
     * The height of a size.
     */
    height: number
  }
  
  /**
   * The device used to view a prototype.
   */
  export type PrototypeDevice = {
    type: 'NONE' | 'PRESET' | 'CUSTOM' | 'PRESENTATION'
  
    size?: Size
  
    presetIdentifier?: string
  
    rotation: 'NONE' | 'CCW_90'
  }
  
  /**
   * Sizing constraint for exports.
   */
  export type Constraint = {
    /**
     * Type of constraint to apply:
     *
     * - `SCALE`: Scale by `value`.
     * - `WIDTH`: Scale proportionally and set width to `value`.
     * - `HEIGHT`: Scale proportionally and set height to `value`.
     */
    type: 'SCALE' | 'WIDTH' | 'HEIGHT'
  
    /**
     * See type property for effect of this field.
     */
    value: number
  }
  
  /**
   * An export setting.
   */
  export type ExportSetting = {
    suffix: string
  
    format: 'JPG' | 'PNG' | 'SVG' | 'PDF'
  
    constraint: Constraint
  }
  
  /**
   * This type is a string enum with the following possible values
   *
   * Normal blends:
   *
   * - `PASS_THROUGH` (only applicable to objects with children)
   * - `NORMAL`
   *
   * Darken:
   *
   * - `DARKEN`
   * - `MULTIPLY`
   * - `LINEAR_BURN`
   * - `COLOR_BURN`
   *
   * Lighten:
   *
   * - `LIGHTEN`
   * - `SCREEN`
   * - `LINEAR_DODGE`
   * - `COLOR_DODGE`
   *
   * Contrast:
   *
   * - `OVERLAY`
   * - `SOFT_LIGHT`
   * - `HARD_LIGHT`
   *
   * Inversion:
   *
   * - `DIFFERENCE`
   * - `EXCLUSION`
   *
   * Component:
   *
   * - `HUE`
   * - `SATURATION`
   * - `COLOR`
   * - `LUMINOSITY`
   */
  export type BlendMode =
    | 'PASS_THROUGH'
    | 'NORMAL'
    | 'DARKEN'
    | 'MULTIPLY'
    | 'LINEAR_BURN'
    | 'COLOR_BURN'
    | 'LIGHTEN'
    | 'SCREEN'
    | 'LINEAR_DODGE'
    | 'COLOR_DODGE'
    | 'OVERLAY'
    | 'SOFT_LIGHT'
    | 'HARD_LIGHT'
    | 'DIFFERENCE'
    | 'EXCLUSION'
    | 'HUE'
    | 'SATURATION'
    | 'COLOR'
    | 'LUMINOSITY'
  
  /**
   * A 2d vector.
   */
  export type Vector = {
    /**
     * X coordinate of the vector.
     */
    x: number
  
    /**
     * Y coordinate of the vector.
     */
    y: number
  }
  
  /**
   * A single color stop with its position along the gradient axis, color, and bound variables if any
   */
  export type ColorStop = {
    /**
     * Value between 0 and 1 representing position along gradient axis.
     */
    position: number
  
    /**
     * Color attached to corresponding position.
     */
    color: RGBA
  
    /**
     * The variables bound to a particular gradient stop
     */
    boundVariables?: { color?: VariableAlias }
  }
  
  /**
   * A transformation matrix is standard way in computer graphics to represent translation and
   * rotation. These are the top two rows of a 3x3 matrix. The bottom row of the matrix is assumed to
   * be [0, 0, 1]. This is known as an affine transform and is enough to represent translation,
   * rotation, and skew.
   *
   * The identity transform is [[1, 0, 0], [0, 1, 0]].
   *
   * A translation matrix will typically look like:
   *
   *     ;[
   *       [1, 0, tx],
   *       [0, 1, ty],
   *     ]
   *
   * And a rotation matrix will typically look like:
   *
   *     ;[
   *       [cos(angle), sin(angle), 0],
   *       [-sin(angle), cos(angle), 0],
   *     ]
   *
   * Another way to think about this transform is as three vectors:
   *
   * - The x axis (t[0][0], t[1][0])
   * - The y axis (t[0][1], t[1][1])
   * - The translation offset (t[0][2], t[1][2])
   *
   * The most common usage of the Transform matrix is the `relativeTransform property`. This
   * particular usage of the matrix has a few additional restrictions. The translation offset can take
   * on any value but we do enforce that the axis vectors are unit vectors (i.e. have length 1). The
   * axes are not required to be at 90° angles to each other.
   */
  export type Transform = number[][]
  
  /**
   * Image filters to apply to the node.
   */
  export type ImageFilters = {
    exposure?: number
  
    contrast?: number
  
    saturation?: number
  
    temperature?: number
  
    tint?: number
  
    highlights?: number
  
    shadows?: number
  }
  
  export type BasePaint = {
    /**
     * Is the paint enabled?
     */
    visible?: boolean
  
    /**
     * Overall opacity of paint (colors within the paint can also have opacity values which would blend
     * with this)
     */
    opacity?: number
  
    /**
     * How this node blends with nodes behind it in the scene
     */
    blendMode: BlendMode
  }
  
  export type SolidPaint = {
    /**
     * The string literal "SOLID" representing the paint's type. Always check the `type` before reading
     * other properties.
     */
    type: 'SOLID'
  
    /**
     * Solid color of the paint
     */
    color: RGBA
  
    /**
     * The variables bound to a particular field on this paint
     */
    boundVariables?: { color?: VariableAlias }
  } & BasePaint
  
  export type GradientPaint = {
    /**
     * The string literal representing the paint's type. Always check the `type` before reading other
     * properties.
     */
    type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND'
  
    /**
     * This field contains three vectors, each of which are a position in normalized object space
     * (normalized object space is if the top left corner of the bounding box of the object is (0, 0)
     * and the bottom right is (1,1)). The first position corresponds to the start of the gradient
     * (value 0 for the purposes of calculating gradient stops), the second position is the end of the
     * gradient (value 1), and the third handle position determines the width of the gradient.
     */
    gradientHandlePositions: Vector[]
  
    /**
     * Positions of key points along the gradient axis with the colors anchored there. Colors along the
     * gradient are interpolated smoothly between neighboring gradient stops.
     */
    gradientStops: ColorStop[]
  } & BasePaint
  
  export type ImagePaint = {
    /**
     * The string literal "IMAGE" representing the paint's type. Always check the `type` before reading
     * other properties.
     */
    type: 'IMAGE'
  
    /**
     * Image scaling mode.
     */
    scaleMode: 'FILL' | 'FIT' | 'TILE' | 'STRETCH'
  
    /**
     * A reference to an image embedded in this node. To download the image using this reference, use
     * the `GET file images` endpoint to retrieve the mapping from image references to image URLs.
     */
    imageRef: string
  
    /**
     * Affine transform applied to the image, only present if `scaleMode` is `STRETCH`
     */
    imageTransform?: Transform
  
    /**
     * Amount image is scaled by in tiling, only present if scaleMode is `TILE`.
     */
    scalingFactor?: number
  
    /**
     * Defines what image filters have been applied to this paint, if any. If this property is not
     * defined, no filters have been applied.
     */
    filters?: ImageFilters
  
    /**
     * Image rotation, in degrees.
     */
    rotation?: number
  
    /**
     * A reference to an animated GIF embedded in this node. To download the image using this reference,
     * use the `GET file images` endpoint to retrieve the mapping from image references to image URLs.
     */
    gifRef?: string
  } & BasePaint
  
  export type Paint = SolidPaint | GradientPaint | ImagePaint
  
  /**
   * Layout constraint relative to containing Frame
   */
  export type LayoutConstraint = {
    /**
     * Vertical constraint (relative to containing frame) as an enum:
     *
     * - `TOP`: Node is laid out relative to top of the containing frame
     * - `BOTTOM`: Node is laid out relative to bottom of the containing frame
     * - `CENTER`: Node is vertically centered relative to containing frame
     * - `TOP_BOTTOM`: Both top and bottom of node are constrained relative to containing frame (node
     *   stretches with frame)
     * - `SCALE`: Node scales vertically with containing frame
     */
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE'
  
    /**
     * Horizontal constraint (relative to containing frame) as an enum:
     *
     * - `LEFT`: Node is laid out relative to left of the containing frame
     * - `RIGHT`: Node is laid out relative to right of the containing frame
     * - `CENTER`: Node is horizontally centered relative to containing frame
     * - `LEFT_RIGHT`: Both left and right of node are constrained relative to containing frame (node
     *   stretches with frame)
     * - `SCALE`: Node scales horizontally with containing frame
     */
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE'
  }
  
  /**
   * A rectangle that expresses a bounding box in absolute coordinates.
   */
  export type Rectangle = {
    /**
     * X coordinate of top left corner of the rectangle.
     */
    x: number
  
    /**
     * Y coordinate of top left corner of the rectangle.
     */
    y: number
  
    /**
     * Width of the rectangle.
     */
    width: number
  
    /**
     * Height of the rectangle.
     */
    height: number
  }
  
  /**
   * Guides to align and place objects within a frames.
   */
  export type LayoutGrid = {
    /**
     * Orientation of the grid as a string enum
     *
     * - `COLUMNS`: Vertical grid
     * - `ROWS`: Horizontal grid
     * - `GRID`: Square grid
     */
    pattern: 'COLUMNS' | 'ROWS' | 'GRID'
  
    /**
     * Width of column grid or height of row grid or square grid spacing.
     */
    sectionSize: number
  
    /**
     * Is the grid currently visible?
     */
    visible: boolean
  
    /**
     * Color of the grid
     */
    color: RGBA
  
    /**
     * Positioning of grid as a string enum
     *
     * - `MIN`: Grid starts at the left or top of the frame
     * - `MAX`: Grid starts at the right or bottom of the frame
     * - `STRETCH`: Grid is stretched to fit the frame
     * - `CENTER`: Grid is center aligned
     */
    alignment: 'MIN' | 'MAX' | 'STRETCH' | 'CENTER'
  
    /**
     * Spacing in between columns and rows
     */
    gutterSize: number
  
    /**
     * Spacing before the first column or row
     */
    offset: number
  
    /**
     * Number of columns or rows
     */
    count: number
  
    /**
     * The variables bound to a particular field on this layout grid
     */
    boundVariables?: {
      gutterSize?: VariableAlias
  
      numSections?: VariableAlias
  
      sectionSize?: VariableAlias
  
      offset?: VariableAlias
    }
  }
  
  /**
   * Base properties shared by all shadow effects
   */
  export type BaseShadowEffect = {
    /**
     * The color of the shadow
     */
    color: RGBA
  
    /**
     * Blend mode of the shadow
     */
    blendMode: BlendMode
  
    /**
     * How far the shadow is projected in the x and y directions
     */
    offset: Vector
  
    /**
     * Radius of the blur effect (applies to shadows as well)
     */
    radius: number
  
    /**
     * The distance by which to expand (or contract) the shadow.
     *
     * For drop shadows, a positive `spread` value creates a shadow larger than the node, whereas a
     * negative value creates a shadow smaller than the node.
     *
     * For inner shadows, a positive `spread` value contracts the shadow. Spread values are only
     * accepted on rectangles and ellipses, or on frames, components, and instances with visible fill
     * paints and `clipsContent` enabled. When left unspecified, the default value is 0.
     */
    spread?: number
  
    /**
     * Whether this shadow is visible.
     */
    visible: boolean
  
    /**
     * The variables bound to a particular field on this shadow effect
     */
    boundVariables?: {
      radius?: VariableAlias
  
      spread?: VariableAlias
  
      color?: VariableAlias
  
      offsetX?: VariableAlias
  
      offsetY?: VariableAlias
    }
  }
  
  export type DropShadowEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type: 'DROP_SHADOW'
  
    /**
     * Whether to show the shadow behind translucent or transparent pixels
     */
    showShadowBehindNode: boolean
  } & BaseShadowEffect
  
  export type InnerShadowEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type?: 'INNER_SHADOW'
  } & BaseShadowEffect
  
  /**
   * A blur effect
   */
  export type BlurEffect = {
    /**
     * A string literal representing the effect's type. Always check the type before reading other
     * properties.
     */
    type: 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  
    /**
     * Whether this blur is active.
     */
    visible: boolean
  
    /**
     * Radius of the blur effect
     */
    radius: number
  
    /**
     * The variables bound to a particular field on this blur effect
     */
    boundVariables?: { radius?: VariableAlias }
  }
  
  export type Effect = DropShadowEffect | InnerShadowEffect | BlurEffect
  
  /**
   * A set of properties that can be applied to nodes and published. Styles for a property can be
   * created in the corresponding property's panel while editing a file.
   */
  export type Style = {
    /**
     * The key of the style
     */
    key: string
  
    /**
     * Name of the style
     */
    name: string
  
    /**
     * Description of the style
     */
    description: string
  
    /**
     * Whether this style is a remote style that doesn't live in this file
     */
    remote: boolean
  
    styleType: StyleType
  }
  
  /**
   * This type is a string enum with the following possible values:
   *
   * - `EASE_IN`: Ease in with an animation curve similar to CSS ease-in.
   * - `EASE_OUT`: Ease out with an animation curve similar to CSS ease-out.
   * - `EASE_IN_AND_OUT`: Ease in and then out with an animation curve similar to CSS ease-in-out.
   * - `LINEAR`: No easing, similar to CSS linear.
   * - `EASE_IN_BACK`: Ease in with an animation curve that moves past the initial keyframe's value and
   *   then accelerates as it reaches the end.
   * - `EASE_OUT_BACK`: Ease out with an animation curve that starts fast, then slows and goes past the
   *   ending keyframe's value.
   * - `EASE_IN_AND_OUT_BACK`: Ease in and then out with an animation curve that overshoots the initial
   *   keyframe's value, then accelerates quickly before it slows and overshoots the ending keyframes
   *   value.
   * - `CUSTOM_CUBIC_BEZIER`: User-defined cubic bezier curve.
   * - `GENTLE`: Gentle animation similar to react-spring.
   * - `QUICK`: Quick spring animation, great for toasts and notifications.
   * - `BOUNCY`: Bouncy spring, for delightful animations like a heart bounce.
   * - `SLOW`: Slow spring, useful as a steady, natural way to scale up fullscreen content.
   * - `CUSTOM_SPRING`: User-defined spring animation.
   */
  export type EasingType =
    | 'EASE_IN'
    | 'EASE_OUT'
    | 'EASE_IN_AND_OUT'
    | 'LINEAR'
    | 'EASE_IN_BACK'
    | 'EASE_OUT_BACK'
    | 'EASE_IN_AND_OUT_BACK'
    | 'CUSTOM_CUBIC_BEZIER'
    | 'GENTLE'
    | 'QUICK'
    | 'BOUNCY'
    | 'SLOW'
    | 'CUSTOM_SPRING'
  
  /**
   * Individual stroke weights
   */
  export type StrokeWeights = {
    /**
     * The top stroke weight.
     */
    top: number
  
    /**
     * The right stroke weight.
     */
    right: number
  
    /**
     * The bottom stroke weight.
     */
    bottom: number
  
    /**
     * The left stroke weight.
     */
    left: number
  }
  
  /**
   * Paint metadata to override default paints.
   */
  export type PaintOverride = {
    /**
     * Paints applied to characters.
     */
    fills?: Paint[]
  
    /**
     * ID of style node, if any, that this inherits fill data from.
     */
    inheritFillStyleId?: string
  }
  
  /**
   * Defines a single path
   */
  export type Path = {
    /**
     * A series of path commands that encodes how to draw the path.
     */
    path: string
  
    /**
     * The winding rule for the path (same as in SVGs). This determines whether a given point in space
     * is inside or outside the path.
     */
    windingRule: 'NONZERO' | 'EVENODD'
  
    /**
     * If there is a per-region fill, this refers to an ID in the `fillOverrideTable`.
     */
    overrideID?: number
  }
  
  /**
   * Information about the arc properties of an ellipse. 0° is the x axis and increasing angles rotate
   * clockwise.
   */
  export type ArcData = {
    /**
     * Start of the sweep in radians.
     */
    startingAngle: number
  
    /**
     * End of the sweep in radians.
     */
    endingAngle: number
  
    /**
     * Inner radius value between 0 and 1
     */
    innerRadius: number
  }
  
  /**
   * A link to either a URL or another frame (node) in the document.
   */
  export type Hyperlink = {
    /**
     * The type of hyperlink. Can be either `URL` or `NODE`.
     */
    type: 'URL' | 'NODE'
  
    /**
     * The URL that the hyperlink points to, if `type` is `URL`.
     */
    url?: string
  
    /**
     * The ID of the node that the hyperlink points to, if `type` is `NODE`.
     */
    nodeID?: string
  }
  
  /**
   * Metadata for character formatting.
   */
  export type TypeStyle = {
    /**
     * Font family of text (standard name).
     */
    fontFamily?: string
  
    /**
     * PostScript font name.
     */
    fontPostScriptName?: string | null
  
    /**
     * Describes visual weight or emphasis, such as Bold or Italic.
     */
    fontStyle?: string
  
    /**
     * Space between paragraphs in px, 0 if not present.
     */
    paragraphSpacing?: number
  
    /**
     * Paragraph indentation in px, 0 if not present.
     */
    paragraphIndent?: number
  
    /**
     * Space between list items in px, 0 if not present.
     */
    listSpacing?: number
  
    /**
     * Whether or not text is italicized.
     */
    italic?: boolean
  
    /**
     * Numeric font weight.
     */
    fontWeight?: number
  
    /**
     * Font size in px.
     */
    fontSize?: number
  
    /**
     * Text casing applied to the node, default is the original casing.
     */
    textCase?: 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED'
  
    /**
     * Text decoration applied to the node, default is none.
     */
    textDecoration?: 'NONE' | 'STRIKETHROUGH' | 'UNDERLINE'
  
    /**
     * Dimensions along which text will auto resize, default is that the text does not auto-resize.
     * TRUNCATE means that the text will be shortened and trailing text will be replaced with "…" if the
     * text contents is larger than the bounds. `TRUNCATE` as a return value is deprecated and will be
     * removed in a future version. Read from `textTruncation` instead.
     */
    textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
  
    /**
     * Whether this text node will truncate with an ellipsis when the text contents is larger than the
     * text node.
     */
    textTruncation?: 'DISABLED' | 'ENDING'
  
    /**
     * When `textTruncation: "ENDING"` is set, `maxLines` determines how many lines a text node can grow
     * to before it truncates.
     */
    maxLines?: number
  
    /**
     * Horizontal text alignment as string enum.
     */
    textAlignHorizontal?: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED'
  
    /**
     * Vertical text alignment as string enum.
     */
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM'
  
    /**
     * Space between characters in px.
     */
    letterSpacing?: number
  
    /**
     * An array of fill paints applied to the characters.
     */
    fills?: Paint[]
  
    /**
     * Link to a URL or frame.
     */
    hyperlink?: Hyperlink
  
    /**
     * A map of OpenType feature flags to 1 or 0, 1 if it is enabled and 0 if it is disabled. Note that
     * some flags aren't reflected here. For example, SMCP (small caps) is still represented by the
     * `textCase` field.
     */
    opentypeFlags?: { [key: string]: number }
  
    /**
     * Line height in px.
     */
    lineHeightPx?: number
  
    /**
     * Line height as a percentage of normal line height. This is deprecated; in a future version of the
     * API only lineHeightPx and lineHeightPercentFontSize will be returned.
     */
    lineHeightPercent?: number
  
    /**
     * Line height as a percentage of the font size. Only returned when `lineHeightPercent` (deprecated)
     * is not 100.
     */
    lineHeightPercentFontSize?: number
  
    /**
     * The unit of the line height value specified by the user.
     */
    lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%'
  
    /**
     * The variables bound to a particular field on this style
     */
    boundVariables?: {
      fontFamily?: VariableAlias
  
      fontSize?: VariableAlias
  
      fontStyle?: VariableAlias
  
      fontWeight?: VariableAlias
  
      letterSpacing?: VariableAlias
  
      lineHeight?: VariableAlias
  
      paragraphSpacing?: VariableAlias
  
      paragraphIndent?: VariableAlias
    }
  
    /**
     * Whether or not this style has overrides over a text style. The possible fields to override are
     * semanticWeight, semanticItalic, hyperlink, and textDecoration. If this is true, then those fields
     * are overrides if present.
     */
    isOverrideOverTextStyle?: boolean
  
    /**
     * Indicates how the font weight was overridden when there is a text style override.
     */
    semanticWeight?: 'BOLD' | 'NORMAL'
  
    /**
     * Indicates how the font style was overridden when there is a text style override.
     */
    semanticItalic?: 'ITALIC' | 'NORMAL'
  }
  
  /**
   * Component property type.
   */
  export type ComponentPropertyType = 'BOOLEAN' | 'INSTANCE_SWAP' | 'TEXT' | 'VARIANT'
  
  /**
   * Instance swap preferred value.
   */
  export type InstanceSwapPreferredValue = {
    /**
     * Type of node for this preferred value.
     */
    type: 'COMPONENT' | 'COMPONENT_SET'
  
    /**
     * Key of this component or component set.
     */
    key: string
  }
  
  /**
   * A property of a component.
   */
  export type ComponentPropertyDefinition = {
    /**
     * Type of this component property.
     */
    type: ComponentPropertyType
  
    /**
     * Initial value of this property for instances.
     */
    defaultValue: boolean | string
  
    /**
     * All possible values for this property. Only exists on VARIANT properties.
     */
    variantOptions?: string[]
  
    /**
     * Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`.
     */
    preferredValues?: InstanceSwapPreferredValue[]
  }
  
  /**
   * A property of a component.
   */
  export type ComponentProperty = {
    /**
     * Type of this component property.
     */
    type: ComponentPropertyType
  
    /**
     * Value of the property for this component instance.
     */
    value: boolean | string
  
    /**
     * Preferred values for this property. Only applicable if type is `INSTANCE_SWAP`.
     */
    preferredValues?: InstanceSwapPreferredValue[]
  
    /**
     * The variables bound to a particular field on this component property
     */
    boundVariables?: { value?: VariableAlias }
  }
  
  /**
   * Fields directly overridden on an instance. Inherited overrides are not included.
   */
  export type Overrides = {
    /**
     * A unique ID for a node.
     */
    id: string
  
    /**
     * An array of properties.
     */
    overriddenFields: string[]
  }
  
  /**
   * Geometric shape type.
   */
  export type ShapeType =
    | 'SQUARE'
    | 'ELLIPSE'
    | 'ROUNDED_RECTANGLE'
    | 'DIAMOND'
    | 'TRIANGLE_UP'
    | 'TRIANGLE_DOWN'
    | 'PARALLELOGRAM_RIGHT'
    | 'PARALLELOGRAM_LEFT'
    | 'ENG_DATABASE'
    | 'ENG_QUEUE'
    | 'ENG_FILE'
    | 'ENG_FOLDER'
    | 'TRAPEZOID'
    | 'PREDEFINED_PROCESS'
    | 'SHIELD'
    | 'DOCUMENT_SINGLE'
    | 'DOCUMENT_MULTIPLE'
    | 'MANUAL_INPUT'
    | 'HEXAGON'
    | 'CHEVRON'
    | 'PENTAGON'
    | 'OCTAGON'
    | 'STAR'
    | 'PLUS'
    | 'ARROW_LEFT'
    | 'ARROW_RIGHT'
    | 'SUMMING_JUNCTION'
    | 'OR'
    | 'SPEECH_BUBBLE'
    | 'INTERNAL_STORAGE'
  
  /**
   * Stores canvas location for a connector start/end point.
   */
  export type ConnectorEndpoint =
    | {
        /**
         * Node ID that this endpoint attaches to.
         */
        endpointNodeId?: string
  
        /**
         * The position of the endpoint relative to the node.
         */
        position?: Vector
      }
    | {
        /**
         * Node ID that this endpoint attaches to.
         */
        endpointNodeId?: string
  
        /**
         * The magnet type is a string enum.
         */
        magnet?: 'AUTO' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'CENTER'
      }
  
  /**
   * Connector line type.
   */
  export type ConnectorLineType = 'STRAIGHT' | 'ELBOWED'
  
  export type ConnectorTextBackground = CornerTrait & MinimalFillsTrait
  
  /**
   * A description of a main component. Helps you identify which component instances are attached to.
   */
  export type Component = {
    /**
     * The key of the component
     */
    key: string
  
    /**
     * Name of the component
     */
    name: string
  
    /**
     * The description of the component as entered in the editor
     */
    description: string
  
    /**
     * The ID of the component set if the component belongs to one
     */
    componentSetId?: string
  
    /**
     * An array of documentation links attached to this component
     */
    documentationLinks: DocumentationLink[]
  
    /**
     * Whether this component is a remote component that doesn't live in this file
     */
    remote: boolean
  }
  
  /**
   * A description of a component set, which is a node containing a set of variants of a component.
   */
  export type ComponentSet = {
    /**
     * The key of the component set
     */
    key: string
  
    /**
     * Name of the component set
     */
    name: string
  
    /**
     * The description of the component set as entered in the editor
     */
    description: string
  
    /**
     * An array of documentation links attached to this component set
     */
    documentationLinks?: DocumentationLink[]
  
    /**
     * Whether this component set is a remote component set that doesn't live in this file
     */
    remote?: boolean
  }
  
  /**
   * Represents a link to documentation for a component or component set.
   */
  export type DocumentationLink = {
    /**
     * Should be a valid URI (e.g. https://www.figma.com).
     */
    uri: string
  }
  
  /**
   * Contains a variable alias
   */
  export type VariableAlias = {
    type: 'VARIABLE_ALIAS'
  
    /**
     * The id of the variable that the current variable is aliased to. This variable can be a local or
     * remote variable, and both can be retrieved via the GET /v1/files/:file_key/variables/local
     * endpoint.
     */
    id: string
  }
  
  /**
   * An interaction in the Figma viewer, containing a trigger and one or more actions.
   */
  export type Interaction = {
    /**
     * The user event that initiates the interaction.
     */
    trigger: Trigger | null
  
    /**
     * The actions that are performed when the trigger is activated.
     */
    actions?: Action[]
  }
  
  /**
   * The `"ON_HOVER"` and `"ON_PRESS"` trigger types revert the navigation when the trigger is
   * finished (the result is temporary). `"MOUSE_ENTER"`, `"MOUSE_LEAVE"`, `"MOUSE_UP"` and
   * `"MOUSE_DOWN"` are permanent, one-way navigation. The `delay` parameter requires the trigger to
   * be held for a certain duration of time before the action occurs. Both `timeout` and `delay`
   * values are in milliseconds. The `"ON_MEDIA_HIT"` and `"ON_MEDIA_END"` trigger types can only
   * trigger from a video. They fire when a video reaches a certain time or ends. The `timestamp`
   * value is in seconds.
   */
  export type Trigger =
    | { type: 'ON_CLICK' | 'ON_HOVER' | 'ON_PRESS' | 'ON_DRAG' }
    | AfterTimeoutTrigger
    | {
        type: 'MOUSE_ENTER' | 'MOUSE_LEAVE' | 'MOUSE_UP' | 'MOUSE_DOWN'
  
        delay: number
  
        /**
         * Whether this is a [deprecated
         * version](https://help.figma.com/hc/en-us/articles/360040035834-Prototype-triggers#h_01HHN04REHJNP168R26P1CMP0A)
         * of the trigger that was left unchanged for backwards compatibility. If not present, the trigger
         * is the latest version.
         */
        deprecatedVersion?: boolean
      }
    | OnKeyDownTrigger
    | OnMediaHitTrigger
    | { type: 'ON_MEDIA_END' }
  
  export type AfterTimeoutTrigger = {
    type: 'AFTER_TIMEOUT'
  
    timeout: number
  }
  
  export type OnKeyDownTrigger = {
    type: 'ON_KEY_DOWN'
  
    device: 'KEYBOARD' | 'XBOX_ONE' | 'PS4' | 'SWITCH_PRO' | 'UNKNOWN_CONTROLLER'
  
    keyCodes: number[]
  }
  
  export type OnMediaHitTrigger = {
    type: 'ON_MEDIA_HIT'
  
    mediaHitTime: number
  }
  
  /**
   * An action that is performed when a trigger is activated.
   */
  export type Action =
    | { type: 'BACK' | 'CLOSE' }
    | OpenURLAction
    | UpdateMediaRuntimeAction
    | SetVariableAction
    | SetVariableModeAction
    | ConditionalAction
    | NodeAction
  
  /**
   * An action that opens a URL.
   */
  export type OpenURLAction = {
    type: 'URL'
  
    url: string
  }
  
  /**
   * An action that affects a video node in the Figma viewer. For example, to play, pause, or skip.
   */
  export type UpdateMediaRuntimeAction =
    | {
        type: 'UPDATE_MEDIA_RUNTIME'
  
        destinationId: string | null
  
        mediaAction: 'PLAY' | 'PAUSE' | 'TOGGLE_PLAY_PAUSE' | 'MUTE' | 'UNMUTE' | 'TOGGLE_MUTE_UNMUTE'
      }
    | {
        type: 'UPDATE_MEDIA_RUNTIME'
  
        destinationId?: string | null
  
        mediaAction: 'SKIP_FORWARD' | 'SKIP_BACKWARD'
  
        amountToSkip: number
      }
    | {
        type: 'UPDATE_MEDIA_RUNTIME'
  
        destinationId?: string | null
  
        mediaAction: 'SKIP_TO'
  
        newTimestamp: number
      }
  
  /**
   * An action that navigates to a specific node in the Figma viewer.
   */
  export type NodeAction = {
    type: 'NODE'
  
    destinationId: string | null
  
    navigation: Navigation
  
    transition: Transition | null
  
    /**
     * Whether the scroll offsets of any scrollable elements in the current screen or overlay are
     * preserved when navigating to the destination. This is applicable only if the layout of both the
     * current frame and its destination are the same.
     */
    preserveScrollPosition?: boolean
  
    /**
     * Applicable only when `navigation` is `"OVERLAY"` and the destination is a frame with
     * `overlayPosition` equal to `"MANUAL"`. This value represents the offset by which the overlay is
     * opened relative to this node.
     */
    overlayRelativePosition?: Vector
  
    /**
     * When true, all videos within the destination frame will reset their memorized playback position
     * to 00:00 before starting to play.
     */
    resetVideoPosition?: boolean
  
    /**
     * Whether the scroll offsets of any scrollable elements in the current screen or overlay reset when
     * navigating to the destination. This is applicable only if the layout of both the current frame
     * and its destination are the same.
     */
    resetScrollPosition?: boolean
  
    /**
     * Whether the state of any interactive components in the current screen or overlay reset when
     * navigating to the destination. This is applicable if there are interactive components in the
     * destination frame.
     */
    resetInteractiveComponents?: boolean
  }
  
  /**
   * The method of navigation. The possible values are:
   *
   * - `"NAVIGATE"`: Replaces the current screen with the destination, also closing all overlays.
   * - `"OVERLAY"`: Opens the destination as an overlay on the current screen.
   * - `"SWAP"`: On an overlay, replaces the current (topmost) overlay with the destination. On a
   *   top-level frame, behaves the same as `"NAVIGATE"` except that no entry is added to the
   *   navigation history.
   * - `"SCROLL_TO"`: Scrolls to the destination on the current screen.
   * - `"CHANGE_TO"`: Changes the closest ancestor instance of source node to the specified variant.
   */
  export type Navigation = 'NAVIGATE' | 'SWAP' | 'OVERLAY' | 'SCROLL_TO' | 'CHANGE_TO'
  
  export type Transition = SimpleTransition | DirectionalTransition
  
  /**
   * Describes an animation used when navigating in a prototype.
   */
  export type SimpleTransition = {
    type: 'DISSOLVE' | 'SMART_ANIMATE' | 'SCROLL_ANIMATE'
  
    /**
     * The duration of the transition in milliseconds.
     */
    duration: number
  
    /**
     * The easing curve of the transition.
     */
    easing: Easing
  }
  
  /**
   * Describes an animation used when navigating in a prototype.
   */
  export type DirectionalTransition = {
    type: 'MOVE_IN' | 'MOVE_OUT' | 'PUSH' | 'SLIDE_IN' | 'SLIDE_OUT'
  
    direction: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'
  
    /**
     * The duration of the transition in milliseconds.
     */
    duration: number
  
    /**
     * The easing curve of the transition.
     */
    easing: Easing
  
    /**
     * When the transition `type` is `"SMART_ANIMATE"` or when `matchLayers` is `true`, then the
     * transition will be performed using smart animate, which attempts to match corresponding layers an
     * interpolate other properties during the animation.
     */
    matchLayers?: boolean
  }
  
  /**
   * Describes an easing curve.
   */
  export type Easing = {
    /**
     * The type of easing curve.
     */
    type: EasingType
  
    /**
     * A cubic bezier curve that defines the easing.
     */
    easingFunctionCubicBezier?: {
      /**
       * The x component of the first control point.
       */
      x1: number
  
      /**
       * The y component of the first control point.
       */
      y1: number
  
      /**
       * The x component of the second control point.
       */
      x2: number
  
      /**
       * The y component of the second control point.
       */
      y2: number
    }
  
    /**
     * A spring function that defines the easing.
     */
    easingFunctionSpring?: {
      mass: number
  
      stiffness: number
  
      damping: number
    }
  }
  
  /**
   * Sets a variable to a specific value.
   */
  export type SetVariableAction = {
    type: 'SET_VARIABLE'
  
    variableId: string | null
  
    variableValue?: VariableData
  }
  
  /**
   * Sets a variable to a specific mode.
   */
  export type SetVariableModeAction = {
    type: 'SET_VARIABLE_MODE'
  
    variableCollectionId?: string | null
  
    variableModeId?: string | null
  }
  
  /**
   * Checks if a condition is met before performing certain actions by using an if/else conditional
   * statement.
   */
  export type ConditionalAction = {
    type: 'CONDITIONAL'
  
    conditionalBlocks: ConditionalBlock[]
  }
  
  /**
   * A value to set a variable to during prototyping.
   */
  export type VariableData = {
    type?: VariableDataType
  
    resolvedType?: VariableResolvedDataType
  
    value?: boolean | number | string | RGB | RGBA | VariableAlias | Expression
  }
  
  /**
   * Defines the types of data a VariableData object can hold
   */
  export type VariableDataType =
    | 'BOOLEAN'
    | 'FLOAT'
    | 'STRING'
    | 'COLOR'
    | 'VARIABLE_ALIAS'
    | 'EXPRESSION'
  
  /**
   * Defines the types of data a VariableData object can eventually equal
   */
  export type VariableResolvedDataType = 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  
  /**
   * Defines the [Expression](https://help.figma.com/hc/en-us/articles/15253194385943) object, which
   * contains a list of `VariableData` objects strung together by operators (`ExpressionFunction`).
   */
  export type Expression = {
    expressionFunction: ExpressionFunction
  
    expressionArguments: VariableData[]
  }
  
  /**
   * Defines the list of operators available to use in an Expression.
   */
  export type ExpressionFunction =
    | 'ADDITION'
    | 'SUBTRACTION'
    | 'MULTIPLICATION'
    | 'DIVISION'
    | 'EQUALS'
    | 'NOT_EQUAL'
    | 'LESS_THAN'
    | 'LESS_THAN_OR_EQUAL'
    | 'GREATER_THAN'
    | 'GREATER_THAN_OR_EQUAL'
    | 'AND'
    | 'OR'
    | 'VAR_MODE_LOOKUP'
    | 'NEGATE'
    | 'NOT'
  
  /**
   * Either the if or else conditional blocks. The if block contains a condition to check. If that
   * condition is met then it will run those list of actions, else it will run the actions in the else
   * block.
   */
  export type ConditionalBlock = {
    condition?: VariableData
  
    actions: Action[]
  }
  
  /**
   * A pinned distance between two nodes in Dev Mode
   */
  export type Measurement = {
    id: string
  
    start: MeasurementStartEnd
  
    end: MeasurementStartEnd
  
    offset: MeasurementOffsetInner | MeasurementOffsetOuter
  
    /**
     * When manually overridden, the displayed value of the measurement
     */
    freeText?: string
  }
  
  /**
   * The node and side a measurement is pinned to
   */
  export type MeasurementStartEnd = {
    nodeId: string
  
    side: 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'
  }
  
  /**
   * Measurement offset relative to the inside of the start node
   */
  export type MeasurementOffsetInner = {
    type: 'INNER'
  
    relative: number
  }
  
  /**
   * Measurement offset relative to the outside of the start node
   */
  export type MeasurementOffsetOuter = {
    type: 'OUTER'
  
    fixed: number
  }
  
  /**
   * Position of a comment relative to the frame to which it is attached.
   */
  export type FrameOffset = {
    /**
     * Unique id specifying the frame.
     */
    node_id: string
  
    /**
     * 2D vector offset within the frame from the top-left corner.
     */
    node_offset: Vector
  }
  
  /**
   * Position of a region comment on the canvas.
   */
  export type Region = {
    /**
     * X coordinate of the position.
     */
    x: number
  
    /**
     * Y coordinate of the position.
     */
    y: number
  
    /**
     * The height of the comment region. Must be greater than 0.
     */
    region_height: number
  
    /**
     * The width of the comment region. Must be greater than 0.
     */
    region_width: number
  
    /**
     * The corner of the comment region to pin to the node's corner as a string enum.
     */
    comment_pin_corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
  
  /**
   * Position of a region comment relative to the frame to which it is attached.
   */
  export type FrameOffsetRegion = {
    /**
     * Unique id specifying the frame.
     */
    node_id: string
  
    /**
     * 2D vector offset within the frame from the top-left corner.
     */
    node_offset: Vector
  
    /**
     * The height of the comment region. Must be greater than 0.
     */
    region_height: number
  
    /**
     * The width of the comment region. Must be greater than 0.
     */
    region_width: number
  
    /**
     * The corner of the comment region to pin to the node's corner as a string enum.
     */
    comment_pin_corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  }
  
  /**
   * A comment or reply left by a user.
   */
  export type Comment = {
    /**
     * Unique identifier for comment.
     */
    id: string
  
    /**
     * Positioning information of the comment. Includes information on the location of the comment pin,
     * which is either the absolute coordinates on the canvas or a relative offset within a frame. If
     * the comment is a region, it will also contain the region height, width, and position of the
     * anchor in regards to the region.
     */
    client_meta: Vector | FrameOffset | Region | FrameOffsetRegion
  
    /**
     * The file in which the comment lives
     */
    file_key: string
  
    /**
     * If present, the id of the comment to which this is the reply
     */
    parent_id?: string
  
    /**
     * The user who left the comment
     */
    user: User
  
    /**
     * The UTC ISO 8601 time at which the comment was left
     */
    created_at: string
  
    /**
     * If set, the UTC ISO 8601 time the comment was resolved
     */
    resolved_at?: string | null
  
    /**
     * The content of the comment
     */
    message: string
  
    /**
     * Only set for top level comments. The number displayed with the comment in the UI
     */
    order_id: string | null
  
    /**
     * An array of reactions to the comment
     */
    reactions: Reaction[]
  }
  
  /**
   * A reaction left by a user.
   */
  export type Reaction = {
    /**
     * The user who left the reaction.
     */
    user: User
  
    emoji: Emoji
  
    /**
     * The UTC ISO 8601 time at which the reaction was left.
     */
    created_at: string
  }
  
  /**
   * The emoji type of reaction as shortcode (e.g. `:heart:`, `:+1::skin-tone-2:`). The list of
   * accepted emoji shortcodes can be found in [this
   * file](https://raw.githubusercontent.com/missive/emoji-mart/main/packages/emoji-mart-data/sets/14/native.json)
   * under the top-level emojis and aliases fields, with optional skin tone modifiers when
   * applicable.
   */
  export type Emoji = string
  
  /**
   * A description of a user.
   */
  export type User = {
    /**
     * Unique stable id of the user.
     */
    id: string
  
    /**
     * Name of the user.
     */
    handle: string
  
    /**
     * URL link to the user's profile image.
     */
    img_url: string
  }
  
  /**
   * Data on the frame a component resides in.
   */
  export type FrameInfo = {
    /**
     * The ID of the frame node within the file.
     */
    nodeId?: string
  
    /**
     * The name of the frame node.
     */
    name?: string
  
    /**
     * The background color of the frame node.
     */
    backgroundColor?: string
  
    /**
     * The ID of the page containing the frame node.
     */
    pageId: string
  
    /**
     * The name of the page containing the frame node.
     */
    pageName: string
  }
  
  /**
   * An arrangement of published UI elements that can be instantiated across figma files.
   */
  export type PublishedComponent = {
    /**
     * The unique identifier for the component.
     */
    key: string
  
    /**
     * The unique identifier of the Figma file that contains the component.
     */
    file_key: string
  
    /**
     * The unique identifier of the component node within the Figma file.
     */
    node_id: string
  
    /**
     * A URL to a thumbnail image of the component.
     */
    thumbnail_url?: string
  
    /**
     * The name of the component.
     */
    name: string
  
    /**
     * The description of the component as entered by the publisher.
     */
    description: string
  
    /**
     * The UTC ISO 8601 time when the component was created.
     */
    created_at: string
  
    /**
     * The UTC ISO 8601 time when the component was last updated.
     */
    updated_at: string
  
    /**
     * The user who last updated the component.
     */
    user: User
  
    /**
     * The containing frame of the component.
     */
    containing_frame?: FrameInfo
  }
  
  /**
   * A node containing a set of variants of a component.
   */
  export type PublishedComponentSet = {
    /**
     * The unique identifier for the component set.
     */
    key: string
  
    /**
     * The unique identifier of the Figma file that contains the component set.
     */
    file_key: string
  
    /**
     * The unique identifier of the component set node within the Figma file.
     */
    node_id: string
  
    /**
     * A URL to a thumbnail image of the component set.
     */
    thumbnail_url?: string
  
    /**
     * The name of the component set.
     */
    name: string
  
    /**
     * The description of the component set as entered by the publisher.
     */
    description: string
  
    /**
     * The UTC ISO 8601 time when the component set was created.
     */
    created_at: string
  
    /**
     * The UTC ISO 8601 time when the component set was last updated.
     */
    updated_at: string
  
    /**
     * The user who last updated the component set.
     */
    user: User
  
    /**
     * The containing frame of the component set.
     */
    containing_frame?: FrameInfo
  }
  
  /**
   * The type of style
   */
  export type StyleType = 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
  
  /**
   * A set of published properties that can be applied to nodes.
   */
  export type PublishedStyle = {
    /**
     * The unique identifier for the style
     */
    key: string
  
    /**
     * The unique identifier of the Figma file that contains the style.
     */
    file_key: string
  
    /**
     * ID of the style node within the figma file
     */
    node_id: string
  
    style_type: StyleType
  
    /**
     * A URL to a thumbnail image of the style.
     */
    thumbnail_url?: string
  
    /**
     * The name of the style.
     */
    name: string
  
    /**
     * The description of the style as entered by the publisher.
     */
    description: string
  
    /**
     * The UTC ISO 8601 time when the style was created.
     */
    created_at: string
  
    /**
     * The UTC ISO 8601 time when the style was last updated.
     */
    updated_at: string
  
    /**
     * The user who last updated the style.
     */
    user: User
  
    /**
     * A user specified order number by which the style can be sorted.
     */
    sort_position: string
  }
  
  /**
   * A Project can be identified by both the Project name, and the Project ID.
   */
  export type Project = {
    /**
     * The ID of the project.
     */
    id: string
  
    /**
     * The name of the project.
     */
    name: string
  }
  
  /**
   * A version of a file
   */
  export type Version = {
    /**
     * Unique identifier for version
     */
    id: string
  
    /**
     * The UTC ISO 8601 time at which the version was created
     */
    created_at: string
  
    /**
     * The label given to the version in the editor
     */
    label: string | null
  
    /**
     * The description of the version as entered in the editor
     */
    description: string | null
  
    /**
     * The user that created the version
     */
    user: User
  
    /**
     * A URL to a thumbnail image of the file version.
     */
    thumbnail_url?: string
  }
  
  /**
   * A description of an HTTP webhook (from Figma back to your application)
   */
  export type WebhookV2 = {
    /**
     * The ID of the webhook
     */
    id: string
  
    /**
     * The event this webhook triggers on
     */
    event_type: WebhookV2Event
  
    /**
     * The team id you are subscribed to for updates
     */
    team_id: string
  
    /**
     * The current status of the webhook
     */
    status: WebhookV2Status
  
    /**
     * The client ID of the OAuth application that registered this webhook, if any
     */
    client_id: string | null
  
    /**
     * The passcode that will be passed back to the webhook endpoint
     */
    passcode: string
  
    /**
     * The endpoint that will be hit when the webhook is triggered
     */
    endpoint: string
  
    /**
     * Optional user-provided description or name for the webhook. This is provided to help make
     * maintaining a number of webhooks more convenient. Max length 140 characters.
     */
    description: string | null
  }
  
  /**
   * An enum representing the possible events that a webhook can subscribe to
   */
  export type WebhookV2Event =
    | 'PING'
    | 'FILE_UPDATE'
    | 'FILE_VERSION_UPDATE'
    | 'FILE_DELETE'
    | 'LIBRARY_PUBLISH'
    | 'FILE_COMMENT'
  
  /**
   * An enum representing the possible statuses you can set a webhook to:
   *
   * - `ACTIVE`: The webhook is healthy and receive all events
   * - `PAUSED`: The webhook is paused and will not receive any events
   */
  export type WebhookV2Status = 'ACTIVE' | 'PAUSED'
  
  /**
   * Information regarding the most recent interactions sent to a webhook endpoint
   */
  export type WebhookV2Request = {
    /**
     * The ID of the webhook the requests were sent to
     */
    webhook_id: string
  
    request_info: WebhookV2RequestInfo
  
    response_info: WebhookV2ResponseInfo
  
    /**
     * Error message for this request. NULL if no error occurred
     */
    error_msg: string | null
  }
  
  /**
   * Information regarding the request sent to a webhook endpoint
   */
  export type WebhookV2RequestInfo = {
    /**
     * The ID of the webhook
     */
    id: string
  
    /**
     * The actual endpoint the request was sent to
     */
    endpoint: string
  
    /**
     * The contents of the request that was sent to the endpoint
     */
    payload: object
  
    /**
     * UTC ISO 8601 timestamp of when the request was sent
     */
    sent_at: string
  }
  
  /**
   * Information regarding the reply sent back from a webhook endpoint
   */
  export type WebhookV2ResponseInfo = object | null
  
  /**
   * An object representing the library item information in the payload of the `LIBRARY_PUBLISH` event
   */
  export type LibraryItemData = {
    /**
     * Unique identifier for the library item
     */
    key: string
  
    /**
     * Name of the library item
     */
    name: string
  }
  
  /**
   * An object representing a fragment of a comment left by a user, used in the payload of the
   * `FILE_COMMENT` event. Note only ONE of the fields below will be set
   */
  export type CommentFragment = {
    /**
     * Comment text that is set if a fragment is text based
     */
    text?: string
  
    /**
     * User id that is set if a fragment refers to a user mention
     */
    mention?: string
  }
  
  export type WebhookBasePayload = {
    /**
     * The passcode specified when the webhook was created, should match what was initially provided
     */
    passcode: string
  
    /**
     * UTC ISO 8601 timestamp of when the event was triggered.
     */
    timestamp: string
  
    /**
     * The id of the webhook that caused the callback
     */
    webhook_id: string
  }
  
  export type WebhookPingPayload = WebhookBasePayload & { event_type: 'PING' }
  
  export type WebhookFileUpdatePayload = WebhookBasePayload & {
    event_type: 'FILE_UPDATE'
  
    /**
     * The key of the file that was updated
     */
    file_key: string
  
    /**
     * The name of the file that was updated
     */
    file_name: string
  }
  
  export type WebhookFileDeletePayload = WebhookBasePayload & {
    event_type: 'FILE_DELETE'
  
    /**
     * The key of the file that was deleted
     */
    file_key: string
  
    /**
     * The name of the file that was deleted
     */
    file_name: string
  
    /**
     * The user that deleted the file and triggered this event
     */
    triggered_by: User
  }
  
  export type WebhookFileVersionUpdatePayload = WebhookBasePayload & {
    event_type: 'FILE_VERSION_UPDATE'
  
    /**
     * UTC ISO 8601 timestamp of when the version was created
     */
    created_at: string
  
    /**
     * Description of the version in the version history
     */
    description?: string
  
    /**
     * The key of the file that was updated
     */
    file_key: string
  
    /**
     * The name of the file that was updated
     */
    file_name: string
  
    /**
     * The user that created the named version and triggered this event
     */
    triggered_by: User
  
    /**
     * ID of the published version
     */
    version_id: string
  }
  
  export type WebhookLibraryPublishPayload = WebhookBasePayload & {
    event_type: 'LIBRARY_PUBLISH'
  
    /**
     * Components that were created by the library publish
     */
    created_components: LibraryItemData[]
  
    /**
     * Styles that were created by the library publish
     */
    created_styles: LibraryItemData[]
  
    /**
     * Variables that were created by the library publish
     */
    created_variables: LibraryItemData[]
  
    /**
     * Components that were modified by the library publish
     */
    modified_components: LibraryItemData[]
  
    /**
     * Styles that were modified by the library publish
     */
    modified_styles: LibraryItemData[]
  
    /**
     * Variables that were modified by the library publish
     */
    modified_variables: LibraryItemData[]
  
    /**
     * Components that were deleted by the library publish
     */
    deleted_components: LibraryItemData[]
  
    /**
     * Styles that were deleted by the library publish
     */
    deleted_styles: LibraryItemData[]
  
    /**
     * Variables that were deleted by the library publish
     */
    deleted_variables: LibraryItemData[]
  
    /**
     * Description of the library publish
     */
    description?: string
  
    /**
     * The key of the file that was published
     */
    file_key: string
  
    /**
     * The name of the file that was published
     */
    file_name: string
  
    /**
     * The library item that was published
     */
    library_item: LibraryItemData
  
    /**
     * The user that published the library and triggered this event
     */
    triggered_by: User
  }
  
  export type WebhookFileCommentPayload = WebhookBasePayload & {
    event_type: 'FILE_COMMENT'
  
    /**
     * Contents of the comment itself
     */
    comment: CommentFragment[]
  
    /**
     * Unique identifier for comment
     */
    comment_id: string
  
    /**
     * The UTC ISO 8601 time at which the comment was left
     */
    created_at: string
  
    /**
     * The key of the file that was commented on
     */
    file_key: string
  
    /**
     * The name of the file that was commented on
     */
    file_name: string
  
    /**
     * Users that were mentioned in the comment
     */
    mentions?: User[]
  
    /**
     * The user that made the comment and triggered this event
     */
    triggered_by: User
  }
  
  /**
   * A Figma user
   */
  export type ActivityLogUserEntity = {
    /**
     * The type of entity.
     */
    type: 'user'
  
    /**
     * Unique stable id of the user.
     */
    id: string
  
    /**
     * Name of the user.
     */
    name: string
  
    /**
     * Email associated with the user's account.
     */
    email: string
  }
  
  /**
   * A Figma Design or FigJam file
   */
  export type ActivityLogFileEntity = {
    /**
     * The type of entity.
     */
    type: 'file'
  
    /**
     * Unique identifier of the file.
     */
    key: string
  
    /**
     * Name of the file.
     */
    name: string
  
    /**
     * Indicates if the object is a file on Figma Design or FigJam.
     */
    editor_type: 'figma' | 'figjam'
  
    /**
     * Access policy for users who have the link to the file.
     */
    link_access: 'view' | 'edit' | 'org_view' | 'org_edit' | 'inherit'
  
    /**
     * Access policy for users who have the link to the file's prototype.
     */
    proto_link_access: 'view' | 'org_view' | 'inherit'
  }
  
  /**
   * A file branch that diverges from and can be merged back into the main file
   */
  export type ActivityLogFileRepoEntity = {
    /**
     * The type of entity.
     */
    type: 'file_repo'
  
    /**
     * Unique identifier of the file branch.
     */
    id: string
  
    /**
     * Name of the file.
     */
    name: string
  
    /**
     * Key of the main file.
     */
    main_file_key: string
  }
  
  /**
   * A project that a collection of Figma files are grouped under
   */
  export type ActivityLogProjectEntity = {
    /**
     * The type of entity.
     */
    type: 'project'
  
    /**
     * Unique identifier of the project.
     */
    id: string
  
    /**
     * Name of the project.
     */
    name: string
  }
  
  /**
   * A Figma team that contains multiple users and projects
   */
  export type ActivityLogTeamEntity = {
    /**
     * The type of entity.
     */
    type: 'team'
  
    /**
     * Unique identifier of the team.
     */
    id: string
  
    /**
     * Name of the team.
     */
    name: string
  }
  
  /**
   * Part of the organizational hierarchy of managing files and users within Figma, only available on
   * the Enterprise Plan
   */
  export type ActivityLogWorkspaceEntity = {
    /**
     * The type of entity.
     */
    type: 'workspace'
  
    /**
     * Unique identifier of the workspace.
     */
    id: string
  
    /**
     * Name of the workspace.
     */
    name: string
  }
  
  /**
   * A Figma organization
   */
  export type ActivityLogOrgEntity = {
    /**
     * The type of entity.
     */
    type: 'org'
  
    /**
     * Unique identifier of the organization.
     */
    id: string
  
    /**
     * Name of the organization.
     */
    name: string
  }
  
  /**
   * A Figma plugin
   */
  export type ActivityLogPluginEntity = {
    /**
     * The type of entity.
     */
    type: 'plugin'
  
    /**
     * Unique identifier of the plugin.
     */
    id: string
  
    /**
     * Name of the plugin.
     */
    name: string
  
    /**
     * Indicates if the object is a plugin is available on Figma Design or FigJam.
     */
    editor_type: 'figma' | 'figjam'
  }
  
  /**
   * A Figma widget
   */
  export type ActivityLogWidgetEntity = {
    /**
     * The type of entity.
     */
    type: 'widget'
  
    /**
     * Unique identifier of the widget.
     */
    id: string
  
    /**
     * Name of the widget.
     */
    name: string
  
    /**
     * Indicates if the object is a widget available on Figma Design or FigJam.
     */
    editor_type: 'figma' | 'figjam'
  }
  
  /**
   * An event returned by the Activity Logs API.
   */
  export type ActivityLog = {
    /**
     * The ID of the event.
     */
    id: string
  
    /**
     * The timestamp of the event in seconds since the Unix epoch.
     */
    timestamp: number
  
    /**
     * The user who performed the action.
     */
    actor: object | null
  
    /**
     * The task or activity the actor performed.
     */
    action: {
      /**
       * The type of the action.
       */
      type: string
  
      /**
       * Metadata of the action. Each action type supports its own metadata attributes.
       */
      details: object | null
    }
  
    /**
     * The resource the actor took the action on. It can be a user, file, project or other resource
     * types.
     */
    entity:
      | ActivityLogUserEntity
      | ActivityLogFileEntity
      | ActivityLogFileRepoEntity
      | ActivityLogProjectEntity
      | ActivityLogTeamEntity
      | ActivityLogWorkspaceEntity
      | ActivityLogOrgEntity
      | ActivityLogPluginEntity
      | ActivityLogWidgetEntity
  
    /**
     * Contextual information about the event.
     */
    context: {
      /**
       * The third-party application that triggered the event, if applicable.
       */
      client_name: string | null
  
      /**
       * The IP address from of the client that sent the event request.
       */
      ip_address: string
  
      /**
       * If Figma's Support team triggered the event. This is either true or false.
       */
      is_figma_support_team_action: boolean
  
      /**
       * The id of the organization where the event took place.
       */
      org_id: string
  
      /**
       * The id of the team where the event took place -- if this took place in a specific team.
       */
      team_id: string | null
    }
  }
  
  /**
   * An object describing the user's payment status.
   */
  export type PaymentStatus = {
    /**
     * The current payment status of the user on the resource, as a string enum:
     *
     * - `UNPAID`: user has not paid for the resource
     * - `PAID`: user has an active purchase on the resource
     * - `TRIAL`: user is in the trial period for a subscription resource
     */
    type?: 'UNPAID' | 'PAID' | 'TRIAL'
  }
  
  /**
   * An object describing a user's payment information for a plugin, widget, or Community file.
   */
  export type PaymentInformation = {
    /**
     * The ID of the user whose payment information was queried. Can be used to verify the validity of a
     * response.
     */
    user_id: string
  
    /**
     * The ID of the plugin, widget, or Community file that was queried. Can be used to verify the
     * validity of a response.
     */
    resource_id: string
  
    /**
     * The type of the resource.
     */
    resource_type: 'PLUGIN' | 'WIDGET' | 'COMMUNITY_FILE'
  
    payment_status: PaymentStatus
  
    /**
     * The UTC ISO 8601 timestamp indicating when the user purchased the resource. No value is given if
     * the user has never purchased the resource.
     *
     * Note that a value will still be returned if the user had purchased the resource, but no longer
     * has active access to it (e.g. purchase refunded, subscription ended).
     */
    date_of_purchase?: string
  }
  
  /**
   * Scopes allow a variable to be shown or hidden in the variable picker for various fields. This
   * declutters the Figma UI if you have a large number of variables. Variable scopes are currently
   * supported on `FLOAT`, `STRING`, and `COLOR` variables.
   *
   * `ALL_SCOPES` is a special scope that means that the variable will be shown in the variable picker
   * for all variable fields. If `ALL_SCOPES` is set, no additional scopes can be set.
   *
   * `ALL_FILLS` is a special scope that means that the variable will be shown in the variable picker
   * for all fill fields. If `ALL_FILLS` is set, no additional fill scopes can be set.
   *
   * Valid scopes for `FLOAT` variables:
   *
   * - `ALL_SCOPES`
   * - `TEXT_CONTENT`
   * - `WIDTH_HEIGHT`
   * - `GAP`
   * - `STROKE_FLOAT`
   * - `EFFECT_FLOAT`
   * - `OPACITY`
   * - `FONT_WEIGHT`
   * - `FONT_SIZE`
   * - `LINE_HEIGHT`
   * - `LETTER_SPACING`
   * - `PARAGRAPH_SPACING`
   * - `PARAGRAPH_INDENT`
   *
   * Valid scopes for `STRING` variables:
   *
   * - `ALL_SCOPES`
   * - `TEXT_CONTENT`
   * - `FONT_FAMILY`
   * - `FONT_STYLE`
   *
   * Valid scopes for `COLOR` variables:
   *
   * - `ALL_SCOPES`
   * - `ALL_FILLS`
   * - `FRAME_FILL`
   * - `SHAPE_FILL`
   * - `TEXT_FILL`
   * - `STROKE_COLOR`
   * - `EFFECT_COLOR`
   */
  export type VariableScope =
    | 'ALL_SCOPES'
    | 'TEXT_CONTENT'
    | 'CORNER_RADIUS'
    | 'WIDTH_HEIGHT'
    | 'GAP'
    | 'ALL_FILLS'
    | 'FRAME_FILL'
    | 'SHAPE_FILL'
    | 'TEXT_FILL'
    | 'STROKE_COLOR'
    | 'STROKE_FLOAT'
    | 'EFFECT_FLOAT'
    | 'EFFECT_COLOR'
    | 'OPACITY'
    | 'FONT_FAMILY'
    | 'FONT_STYLE'
    | 'FONT_WEIGHT'
    | 'FONT_SIZE'
    | 'LINE_HEIGHT'
    | 'LETTER_SPACING'
    | 'PARAGRAPH_SPACING'
    | 'PARAGRAPH_INDENT'
  
  /**
   * An object containing platform-specific code syntax definitions for a variable. All platforms are
   * optional.
   */
  export type VariableCodeSyntax = {
    WEB?: string
  
    ANDROID?: string
  
    iOS?: string
  }
  
  /**
   * A grouping of related Variable objects each with the same modes.
   */
  export type LocalVariableCollection = {
    /**
     * The unique identifier of this variable collection.
     */
    id: string
  
    /**
     * The name of this variable collection.
     */
    name: string
  
    /**
     * The key of this variable collection.
     */
    key: string
  
    /**
     * The modes of this variable collection.
     */
    modes: {
      /**
       * The unique identifier of this mode.
       */
      modeId: string
  
      /**
       * The name of this mode.
       */
      name: string
    }[]
  
    /**
     * The id of the default mode.
     */
    defaultModeId: string
  
    /**
     * Whether this variable collection is remote.
     */
    remote: boolean
  
    /**
     * Whether this variable collection is hidden when publishing the current file as a library.
     */
    hiddenFromPublishing: boolean
  
    /**
     * The ids of the variables in the collection. Note that the order of these variables is roughly the
     * same as what is shown in Figma Design, however it does not account for groups. As a result, the
     * order of these variables may not exactly reflect the exact ordering and grouping shown in the
     * authoring UI.
     */
    variableIds: string[]
  }
  
  /**
   * A Variable is a single design token that defines values for each of the modes in its
   * VariableCollection. These values can be applied to various kinds of design properties.
   */
  export type LocalVariable = {
    /**
     * The unique identifier of this variable.
     */
    id: string
  
    /**
     * The name of this variable.
     */
    name: string
  
    /**
     * The key of this variable.
     */
    key: string
  
    /**
     * The id of the variable collection that contains this variable.
     */
    variableCollectionId: string
  
    /**
     * The resolved type of the variable.
     */
    resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  
    /**
     * The values for each mode of this variable.
     */
    valuesByMode: { [key: string]: boolean | number | string | RGBA | VariableAlias }
  
    /**
     * Whether this variable is remote.
     */
    remote: boolean
  
    /**
     * The description of this variable.
     */
    description: string
  
    /**
     * Whether this variable is hidden when publishing the current file as a library.
     *
     * If the parent `VariableCollection` is marked as `hiddenFromPublishing`, then this variable will
     * also be hidden from publishing via the UI. `hiddenFromPublishing` is independently toggled for a
     * variable and collection. However, both must be true for a given variable to be publishable.
     */
    hiddenFromPublishing: boolean
  
    /**
     * An array of scopes in the UI where this variable is shown. Setting this property will show/hide
     * this variable in the variable picker UI for different fields.
     *
     * Setting scopes for a variable does not prevent that variable from being bound in other scopes
     * (for example, via the Plugin API). This only limits the variables that are shown in pickers
     * within the Figma UI.
     */
    scopes: VariableScope[]
  
    codeSyntax: VariableCodeSyntax
  
    /**
     * Indicates that the variable was deleted in the editor, but the document may still contain
     * references to the variable. References to the variable may exist through bound values or variable
     * aliases.
     */
    deletedButReferenced?: boolean
  }
  
  /**
   * A grouping of related Variable objects each with the same modes.
   */
  export type PublishedVariableCollection = {
    /**
     * The unique identifier of this variable collection.
     */
    id: string
  
    /**
     * The ID of the variable collection that is used by subscribing files. This ID changes every time
     * the variable collection is modified and published.
     */
    subscribed_id: string
  
    /**
     * The name of this variable collection.
     */
    name: string
  
    /**
     * The key of this variable collection.
     */
    key: string
  
    /**
     * The UTC ISO 8601 time at which the variable collection was last updated.
     *
     * This timestamp will change any time a variable in the collection is changed.
     */
    updatedAt: string
  }
  
  /**
   * A Variable is a single design token that defines values for each of the modes in its
   * VariableCollection. These values can be applied to various kinds of design properties.
   */
  export type PublishedVariable = {
    /**
     * The unique identifier of this variable.
     */
    id: string
  
    /**
     * The ID of the variable that is used by subscribing files. This ID changes every time the variable
     * is modified and published.
     */
    subscribed_id: string
  
    /**
     * The name of this variable.
     */
    name: string
  
    /**
     * The key of this variable.
     */
    key: string
  
    /**
     * The id of the variable collection that contains this variable.
     */
    variableCollectionId: string
  
    /**
     * The resolved type of the variable.
     */
    resolvedDataType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  
    /**
     * The UTC ISO 8601 time at which the variable was last updated.
     */
    updatedAt: string
  }
  
  /**
   * An object that contains details about creating a `VariableCollection`.
   */
  export type VariableCollectionCreate = {
    /**
     * The action to perform for the variable collection.
     */
    action: 'CREATE'
  
    /**
     * A temporary id for this variable collection.
     */
    id?: string
  
    /**
     * The name of this variable collection.
     */
    name: string
  
    /**
     * The initial mode refers to the mode that is created by default. You can set a temporary id here,
     * in order to reference this mode later in this request.
     */
    initialModeId?: string
  
    /**
     * Whether this variable collection is hidden when publishing the current file as a library.
     */
    hiddenFromPublishing?: boolean
  }
  
  /**
   * An object that contains details about updating a `VariableCollection`.
   */
  export type VariableCollectionUpdate = {
    /**
     * The action to perform for the variable collection.
     */
    action: 'UPDATE'
  
    /**
     * The id of the variable collection to update.
     */
    id: string
  
    /**
     * The name of this variable collection.
     */
    name?: string
  
    /**
     * Whether this variable collection is hidden when publishing the current file as a library.
     */
    hiddenFromPublishing?: boolean
  }
  
  /**
   * An object that contains details about deleting a `VariableCollection`.
   */
  export type VariableCollectionDelete = {
    /**
     * The action to perform for the variable collection.
     */
    action: 'DELETE'
  
    /**
     * The id of the variable collection to delete.
     */
    id: string
  }
  
  export type VariableCollectionChange =
    | VariableCollectionCreate
    | VariableCollectionUpdate
    | VariableCollectionDelete
  
  /**
   * An object that contains details about creating a `VariableMode`.
   */
  export type VariableModeCreate = {
    /**
     * The action to perform for the variable mode.
     */
    action: 'CREATE'
  
    /**
     * A temporary id for this variable mode.
     */
    id?: string
  
    /**
     * The name of this variable mode.
     */
    name: string
  
    /**
     * The variable collection that will contain the mode. You can use the temporary id of a variable
     * collection.
     */
    variableCollectionId: string
  }
  
  /**
   * An object that contains details about updating a `VariableMode`.
   */
  export type VariableModeUpdate = {
    /**
     * The action to perform for the variable mode.
     */
    action: 'UPDATE'
  
    /**
     * The id of the variable mode to update.
     */
    id: string
  
    /**
     * The name of this variable mode.
     */
    name?: string
  
    /**
     * The variable collection that contains the mode.
     */
    variableCollectionId: string
  }
  
  /**
   * An object that contains details about deleting a `VariableMode`.
   */
  export type VariableModeDelete = {
    /**
     * The action to perform for the variable mode.
     */
    action: 'DELETE'
  
    /**
     * The id of the variable mode to delete.
     */
    id: string
  }
  
  export type VariableModeChange = VariableModeCreate | VariableModeUpdate | VariableModeDelete
  
  /**
   * An object that contains details about creating a `Variable`.
   */
  export type VariableCreate = {
    /**
     * The action to perform for the variable.
     */
    action: 'CREATE'
  
    /**
     * A temporary id for this variable.
     */
    id?: string
  
    /**
     * The name of this variable.
     */
    name: string
  
    /**
     * The variable collection that will contain the variable. You can use the temporary id of a
     * variable collection.
     */
    variableCollectionId: string
  
    /**
     * The resolved type of the variable.
     */
    resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  
    /**
     * The description of this variable.
     */
    description?: string
  
    /**
     * Whether this variable is hidden when publishing the current file as a library.
     */
    hiddenFromPublishing?: boolean
  
    /**
     * An array of scopes in the UI where this variable is shown. Setting this property will show/hide
     * this variable in the variable picker UI for different fields.
     */
    scopes?: VariableScope[]
  
    codeSyntax?: VariableCodeSyntax
  }
  
  /**
   * An object that contains details about updating a `Variable`.
   */
  export type VariableUpdate = {
    /**
     * The action to perform for the variable.
     */
    action: 'UPDATE'
  
    /**
     * The id of the variable to update.
     */
    id: string
  
    /**
     * The name of this variable.
     */
    name?: string
  
    /**
     * The description of this variable.
     */
    description?: string
  
    /**
     * Whether this variable is hidden when publishing the current file as a library.
     */
    hiddenFromPublishing?: boolean
  
    /**
     * An array of scopes in the UI where this variable is shown. Setting this property will show/hide
     * this variable in the variable picker UI for different fields.
     */
    scopes?: VariableScope[]
  
    codeSyntax?: VariableCodeSyntax
  }
  
  /**
   * An object that contains details about deleting a `Variable`.
   */
  export type VariableDelete = {
    /**
     * The action to perform for the variable.
     */
    action: 'DELETE'
  
    /**
     * The id of the variable to delete.
     */
    id: string
  }
  
  export type VariableChange = VariableCreate | VariableUpdate | VariableDelete
  
  /**
   * An object that represents a value for a given mode of a variable. All properties are required.
   */
  export type VariableModeValue = {
    /**
     * The target variable. You can use the temporary id of a variable.
     */
    variableId: string
  
    /**
     * Must correspond to a mode in the variable collection that contains the target variable.
     */
    modeId: string
  
    value: VariableValue
  }
  
  /**
   * The value for the variable. The value must match the variable's type. If setting to a variable
   * alias, the alias must resolve to this type.
   */
  export type VariableValue = boolean | number | string | RGB | RGBA | VariableAlias
  
  /**
   * A dev resource in a file
   */
  export type DevResource = {
    /**
     * Unique identifier of the dev resource
     */
    id: string
  
    /**
     * The name of the dev resource.
     */
    name: string
  
    /**
     * The URL of the dev resource.
     */
    url: string
  
    /**
     * The file key where the dev resource belongs.
     */
    file_key: string
  
    /**
     * The target node to attach the dev resource to.
     */
    node_id: string
  }
  
  /**
   * Library analytics component actions data broken down by asset.
   */
  export type LibraryAnalyticsComponentActionsByAsset = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * Unique, stable id of the component.
     */
    component_key: string
  
    /**
     * Name of the component.
     */
    component_name: string
  
    /**
     * Unique, stable id of the component set that this component belongs to.
     */
    component_set_key?: string
  
    /**
     * Name of the component set that this component belongs to.
     */
    component_set_name?: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics action data broken down by team.
   */
  export type LibraryAnalyticsComponentActionsByTeam = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * The name of the team using the library.
     */
    team_name: string
  
    /**
     * The name of the workspace that the team belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics component usage data broken down by component.
   */
  export type LibraryAnalyticsComponentUsagesByAsset = {
    /**
     * Unique, stable id of the component.
     */
    component_key: string
  
    /**
     * Name of the component.
     */
    component_name: string
  
    /**
     * Unique, stable id of the component set that this component belongs to.
     */
    component_set_key?: string
  
    /**
     * Name of the component set that this component belongs to.
     */
    component_set_name?: string
  
    /**
     * The number of instances of the component within the organization.
     */
    usages: number
  
    /**
     * The number of teams using the component within the organization.
     */
    teams_using: number
  
    /**
     * The number of files using the component within the organization.
     */
    files_using: number
  }
  
  /**
   * Library analytics component usage data broken down by file.
   */
  export type LibraryAnalyticsComponentUsagesByFile = {
    /**
     * The name of the file using the library.
     */
    file_name: string
  
    /**
     * The name of the team the file belongs to.
     */
    team_name: string
  
    /**
     * The name of the workspace that the file belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of component instances from the library used within the file.
     */
    usages: number
  }
  
  /**
   * Library analytics style actions data broken down by asset.
   */
  export type LibraryAnalyticsStyleActionsByAsset = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * Unique, stable id of the style.
     */
    style_key: string
  
    /**
     * The name of the style.
     */
    style_name: string
  
    /**
     * The type of the style.
     */
    style_type: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics style action data broken down by team.
   */
  export type LibraryAnalyticsStyleActionsByTeam = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * The name of the team using the library.
     */
    team_name: string
  
    /**
     * The name of the workspace that the team belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics style usage data broken down by component.
   */
  export type LibraryAnalyticsStyleUsagesByAsset = {
    /**
     * Unique, stable id of the style.
     */
    style_key: string
  
    /**
     * The name of the style.
     */
    style_name: string
  
    /**
     * The type of the style.
     */
    style_type: string
  
    /**
     * The number of usages of the style within the organization.
     */
    usages: number
  
    /**
     * The number of teams using the style within the organization.
     */
    teams_using: number
  
    /**
     * The number of files using the style within the organization.
     */
    files_using: number
  }
  
  /**
   * Library analytics style usage data broken down by file.
   */
  export type LibraryAnalyticsStyleUsagesByFile = {
    /**
     * The name of the file using the library.
     */
    file_name: string
  
    /**
     * The name of the team the file belongs to.
     */
    team_name: string
  
    /**
     * The name of the workspace that the file belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of times styles from this library are used within the file.
     */
    usages: number
  }
  
  /**
   * Library analytics variable actions data broken down by asset.
   */
  export type LibraryAnalyticsVariableActionsByAsset = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * Unique, stable id of the variable.
     */
    variable_key: string
  
    /**
     * The name of the variable.
     */
    variable_name: string
  
    /**
     * The type of the variable.
     */
    variable_type: string
  
    /**
     * Unique, stable id of the collection the variable belongs to.
     */
    collection_key: string
  
    /**
     * The name of the collection the variable belongs to.
     */
    collection_name: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics variable action data broken down by team.
   */
  export type LibraryAnalyticsVariableActionsByTeam = {
    /**
     * The date in ISO 8601 format. e.g. 2023-12-13
     */
    week: string
  
    /**
     * The name of the team using the library.
     */
    team_name: string
  
    /**
     * The name of the workspace that the team belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of detach events for this period.
     */
    detachments: number
  
    /**
     * The number of insertion events for this period.
     */
    insertions: number
  }
  
  /**
   * Library analytics variable usage data broken down by component.
   */
  export type LibraryAnalyticsVariableUsagesByAsset = {
    /**
     * Unique, stable id of the variable.
     */
    variable_key: string
  
    /**
     * The name of the variable.
     */
    variable_name: string
  
    /**
     * The type of the variable.
     */
    variable_type: string
  
    /**
     * Unique, stable id of the collection the variable belongs to.
     */
    collection_key: string
  
    /**
     * The name of the collection the variable belongs to.
     */
    collection_name: string
  
    /**
     * The number of usages of the variable within the organization.
     */
    usages: number
  
    /**
     * The number of teams using the variable within the organization.
     */
    teams_using: number
  
    /**
     * The number of files using the variable within the organization.
     */
    files_using: number
  }
  
  /**
   * Library analytics variable usage data broken down by file.
   */
  export type LibraryAnalyticsVariableUsagesByFile = {
    /**
     * The name of the file using the library.
     */
    file_name: string
  
    /**
     * The name of the team the file belongs to.
     */
    team_name: string
  
    /**
     * The name of the workspace that the file belongs to.
     */
    workspace_name?: string
  
    /**
     * The number of times variables from this library are used within the file.
     */
    usages: number
  }
  
  /**
   * If pagination is needed due to the length of the response, identifies the next and previous
   * pages.
   */
  export type ResponsePagination = {
    /**
     * A URL that calls the previous page of the response.
     */
    prev_page?: string
  
    /**
     * A URL that calls the next page of the response.
     */
    next_page?: string
  }
  
  /**
   * Pagination cursor
   */
  export type ResponseCursor = {
    before?: number
  
    after?: number
  }
  
  /**
   * A response indicating an error occurred.
   */
  export type ErrorResponsePayloadWithErrMessage = {
    /**
     * Status code
     */
    status: number
  
    /**
     * A string describing the error
     */
    err: string
  }
  
  /**
   * A response indicating an error occurred.
   */
  export type ErrorResponsePayloadWithErrorBoolean = {
    /**
     * For erroneous requests, this value is always `true`.
     */
    error: true
  
    /**
     * Status code
     */
    status: number
  
    /**
     * A string describing the error
     */
    message: string
  }
  
  /**
   * Response from the GET /v1/files/{file_key} endpoint.
   */
  export type GetFileResponse = {
    /**
     * The name of the file as it appears in the editor.
     */
    name: string
  
    /**
     * The role of the user making the API request in relation to the file.
     */
    role: 'owner' | 'editor' | 'viewer'
  
    /**
     * The UTC ISO 8601 time at which the file was last modified.
     */
    lastModified: string
  
    /**
     * The type of editor associated with this file.
     */
    editorType: 'figma' | 'figjam'
  
    /**
     * A URL to a thumbnail image of the file.
     */
    thumbnailUrl?: string
  
    /**
     * The version number of the file. This number is incremented when a file is modified and can be
     * used to check if the file has changed between requests.
     */
    version: string
  
    document: DocumentNode
  
    /**
     * A mapping from component IDs to component metadata.
     */
    components: { [key: string]: Component }
  
    /**
     * A mapping from component set IDs to component set metadata.
     */
    componentSets: { [key: string]: ComponentSet }
  
    /**
     * The version of the file schema that this file uses.
     */
    schemaVersion: number
  
    /**
     * A mapping from style IDs to style metadata.
     */
    styles: { [key: string]: Style }
  
    /**
     * The share permission level of the file link.
     */
    linkAccess?: string
  
    /**
     * The key of the main file for this file. If present, this file is a component or component set.
     */
    mainFileKey?: string
  
    /**
     * A list of branches for this file.
     */
    branches?: {
      /**
       * The key of the branch.
       */
      key: string
  
      /**
       * The name of the branch.
       */
      name: string
  
      /**
       * A URL to a thumbnail image of the branch.
       */
      thumbnail_url: string
  
      /**
       * The UTC ISO 8601 time at which the branch was last modified.
       */
      last_modified: string
    }[]
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/nodes endpoint.
   */
  export type GetFileNodesResponse = {
    /**
     * The name of the file as it appears in the editor.
     */
    name: string
  
    /**
     * The role of the user making the API request in relation to the file.
     */
    role: 'owner' | 'editor' | 'viewer'
  
    /**
     * The UTC ISO 8601 time at which the file was last modified.
     */
    lastModified: string
  
    /**
     * The type of editor associated with this file.
     */
    editorType: 'figma' | 'figjam'
  
    /**
     * A URL to a thumbnail image of the file.
     */
    thumbnailUrl: string
  
    /**
     * The version number of the file. This number is incremented when a file is modified and can be
     * used to check if the file has changed between requests.
     */
    version: string
  
    /**
     * A mapping from node IDs to node metadata.
     */
    nodes: {
      [key: string]: {
        document: Node
  
        /**
         * A mapping from component IDs to component metadata.
         */
        components: { [key: string]: Component }
  
        /**
         * A mapping from component set IDs to component set metadata.
         */
        componentSets: { [key: string]: ComponentSet }
  
        /**
         * The version of the file schema that this file uses.
         */
        schemaVersion: number
  
        /**
         * A mapping from style IDs to style metadata.
         */
        styles: { [key: string]: Style }
      }
    }
  }
  
  /**
   * Response from the GET /v1/images/{file_key} endpoint.
   */
  export type GetImagesResponse = {
    /**
     * For successful requests, this value is always `null`.
     */
    err: null
  
    /**
     * A map from node IDs to URLs of the rendered images.
     */
    images: { [key: string]: string | null }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/images endpoint.
   */
  export type GetImageFillsResponse = {
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    /**
     * Status code
     */
    status: 200
  
    meta: {
      /**
       * A map of image references to URLs of the image fills.
       */
      images: { [key: string]: string }
    }
  }
  
  /**
   * Response from the GET /v1/teams/{team_id}/projects endpoint.
   */
  export type GetTeamProjectsResponse = {
    /**
     * The team's name.
     */
    name: string
  
    /**
     * An array of projects.
     */
    projects: Project[]
  }
  
  /**
   * Response from the GET /v1/projects/{project_id}/files endpoint.
   */
  export type GetProjectFilesResponse = {
    /**
     * The project's name.
     */
    name: string
  
    /**
     * An array of files.
     */
    files: {
      /**
       * The file's key.
       */
      key: string
  
      /**
       * The file's name.
       */
      name: string
  
      /**
       * The file's thumbnail URL.
       */
      thumbnail_url?: string
  
      /**
       * The UTC ISO 8601 time at which the file was last modified.
       */
      last_modified: string
    }[]
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/versions endpoint.
   */
  export type GetFileVersionsResponse = {
    /**
     * An array of versions.
     */
    versions: Version[]
  
    pagination: ResponsePagination
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/comments endpoint.
   */
  export type GetCommentsResponse = {
    /**
     * An array of comments.
     */
    comments: Comment[]
  }
  
  /**
   * Response from the POST /v1/files/{file_key}/comments endpoint.
   */
  export type PostCommentResponse = Comment
  
  /**
   * Response from the DELETE /v1/files/{file_key}/comments/{comment_id} endpoint.
   */
  export type DeleteCommentResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/comments/{comment_id}/reactions endpoint.
   */
  export type GetCommentReactionsResponse = {
    /**
     * An array of reactions.
     */
    reactions: Reaction[]
  
    pagination: ResponsePagination
  }
  
  /**
   * Response from the POST /v1/files/{file_key}/comments/{comment_id}/reactions endpoint.
   */
  export type PostCommentReactionResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  }
  
  /**
   * Response from the DELETE /v1/files/{file_key}/comments/{comment_id}/reactions endpoint.
   */
  export type DeleteCommentReactionResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  }
  
  /**
   * Response from the GET /v1/me endpoint.
   */
  export type GetMeResponse = User & {
    /**
     * Email associated with the user's account. This property is only present on the /v1/me endpoint.
     */
    email: string
  }
  
  /**
   * Response from the GET /v1/teams/{team_id}/components endpoint.
   */
  export type GetTeamComponentsResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      components: PublishedComponent[]
  
      cursor?: ResponseCursor
    }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/components endpoint.
   */
  export type GetFileComponentsResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: { components: PublishedComponent[] }
  }
  
  /**
   * Response from the GET /v1/components/{key} endpoint.
   */
  export type GetComponentResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: PublishedComponent
  }
  
  /**
   * Response from the GET /v1/teams/{team_id}/component_sets endpoint.
   */
  export type GetTeamComponentSetsResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      component_sets: PublishedComponentSet[]
  
      cursor?: ResponseCursor
    }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/component_sets endpoint.
   */
  export type GetFileComponentSetsResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: { component_sets: PublishedComponentSet[] }
  }
  
  /**
   * Response from the GET /v1/component_sets/{key} endpoint.
   */
  export type GetComponentSetResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: PublishedComponentSet
  }
  
  /**
   * Response from the GET /v1/teams/{team_id}/styles endpoint.
   */
  export type GetTeamStylesResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      styles: PublishedStyle[]
  
      cursor?: ResponseCursor
    }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/styles endpoint.
   */
  export type GetFileStylesResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: { styles: PublishedStyle[] }
  }
  
  /**
   * Response from the GET /v1/styles/{key} endpoint.
   */
  export type GetStyleResponse = {
    /**
     * The status of the request.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: PublishedStyle
  }
  
  /**
   * Response from the POST /v2/webhooks endpoint.
   */
  export type PostWebhookResponse = WebhookV2
  
  /**
   * Response from the GET /v2/webhooks/{webhook_id} endpoint.
   */
  export type GetWebhookResponse = WebhookV2
  
  /**
   * Response from the PUT /v2/webhooks/{webhook_id} endpoint.
   */
  export type PutWebhookResponse = WebhookV2
  
  /**
   * Response from the DELETE /v2/webhooks/{webhook_id} endpoint.
   */
  export type DeleteWebhookResponse = WebhookV2
  
  /**
   * Response from the GET /v2/teams/{team_id}/webhooks endpoint.
   */
  export type GetTeamWebhooksResponse = {
    /**
     * An array of webhooks.
     */
    webhooks: WebhookV2[]
  }
  
  /**
   * Response from the GET /v2/webhooks/{webhook_id}/requests endpoint.
   */
  export type GetWebhookRequestsResponse = {
    /**
     * An array of webhook requests.
     */
    requests: WebhookV2Request[]
  }
  
  /**
   * Response from the GET /v1/activity_logs endpoint.
   */
  export type GetActivityLogsResponse = {
    /**
     * The response status code.
     */
    status?: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error?: false
  
    meta?: {
      /**
       * An array of activity logs sorted by timestamp in ascending order by default.
       */
      activity_logs?: ActivityLog[]
  
      /**
       * Encodes the last event (the most recent event)
       */
      cursor?: string
  
      /**
       * Whether there is a next page of events
       */
      next_page?: boolean
    }
  }
  
  /**
   * Response from the GET /v1/payments endpoint.
   */
  export type GetPaymentsResponse = {
    /**
     * The response status code.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: PaymentInformation
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/variables/local endpoint.
   */
  export type GetLocalVariablesResponse = {
    /**
     * The response status code.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      /**
       * A map of variable ids to variables
       */
      variables: { [key: string]: LocalVariable }
  
      /**
       * A map of variable collection ids to variable collections
       */
      variableCollections: { [key: string]: LocalVariableCollection }
    }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/variables/published endpoint.
   */
  export type GetPublishedVariablesResponse = {
    /**
     * The response status code.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      /**
       * A map of variable ids to variables
       */
      variables: { [key: string]: PublishedVariable }
  
      /**
       * A map of variable collection ids to variable collections
       */
      variableCollections: { [key: string]: PublishedVariableCollection }
    }
  }
  
  /**
   * Response from the POST /v1/files/{file_key}/variables endpoint.
   */
  export type PostVariablesResponse = {
    /**
     * The response status code.
     */
    status: 200
  
    /**
     * For successful requests, this value is always `false`.
     */
    error: false
  
    meta: {
      /**
       * A map of temporary ids in the request to the real ids of the newly created objects
       */
      tempIdToRealId: { [key: string]: string }
    }
  }
  
  /**
   * Response from the GET /v1/files/{file_key}/dev_resources endpoint.
   */
  export type GetDevResourcesResponse = {
    /**
     * An array of dev resources.
     */
    dev_resources: DevResource[]
  }
  
  /**
   * Response from the POST /v1/dev_resources endpoint.
   */
  export type PostDevResourcesResponse = {
    /**
     * An array of links created.
     */
    links_created: DevResource[]
  
    /**
     * An array of errors.
     */
    errors?: {
      /**
       * The file key.
       */
      file_key?: string | null
  
      /**
       * The node id.
       */
      node_id?: string | null
  
      /**
       * The error message.
       */
      error: string
    }[]
  }
  
  /**
   * Response from the PUT /v1/dev_resources endpoint.
   */
  export type PutDevResourcesResponse = {
    /**
     * An array of links updated.
     */
    links_updated?: DevResource[]
  
    /**
     * An array of errors.
     */
    errors?: {
      /**
       * The id of the dev resource.
       */
      id?: string
  
      /**
       * The error message.
       */
      error: string
    }[]
  }
  
  /**
   * Response from the DELETE /v1/files/{file_key}/dev_resources/{dev_resource_id} endpoint.
   */
  export type DeleteDevResourceResponse = void
  
  /**
   * Response from the GET /v1/analytics/libraries/{file_key}/component/actions.
   */
  export type GetLibraryAnalyticsComponentActionsResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsComponentActionsByAsset[] | LibraryAnalyticsComponentActionsByTeam[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Response from the PUT /v1/analytics/libraries/{file_key}/component/usages.
   */
  export type GetLibraryAnalyticsComponentUsagesResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsComponentUsagesByAsset[] | LibraryAnalyticsComponentUsagesByFile[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Response from the GET /v1/analytics/libraries/{file_key}/style/actions.
   */
  export type GetLibraryAnalyticsStyleActionsResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsStyleActionsByAsset[] | LibraryAnalyticsStyleActionsByTeam[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Response from the PUT /v1/analytics/libraries/{file_key}/style/usages.
   */
  export type GetLibraryAnalyticsStyleUsagesResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsStyleUsagesByAsset[] | LibraryAnalyticsStyleUsagesByFile[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Response from the GET /v1/analytics/libraries/{file_key}/variable/actions.
   */
  export type GetLibraryAnalyticsVariableActionsResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsVariableActionsByAsset[] | LibraryAnalyticsVariableActionsByTeam[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Response from the PUT /v1/analytics/libraries/{file_key}/variable/usages.
   */
  export type GetLibraryAnalyticsVariableUsagesResponse = {
    /**
     * An array of analytics data.
     */
    rows: LibraryAnalyticsVariableUsagesByAsset[] | LibraryAnalyticsVariableUsagesByFile[]
  
    /**
     * Whether there is a next page of data that can be fetched.
     */
    next_page: boolean
  
    /**
     * The cursor to use to fetch the next page of data. Not present if next_page is false.
     */
    cursor?: string
  }
  
  /**
   * Bad request. Parameters are invalid or malformed. Please check the input formats. This error can
   * also happen if the requested resources are too large to complete the request, which results in a
   * timeout. Please reduce the number and size of objects requested.
   */
  export type BadRequestErrorResponseWithErrMessage = ErrorResponsePayloadWithErrMessage & {
    /**
     * Status code
     */
    status: 400
  }
  
  /**
   * Bad request. Parameters are invalid or malformed. Please check the input formats. This error can
   * also happen if the requested resources are too large to complete the request, which results in a
   * timeout. Please reduce the number and size of objects requested.
   */
  export type BadRequestErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 400
  }
  
  /**
   * Token is missing or incorrect.
   */
  export type UnauthorizedErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 401
  }
  
  /**
   * The request was valid, but the server is refusing action. The user might not have the necessary
   * permissions for a resource, or may need an account of some sort.
   */
  export type ForbiddenErrorResponseWithErrMessage = ErrorResponsePayloadWithErrMessage & {
    /**
     * Status code
     */
    status: 403
  }
  
  /**
   * The request was valid, but the server is refusing action. The user might not have the necessary
   * permissions for a resource, or may need an account of some sort.
   */
  export type ForbiddenErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 403
  }
  
  /**
   * The requested file or resource was not found.
   */
  export type NotFoundErrorResponseWithErrMessage = ErrorResponsePayloadWithErrMessage & {
    /**
     * Status code
     */
    status: 404
  }
  
  /**
   * The requested file or resource was not found.
   */
  export type NotFoundErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 404
  }
  
  /**
   * In some cases API requests may be throttled or rate limited. Please wait a while before
   * attempting the request again (typically a minute).
   */
  export type TooManyRequestsErrorResponseWithErrMessage = ErrorResponsePayloadWithErrMessage & {
    /**
     * Status code
     */
    status: 429
  }
  
  /**
   * In some cases API requests may be throttled or rate limited. Please wait a while before
   * attempting the request again (typically a minute).
   */
  export type TooManyRequestsErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 429
  }
  
  /**
   * An internal server error occurred.
   */
  export type InternalServerErrorResponseWithErrMessage = ErrorResponsePayloadWithErrMessage & {
    /**
     * Status code
     */
    status: 500
  }
  
  /**
   * An internal server error occurred.
   */
  export type InternalServerErrorResponseWithErrorBoolean = ErrorResponsePayloadWithErrorBoolean & {
    /**
     * Status code
     */
    status: 500
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}
   */
  export type GetFilePathParams = {
    /**
     * File to export JSON from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}
   */
  export type GetFileQueryParams = {
    /**
     * A specific version ID to get. Omitting this will get the current version of the file.
     */
    version?: string
    /**
     * Comma separated list of nodes that you care about in the document. If specified, only a subset of
     * the document will be returned corresponding to the nodes listed, their children, and everything
     * between the root node and the listed nodes.
     *
     * Note: There may be other nodes included in the returned JSON that are outside the ancestor chains
     * of the desired nodes. The response may also include dependencies of anything in the nodes'
     * subtrees. For example, if a node subtree contains an instance of a local component that lives
     * elsewhere in that file, that component and its ancestor chain will also be included.
     *
     * For historical reasons, top-level canvas nodes are always returned, regardless of whether they
     * are listed in the `ids` parameter. This quirk may be removed in a future version of the API.
     */
    ids?: string
    /**
     * Positive integer representing how deep into the document tree to traverse. For example, setting
     * this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each
     * page. Not setting this parameter returns all nodes.
     */
    depth?: number
    /**
     * Set to "paths" to export vector data.
     */
    geometry?: string
    /**
     * A comma separated list of plugin IDs and/or the string "shared". Any data present in the document
     * written by those plugins will be included in the result in the `pluginData` and
     * `sharedPluginData` properties.
     */
    plugin_data?: string
    /**
     * Returns branch metadata for the requested file. If the file is a branch, the main file's key will
     * be included in the returned response. If the file has branches, their metadata will be included
     * in the returned response. Default: false.
     */
    branch_data?: boolean
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/nodes
   */
  export type GetFileNodesPathParams = {
    /**
     * File to export JSON from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}/nodes
   */
  export type GetFileNodesQueryParams = {
    /**
     * A comma separated list of node IDs to retrieve and convert.
     */
    ids: string
    /**
     * A specific version ID to get. Omitting this will get the current version of the file.
     */
    version?: string
    /**
     * Positive integer representing how deep into the node tree to traverse. For example, setting this
     * to 1 will return only the children directly underneath the desired nodes. Not setting this
     * parameter returns all nodes.
     *
     * Note: this parameter behaves differently from the same parameter in the `GET /v1/files/:key`
     * endpoint. In this endpoint, the depth will be counted starting from the desired node rather than
     * the document root node.
     */
    depth?: number
    /**
     * Set to "paths" to export vector data.
     */
    geometry?: string
    /**
     * A comma separated list of plugin IDs and/or the string "shared". Any data present in the document
     * written by those plugins will be included in the result in the `pluginData` and
     * `sharedPluginData` properties.
     */
    plugin_data?: string
  }
  
  /**
   * Path parameters for GET /v1/images/{file_key}
   */
  export type GetImagesPathParams = {
    /**
     * File to export images from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/images/{file_key}
   */
  export type GetImagesQueryParams = {
    /**
     * A comma separated list of node IDs to render.
     */
    ids: string
    /**
     * A specific version ID to get. Omitting this will get the current version of the file.
     */
    version?: string
    /**
     * A number between 0.01 and 4, the image scaling factor.
     */
    scale?: number
    /**
     * A string enum for the image output format.
     */
    format?: 'jpg' | 'png' | 'svg' | 'pdf'
    /**
     * Whether text elements are rendered as outlines (vector paths) or as `<text>` elements in SVGs.
     *
     * Rendering text elements as outlines guarantees that the text looks exactly the same in the SVG as
     * it does in the browser/inside Figma.
     *
     * Exporting as `<text>` allows text to be selectable inside SVGs and generally makes the SVG easier
     * to read. However, this relies on the browser's rendering engine which can vary between browsers
     * and/or operating systems. As such, visual accuracy is not guaranteed as the result could look
     * different than in Figma.
     */
    svg_outline_text?: boolean
    /**
     * Whether to include id attributes for all SVG elements. Adds the layer name to the `id` attribute
     * of an svg element.
     */
    svg_include_id?: boolean
    /**
     * Whether to include node id attributes for all SVG elements. Adds the node id to a `data-node-id`
     * attribute of an svg element.
     */
    svg_include_node_id?: boolean
    /**
     * Whether to simplify inside/outside strokes and use stroke attribute if possible instead of
     * `<mask>`.
     */
    svg_simplify_stroke?: boolean
    /**
     * Whether content that overlaps the node should be excluded from rendering. Passing false (i.e.,
     * rendering overlaps) may increase processing time, since more of the document must be included in
     * rendering.
     */
    contents_only?: boolean
    /**
     * Use the full dimensions of the node regardless of whether or not it is cropped or the space
     * around it is empty. Use this to export text nodes without cropping.
     */
    use_absolute_bounds?: boolean
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/images
   */
  export type GetImageFillsPathParams = {
    /**
     * File to get image URLs from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Path parameters for GET /v1/teams/{team_id}/projects
   */
  export type GetTeamProjectsPathParams = {
    /**
     * ID of the team to list projects from
     */
    team_id: string
  }
  
  /**
   * Path parameters for GET /v1/projects/{project_id}/files
   */
  export type GetProjectFilesPathParams = {
    /**
     * ID of the project to list files from
     */
    project_id: string
  }
  
  /**
   * Query parameters for GET /v1/projects/{project_id}/files
   */
  export type GetProjectFilesQueryParams = {
    /**
     * Returns branch metadata in the response for each main file with a branch inside the project.
     */
    branch_data?: boolean
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/versions
   */
  export type GetFileVersionsPathParams = {
    /**
     * File to get version history from. This can be a file key or branch key. Use `GET /v1/files/:key`
     * with the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}/versions
   */
  export type GetFileVersionsQueryParams = {
    /**
     * The number of items returned in a page of the response. If not included, `page_size` is `30`.
     */
    page_size?: number
    /**
     * A version ID for one of the versions in the history. Gets versions before this ID. Used for
     * paginating. If the response is not paginated, this link returns the same data in the current
     * response.
     */
    before?: number
    /**
     * A version ID for one of the versions in the history. Gets versions after this ID. Used for
     * paginating. If the response is not paginated, this property is not included.
     */
    after?: number
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/comments
   */
  export type GetCommentsPathParams = {
    /**
     * File to get comments from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}/comments
   */
  export type GetCommentsQueryParams = {
    /**
     * If enabled, will return comments as their markdown equivalents when applicable.
     */
    as_md?: boolean
  }
  
  /**
   * Path parameters for POST /v1/files/{file_key}/comments
   */
  export type PostCommentPathParams = {
    /**
     * File to add comments in. This can be a file key or branch key. Use `GET /v1/files/:key` with the
     * `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Request body parameters for POST /v1/files/{file_key}/comments
   */
  export type PostCommentRequestBody = {
    /**
     * The text contents of the comment to post.
     */
    message: string
  
    /**
     * The ID of the comment to reply to, if any. This must be a root comment. You cannot reply to other
     * replies (a comment that has a parent_id).
     */
    comment_id?: string
  
    /**
     * The position where to place the comment.
     */
    client_meta?: Vector | FrameOffset | Region | FrameOffsetRegion
  }
  
  /**
   * Path parameters for DELETE /v1/files/{file_key}/comments/{comment_id}
   */
  export type DeleteCommentPathParams = {
    /**
     * File to delete comment from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
    /**
     * Comment id of comment to delete
     */
    comment_id: string
  }
  
  /**
   * Path parameters for DELETE /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type DeleteCommentReactionPathParams = {
    /**
     * File to delete comment reaction from. This can be a file key or branch key. Use `GET
     * /v1/files/:key` with the `branch_data` query param to get the branch key.
     */
    file_key: string
    /**
     * ID of comment to delete reaction from.
     */
    comment_id: string
  }
  
  /**
   * Query parameters for DELETE /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type DeleteCommentReactionQueryParams = { emoji: Emoji }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type GetCommentReactionsPathParams = {
    /**
     * File to get comment containing reactions from. This can be a file key or branch key. Use `GET
     * /v1/files/:key` with the `branch_data` query param to get the branch key.
     */
    file_key: string
    /**
     * ID of comment to get reactions from.
     */
    comment_id: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type GetCommentReactionsQueryParams = {
    /**
     * Cursor for pagination, retrieved from the response of the previous call.
     */
    cursor?: string
  }
  
  /**
   * Path parameters for POST /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type PostCommentReactionPathParams = {
    /**
     * File to post comment reactions to. This can be a file key or branch key. Use `GET
     * /v1/files/:key` with the `branch_data` query param to get the branch key.
     */
    file_key: string
    /**
     * ID of comment to react to.
     */
    comment_id: string
  }
  
  /**
   * Request body parameters for POST /v1/files/{file_key}/comments/{comment_id}/reactions
   */
  export type PostCommentReactionRequestBody = { emoji: Emoji }
  
  /**
   * Path parameters for GET /v1/teams/{team_id}/components
   */
  export type GetTeamComponentsPathParams = {
    /**
     * Id of the team to list components from.
     */
    team_id: string
  }
  
  /**
   * Query parameters for GET /v1/teams/{team_id}/components
   */
  export type GetTeamComponentsQueryParams = {
    /**
     * Number of items to return in a paged list of results. Defaults to 30.
     */
    page_size?: number
    /**
     * Cursor indicating which id after which to start retrieving components for. Exclusive with before.
     * The cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    after?: number
    /**
     * Cursor indicating which id before which to start retrieving components for. Exclusive with after.
     * The cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    before?: number
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/components
   */
  export type GetFileComponentsPathParams = {
    /**
     * File to list components from. This must be a main file key, not a branch key, as it is not
     * possible to publish from branches.
     */
    file_key: string
  }
  
  /**
   * Path parameters for GET /v1/components/{key}
   */
  export type GetComponentPathParams = {
    /**
     * The unique identifier of the component.
     */
    key: string
  }
  
  /**
   * Path parameters for GET /v1/teams/{team_id}/component_sets
   */
  export type GetTeamComponentSetsPathParams = {
    /**
     * Id of the team to list component sets from.
     */
    team_id: string
  }
  
  /**
   * Query parameters for GET /v1/teams/{team_id}/component_sets
   */
  export type GetTeamComponentSetsQueryParams = {
    /**
     * Number of items to return in a paged list of results. Defaults to 30.
     */
    page_size?: number
    /**
     * Cursor indicating which id after which to start retrieving component sets for. Exclusive with
     * before. The cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    after?: number
    /**
     * Cursor indicating which id before which to start retrieving component sets for. Exclusive with
     * after. The cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    before?: number
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/component_sets
   */
  export type GetFileComponentSetsPathParams = {
    /**
     * File to list component sets from. This must be a main file key, not a branch key, as it is not
     * possible to publish from branches.
     */
    file_key: string
  }
  
  /**
   * Path parameters for GET /v1/component_sets/{key}
   */
  export type GetComponentSetPathParams = {
    /**
     * The unique identifier of the component set.
     */
    key: string
  }
  
  /**
   * Path parameters for GET /v1/teams/{team_id}/styles
   */
  export type GetTeamStylesPathParams = {
    /**
     * Id of the team to list styles from.
     */
    team_id: string
  }
  
  /**
   * Query parameters for GET /v1/teams/{team_id}/styles
   */
  export type GetTeamStylesQueryParams = {
    /**
     * Number of items to return in a paged list of results. Defaults to 30.
     */
    page_size?: number
    /**
     * Cursor indicating which id after which to start retrieving styles for. Exclusive with before. The
     * cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    after?: number
    /**
     * Cursor indicating which id before which to start retrieving styles for. Exclusive with after. The
     * cursor value is an internally tracked integer that doesn't correspond to any Ids.
     */
    before?: number
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/styles
   */
  export type GetFileStylesPathParams = {
    /**
     * File to list styles from. This must be a main file key, not a branch key, as it is not possible
     * to publish from branches.
     */
    file_key: string
  }
  
  /**
   * Path parameters for GET /v1/styles/{key}
   */
  export type GetStylePathParams = {
    /**
     * The unique identifier of the style.
     */
    key: string
  }
  
  /**
   * Request body parameters for POST /v2/webhooks
   */
  export type PostWebhookRequestBody = {
    event_type: WebhookV2Event
  
    /**
     * Team id to receive updates about
     */
    team_id: string
  
    /**
     * The HTTP endpoint that will receive a POST request when the event triggers. Max length 2048
     * characters.
     */
    endpoint: string
  
    /**
     * String that will be passed back to your webhook endpoint to verify that it is being called by
     * Figma. Max length 100 characters.
     */
    passcode: string
  
    /**
     * State of the webhook, including any error state it may be in
     */
    status?: WebhookV2Status
  
    /**
     * User provided description or name for the webhook. Max length 150 characters.
     */
    description?: string
  }
  
  /**
   * Path parameters for DELETE /v2/webhooks/{webhook_id}
   */
  export type DeleteWebhookPathParams = {
    /**
     * ID of webhook to delete
     */
    webhook_id: string
  }
  
  /**
   * Path parameters for GET /v2/webhooks/{webhook_id}
   */
  export type GetWebhookPathParams = {
    /**
     * ID of webhook to get
     */
    webhook_id: string
  }
  
  /**
   * Path parameters for PUT /v2/webhooks/{webhook_id}
   */
  export type PutWebhookPathParams = {
    /**
     * ID of webhook to update
     */
    webhook_id: string
  }
  
  /**
   * Request body parameters for PUT /v2/webhooks/{webhook_id}
   */
  export type PutWebhookRequestBody = {
    event_type: WebhookV2Event
  
    /**
     * The HTTP endpoint that will receive a POST request when the event triggers. Max length 2048
     * characters.
     */
    endpoint: string
  
    /**
     * String that will be passed back to your webhook endpoint to verify that it is being called by
     * Figma. Max length 100 characters.
     */
    passcode: string
  
    /**
     * State of the webhook, including any error state it may be in
     */
    status?: WebhookV2Status
  
    /**
     * User provided description or name for the webhook. Max length 150 characters.
     */
    description?: string
  }
  
  /**
   * Path parameters for GET /v2/teams/{team_id}/webhooks
   */
  export type GetTeamWebhooksPathParams = {
    /**
     * ID of team to get webhooks for
     */
    team_id: string
  }
  
  /**
   * Path parameters for GET /v2/webhooks/{webhook_id}/requests
   */
  export type GetWebhookRequestsPathParams = {
    /**
     * The id of the webhook subscription you want to see events from
     */
    webhook_id: string
  }
  
  /**
   * Query parameters for GET /v1/activity_logs
   */
  export type GetActivityLogsQueryParams = {
    /**
     * Event type(s) to include in the response. Can have multiple values separated by comma. All
     * events are returned by default.
     */
    events?: string
    /**
     * Unix timestamp of the least recent event to include. This param defaults to one year ago if
     * unspecified. Events prior to one year ago are not available.
     */
    start_time?: number
    /**
     * Unix timestamp of the most recent event to include. This param defaults to the current timestamp
     * if unspecified.
     */
    end_time?: number
    /**
     * Maximum number of events to return. This param defaults to 1000 if unspecified.
     */
    limit?: number
    /**
     * Event order by timestamp. This param can be either "asc" (default) or "desc".
     */
    order?: 'asc' | 'desc'
  }
  
  /**
   * Query parameters for GET /v1/payments
   */
  export type GetPaymentsQueryParams = {
    /**
     * Short-lived token returned from "getPluginPaymentTokenAsync" in the plugin payments API and used
     * to authenticate to this endpoint. Read more about generating this token through "Calling the
     * Payments REST API from a plugin or widget" below.
     */
    plugin_payment_token?: string
    /**
     * The ID of the user to query payment information about. You can get the user ID by having the user
     * OAuth2 to the Figma REST API.
     */
    user_id?: number
    /**
     * The ID of the Community file to query a user's payment information on. You can get the Community
     * file ID from the file's Community page (look for the number after "file/" in the URL). Provide
     * exactly one of "community_file_id", "plugin_id", or "widget_id".
     */
    community_file_id?: number
    /**
     * The ID of the plugin to query a user's payment information on. You can get the plugin ID from the
     * plugin's manifest, or from the plugin's Community page (look for the number after "plugin/" in
     * the URL). Provide exactly one of "community_file_id", "plugin_id", or "widget_id".
     */
    plugin_id?: number
    /**
     * The ID of the widget to query a user's payment information on. You can get the widget ID from the
     * widget's manifest, or from the widget's Community page (look for the number after "widget/" in
     * the URL). Provide exactly one of "community_file_id", "plugin_id", or "widget_id".
     */
    widget_id?: number
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/variables/local
   */
  export type GetLocalVariablesPathParams = {
    /**
     * File to get variables from. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/variables/published
   */
  export type GetPublishedVariablesPathParams = {
    /**
     * File to get variables from. This must be a main file key, not a branch key, as it is not
     * possible to publish from branches.
     */
    file_key: string
  }
  
  /**
   * Path parameters for POST /v1/files/{file_key}/variables
   */
  export type PostVariablesPathParams = {
    /**
     * File to modify variables in. This can be a file key or branch key. Use `GET /v1/files/:key` with
     * the `branch_data` query param to get the branch key.
     */
    file_key: string
  }
  
  /**
   * Request body parameters for POST /v1/files/{file_key}/variables
   */
  export type PostVariablesRequestBody = {
    /**
     * For creating, updating, and deleting variable collections.
     */
    variableCollections?: VariableCollectionChange[]
  
    /**
     * For creating, updating, and deleting modes within variable collections.
     */
    variableModes?: VariableModeChange[]
  
    /**
     * For creating, updating, and deleting variables.
     */
    variables?: VariableChange[]
  
    /**
     * For setting a specific value, given a variable and a mode.
     */
    variableModeValues?: VariableModeValue[]
  }
  
  /**
   * Path parameters for GET /v1/files/{file_key}/dev_resources
   */
  export type GetDevResourcesPathParams = {
    /**
     * The file to get the dev resources from. This must be a main file key, not a branch key.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/files/{file_key}/dev_resources
   */
  export type GetDevResourcesQueryParams = {
    /**
     * Comma separated list of nodes that you care about in the document. If specified, only dev
     * resources attached to these nodes will be returned. If not specified, all dev resources in the
     * file will be returned.
     */
    node_ids?: string
  }
  
  /**
   * Request body parameters for POST /v1/dev_resources
   */
  export type PostDevResourcesRequestBody = {
    /**
     * An array of dev resources.
     */
    dev_resources: {
      /**
       * The name of the dev resource.
       */
      name: string
  
      /**
       * The URL of the dev resource.
       */
      url: string
  
      /**
       * The file key where the dev resource belongs.
       */
      file_key: string
  
      /**
       * The target node to attach the dev resource to.
       */
      node_id: string
    }[]
  }
  
  /**
   * Request body parameters for PUT /v1/dev_resources
   */
  export type PutDevResourcesRequestBody = {
    /**
     * An array of dev resources.
     */
    dev_resources: {
      /**
       * Unique identifier of the dev resource
       */
      id: string
  
      /**
       * The name of the dev resource.
       */
      name?: string
  
      /**
       * The URL of the dev resource.
       */
      url?: string
    }[]
  }
  
  /**
   * Path parameters for DELETE /v1/files/{file_key}/dev_resources/{dev_resource_id}
   */
  export type DeleteDevResourcePathParams = {
    /**
     * The file to delete the dev resource from. This must be a main file key, not a branch key.
     */
    file_key: string
    /**
     * The id of the dev resource to delete.
     */
    dev_resource_id: string
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/component/actions
   */
  export type GetLibraryAnalyticsComponentActionsPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/component/actions
   */
  export type GetLibraryAnalyticsComponentActionsQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'component' | 'team'
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the
     * nearest start of a week. Defaults to one year prior.
     */
    start_date?: string
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the
     * nearest end of a week. Defaults to the latest computed week.
     */
    end_date?: string
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/component/usages
   */
  export type GetLibraryAnalyticsComponentUsagesPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/component/usages
   */
  export type GetLibraryAnalyticsComponentUsagesQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'component' | 'file'
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/style/actions
   */
  export type GetLibraryAnalyticsStyleActionsPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/style/actions
   */
  export type GetLibraryAnalyticsStyleActionsQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'style' | 'team'
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the
     * nearest start of a week. Defaults to one year prior.
     */
    start_date?: string
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the
     * nearest end of a week. Defaults to the latest computed week.
     */
    end_date?: string
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/style/usages
   */
  export type GetLibraryAnalyticsStyleUsagesPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/style/usages
   */
  export type GetLibraryAnalyticsStyleUsagesQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'style' | 'file'
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/variable/actions
   */
  export type GetLibraryAnalyticsVariableActionsPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/variable/actions
   */
  export type GetLibraryAnalyticsVariableActionsQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'variable' | 'team'
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the earliest week to include. Dates are rounded back to the
     * nearest start of a week. Defaults to one year prior.
     */
    start_date?: string
    /**
     * ISO 8601 date string (YYYY-MM-DD) of the latest week to include. Dates are rounded forward to the
     * nearest end of a week. Defaults to the latest computed week.
     */
    end_date?: string
  }
  
  /**
   * Path parameters for GET /v1/analytics/libraries/{file_key}/variable/usages
   */
  export type GetLibraryAnalyticsVariableUsagesPathParams = {
    /**
     * File key of the library to fetch analytics data for.
     */
    file_key: string
  }
  
  /**
   * Query parameters for GET /v1/analytics/libraries/{file_key}/variable/usages
   */
  export type GetLibraryAnalyticsVariableUsagesQueryParams = {
    /**
     * Cursor indicating what page of data to fetch. Obtained from prior API call.
     */
    cursor?: string
    /**
     * A dimension to group returned analytics data by.
     */
    group_by: 'variable' | 'file'
  }