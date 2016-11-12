
let { pad } = require('./util/helpers')

let renderAttrs = (attrs) => (
  attrs.map(a => ` ${a.name}="${a.value}"`).join('')
)

let isSingleTextNode = (xs) => (
  xs.length === 1 && typeof xs[0] === 'string'
)

let renderElem = (options, lvl = 0) => (elem) => {
  let indent = pad(' ', lvl * options.indentDepth)

  if (typeof elem === 'string') {
    return indent + elem
  }

  let attrs = renderAttrs(elem.attributes)
  let compact = isSingleTextNode(elem.children)
  let children = compact ? elem.children : elem.children.map(renderElem(options, lvl + 1))

  return [
    indent + '<' + elem.tag + attrs + '>',
    ...children,
    (compact ? '' : indent) + '</' + elem.tag + '>'
  ].join(compact ? '' : options.lineSeperator)
}

module.exports = (input) => {
  let min = Boolean(process.env.MINIFY)
  let lineSeperator = min ? '' : '\n'
  let indentDepth = min ? 0 : 2

  return input
    .map(renderElem({ lineSeperator, indentDepth }))
    .join(lineSeperator)
}
