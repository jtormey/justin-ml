
exports.root = (scope) => ({
  type: 'Root', scope
})

exports.element = (scope, name, attrs) => ({
  type: 'Element', scope: scope.create(), name, attrs
})

exports.text = (value) => ({
  type: 'Text', value
})

exports.variable = (name, args) => ({
  type: 'Variable', name, args
})

exports.attribute = (name, value) => ({
  type: 'Attribute', name, value
})
