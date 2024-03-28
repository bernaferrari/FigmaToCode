import { AndroidType, androidNameParser } from "./androidNameParser"

export enum ButtonType {
  Button,
  ImageButton,
  ButtonText
}

export const androidButtonType = (node: SceneNode & BaseFrameMixin ): {
  type: ButtonType, 
  value: string, 
  layout: SceneNode | undefined,
  text: TextNode | undefined
} => {
  const layout = node.children.filter(child =>
  child.type == "RECTANGLE" 
  || child.type == "GROUP" 
  || (androidNameParser(child.name).type !== AndroidType.text 
  && (child.type === "COMPONENT" 
  || child.type === "INSTANCE")))[0]

  const isAsset = ("isAsset" in layout 
  && layout.isAsset) 
  || layout.type === "GROUP" 
  || (androidNameParser(layout.name).type !== AndroidType.text
  && (layout.type === "COMPONENT" 
  || layout.type === "INSTANCE"))

  const hasPadding = layout.width !== node.width || layout.height !== node.height
  
  let childText: SceneNode & TextNode | undefined = undefined
  if (node.children.filter(child => androidNameParser(child.name).type === AndroidType.text).length !== 0) {
    childText = node.children.filter((child): child is SceneNode & BaseFrameMixin => 
      androidNameParser(child.name).type === AndroidType.text
    )[0].children.filter((child): child is SceneNode & BaseFrameMixin =>
      androidNameParser(child.name).type === AndroidType.frameLayout
    )[0].children.filter((child): child is SceneNode & TextNode => child.type === "TEXT")[0]
  }

  if (childText === undefined) {
    return { type: ButtonType.ImageButton, value: "ImageButton", layout: layout, text: undefined }
  } else if (isAsset) {
    return { type: ButtonType.ButtonText, value: "androidx.appcompat.widget.AppCompatButton", layout: layout, text: childText }
  } else {
    return { type: ButtonType.Button, value: "androidx.appcompat.widget.AppCompatButton", layout: layout, text: childText }
  }
}