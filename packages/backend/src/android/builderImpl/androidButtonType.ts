import { AndroidType, androidNameParser } from "./androidNameParser"

export enum ButtonType {
  Button,
  ImageButton,
  ImageTextButton,
  IconTextButton
}

export const androidButtonType = (node: SceneNode & BaseFrameMixin ): {
  type: ButtonType, 
  value: string, 
  layout: SceneNode | undefined,
  text: TextNode | undefined
} => {
  const linear = node.children.filter(child => androidNameParser(child.name).type === AndroidType.linearLayout)
  const layout = getLayout(node)
  const isAsset = getIsAsset(layout)
  const childText = getChildText(node)

  if (linear.length !== 0 && getLayout(linear[0]) && getChildText(linear[0])) {
    const layout = getLayout(linear[0])
    const text = getChildText(linear[0])
    return { type: ButtonType.IconTextButton, value: "", layout: layout, text: text }
  } else if (childText === undefined) {
    return { type: ButtonType.ImageButton, value: "ImageButton", layout: layout, text: undefined }
  } else if (isAsset) {
    return { type: ButtonType.ImageTextButton, value: "androidx.appcompat.widget.AppCompatButton", layout: layout, text: childText }
  } else {
    return { type: ButtonType.Button, value: "androidx.appcompat.widget.AppCompatButton", layout: layout, text: childText }
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

const getLayout = (node: SceneNode & BaseFrameMixin): SceneNode | undefined => {
  return node.children.filter(child =>
    child.type == "RECTANGLE" 
    || child.type == "GROUP" 
    || (androidNameParser(child.name).type !== AndroidType.text 
    && (child.type === "COMPONENT" 
    || child.type === "INSTANCE"))
  )[0]
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
