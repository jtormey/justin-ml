
let renderAttrs = (attrs) => {
  return attrs
    .map(a => ` ${a.name}="${a.value}"`)
    .join('')
}

let renderIndent = (x) => (
  [...Array(x)].map(_ => ' ').join('')
)

let renderElem = (options, lvl = 0) => (elem) => {
  let indent = renderIndent(lvl * options.indentDepth)
  switch (elem.type) {
    case 'TextNode':
      return indent + elem.value
    case 'Element': {
      let tag = elem.name
      let attrs = renderAttrs(elem.attrs)
      return [
        indent + '<' + tag + attrs + '>',
        ...elem.children.map(renderElem(options, lvl + 1)),
        indent + '</' + tag + '>'
      ].join(options.lineSeperator)
    }
    default:
      throw new Error('received invalid type')
  }
}

module.exports = (input) => {
  let min = Boolean(process.env.MINIFY)

  let lineSeperator = min ? '' : '\n'
  let indentDepth = min ? 0 : 2

  return input.children
    .map(renderElem({ lineSeperator, indentDepth }))
    .join(lineSeperator)
}
