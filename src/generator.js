
let parse = JSON.parse
let assign = (...args) => Object.assign({}, ...args)
let show = (o) => console.log(JSON.stringify(o, null, 2))

let textNode = (value) => ({
  type: 'TextNode', value
})

let evaluate = (parent, elem) => {
  let scope = parent.scope
  let variable = scope[elem.value]
  switch (variable.type) {
    case 'string':
    case 'Variable':
    case 'Static':
      return [parent, textNode(variable.value)]
    case 'Template': {
      if (elem.args.length !== variable.args.length) {
        throw new Error('mismatching args lists')
      }
      let tmpScope = assign(variable.scope)
      variable.args.forEach((a, i) => {
        let inArg = elem.args[i]
        let resolve = (val) => { tmpScope[a.value] = val }
        switch (inArg.type) {
          case 'string': resolve(inArg)
            break
          case 'variable': resolve(tmpScope[inArg.value])
            break
        }
      })
      let children = assign(variable.value)
      children.scope = assign(children.scope, tmpScope)
      return [assign(parent, { scope: tmpScope }), children]
    }
    default:
      throw new Error(`Tried to evaluate unknown type ${variable.type}, should never happen`)
  }
}

let renderAttrs = (scope, attrs) => attrs.map(attr => {
  let { type, value } = attr.value
  let name = attr.name.slice(0, -1)
  switch (type) {
    case 'string':
      return ` ${name}="${parse(value)}"`
    case 'Argument':
      return ` ${name}="${parse(scope[value].value)}"`
  }
}).join('')

let renderIndent = (x) => (
  [...Array(x)].map(_ => ' ').join('')
)

let renderElem = (parent, options, lvl = 0) => (elem) => {
  let indent = renderIndent(lvl * options.indentDepth)
  switch (elem.type) {
    case 'TextNode':
      return indent + parse(elem.value)
    case 'Element': {
      let tag = elem.name
      let attrs = renderAttrs(parent.scope, elem.attrs)
      elem.scope = assign(elem.scope, parent.scope)
      return [
        indent + '<' + tag + attrs + '>',
        ...elem.children.map(renderElem(elem, options, lvl + 1)),
        indent + '</' + tag + '>'
      ].join(options.lineSeperator)
    }
    case 'Variable': {
      let tree = evaluate(parent, elem)
      return renderElem(tree[0], options, lvl)(tree[1])
    }
    default:
      throw new Error('Tried to render unknown node type, should never happen')
  }
}

module.exports = (input) => {
  let min = Boolean(process.env.MINIFY)

  let lineSeperator = min ? '' : '\n'
  let indentDepth = min ? 0 : 2

  return input.children
    .map(renderElem(input, { lineSeperator, indentDepth }))
    .join(lineSeperator)
}
