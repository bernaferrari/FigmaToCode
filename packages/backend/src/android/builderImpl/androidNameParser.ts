
export enum AndroidType {
  view,
  button,
  text,
  linearLayout,
  verticalScrollView,
  horizontalScrollView,
  switch,
  checkBox,
  radioButton,
  list,
  listItem,
  editText,
  frameLayout
}

export const androidNameParser = (name: string | undefined): { type: AndroidType, id: string } => {
  if (!name) {
    return { type: AndroidType.frameLayout, id: "" }
  } else {
    let id = name.split("_")
    id.shift()
    let type = AndroidType.frameLayout
    switch (id[0]) {
      case "view":
        type = AndroidType.view
        break
      case "text":
      case "txt":
        type = AndroidType.text
        break
      case "button":
      case "btn":
        type = AndroidType.button
        break
      case "list":
      case "li":
        type = AndroidType.list
        break
      case "listItem":
      case "lii":
        type = AndroidType.listItem
        break
      case "switch":
      case "sw":
        type = AndroidType.switch
        break
      case "checkBox":
      case "cb":
        type = AndroidType.checkBox
        break
      case "vScroll":
      case "vs":
        type = AndroidType.verticalScrollView
        break
      case "hScroll":
      case "hs":
        type = AndroidType.horizontalScrollView
        break
      case "radioButton":
      case "rbtn":
        type = AndroidType.radioButton
        break
      case "editText":
      case "etxt":
        type = AndroidType.editText
        break
      case "linear":
      case "lin":
        type = AndroidType.linearLayout
        break
      default:
        type = AndroidType.frameLayout
        break
    }
    id.shift()
    if (id.length !== 0) {
      id.unshift(`${AndroidType[type]}`)
    }
    
    return { type: type, id: id.join("_") ?? "" }
  }
}