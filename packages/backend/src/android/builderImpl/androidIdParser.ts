export function androidIdParser(idName: string):string {
  let id = idName.split("_")
  id.shift()

  switch (id[0]) {
    case "txt":
      id.shift()
      id.unshift("text")
      break
    case "btn":
      id.shift()
      id.unshift("button")
      break
    case "li":
      id.shift()
      id.unshift("list")
      break
    case "lii":
      id.shift()
      id.unshift("listItem")
      break
    case "sw":
      id.shift()
      id.unshift("switch")
      break
    case "cb":
      id.shift()
      id.unshift("checkBox")
      break
    case "vScroll":
    case "vs":
      id.shift()
      id.unshift("vertical_scroll")
      break
    case "hScroll":
    case "hs":
      id.shift()
      id.unshift("horizontal_scroll")
      break
    case "rbtn":
      id.shift()
      id.unshift("radioButton")
      break
    case "editText":
    case "etxt":
      id.shift()
      id.unshift("editText")
      break
    case "linear":
    case "lin":
      id.shift()
      id.unshift("linear_layout")
      break
    default:
      break
  }
  return id.join("_") ?? idName
}