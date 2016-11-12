
exports.staticVar = (value) => ({
  type: 'Static', value
})

exports.tmplVar = (scope, args) => ({
  type: 'Template', scope: Object.assign({}, scope), args
})

exports.rootNode = () => ({
  type: 'Root', scope: {}
})

exports.elementNode = (scope, name, attrs) => ({
  type: 'Element', name, attrs, scope: Object.assign({}, scope)
})

exports.textNode = (value) => ({
  type: 'TextNode', value
})

exports.attributeNode = (name, value) => ({
  type: 'Attribute', name, value
})

exports.variableNode = (value, args) => ({
  type: 'Variable', value, args
})
