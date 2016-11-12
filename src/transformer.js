
let { parse } = require('./util/helpers')
let { typeError } = require('./util/errors')

let attribute = (scope) => (attr) => {
  return {
    name: attr.name.slice(0, -1),
    value: evaluate(scope, attr.value)
  }
}

let transform = (scope) => (node) => {
  let { type } = node
  switch (type) {
    case 'Element':
      node.scope.link(scope)
      let attributes = node.attrs.map(attribute(scope))
      let children = node.children.map(transform(node.scope))
      return { tag: node.name, attributes, children }
    case 'Variable':
      let ref = scope.get(node.name)
      if (ref == null) {
        throw new Error(typeError('undefined', node.name))
      }
      return evaluate(scope, ref, node.args)
    case 'Text':
      return parse(node.value)
    default:
      throw new Error(`Received unknown node type ${type}, should not happen`)
  }
}

function evaluate (scope, ref, args) {
  let { type, value } = ref
  switch (type) {
    case 'string':
      return parse(value)
    case 'tmpl':
      let transformElem = transform(ref.scope.call(args))
      return transformElem(value)
    case 'variable':
      return evaluate(scope, scope.get(value), args)
    default:
      throw new Error(`Received unknown ref type ${type}, failed to evaluate`)
  }
}

module.exports = (root) => {
  return root.children.map(transform(root.scope))
}
