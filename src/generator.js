
let renderAttrs = (attrs) => (
  attrs.map(a => ` ${a.name}="${a.value}"`).join('')
)

let renderIndent = (x) => (
  [...Array(x)].map(_ => ' ').join('')
)

let renderElem = (options, lvl = 0) => (elem) => {
  let indent = renderIndent(lvl * options.indentDepth)

  if (typeof elem === 'string') {
    return indent + elem
  }

  let attrs = renderAttrs(elem.attributes)
  return [
    indent + '<' + elem.tag + attrs + '>',
    ...elem.children.map(renderElem(options, lvl + 1)),
    indent + '</' + elem.tag + '>'
  ].join(options.lineSeperator)
}

module.exports = (input) => {
  let min = Boolean(process.env.MINIFY)
  let lineSeperator = min ? '' : '\n'
  let indentDepth = min ? 0 : 2

  return input
    .map(renderElem({ lineSeperator, indentDepth }))
    .join(lineSeperator)
}
