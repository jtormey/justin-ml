
let renderAttrs = (attrs) => {
  return attrs
    .map(a => ` ${a.name}="${a.value}"`)
    .join('')
}

let renderElem = (elem) => {
  switch (elem.type) {
    case 'TextNode':
      return elem.value
    case 'Element': {
      let tag = elem.name
      let attrs = renderAttrs(elem.attrs)
      return [
        '<' + tag + attrs + '>',
        ...elem.children.map(renderElem),
        '</' + tag + '>'
      ].join('')
    }
    default:
      throw new Error('received invalid type')
  }
}

module.exports = (input) => {
  return input.children
    .map(renderElem)
    .join('')
}
