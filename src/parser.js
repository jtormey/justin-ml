
let { assign, contains, asArray } = require('./util/helpers')
let { staticVar, tmplVar, rootNode, elementNode, textNode, attributeNode, variableNode } = require('./util/nodes')
let { syntaxError, typeError, eoiError } = require('./util/errors')

let argsToScope = (scope, args) => (
  assign(scope, ...args.map(a => ({ [a.value]: { type: 'Argument', value: a.value } })))
)

class Parser {
  constructor (tokens) {
    this._tokens = tokens
  }
  get endOfInput () {
    return this._tokens.length === 0
  }
  get nextType () {
    if (this.endOfInput) {
      throw new Error(eoiError())
    }
    return this._tokens[0].type
  }
  take (types) {
    let nextType = this.nextType
    if (types && !contains(nextType, asArray(types))) {
      throw new Error(syntaxError(types, nextType))
    }
    return this._tokens.shift()
  }
  takeAll (types) {
    let tokens = []
    while (contains(this.nextType, types)) {
      tokens.push(this.take(types))
    }
    return tokens
  }
}

let setVar = (scope, name, value) => {
  if (scope[name] != null) {
    let e = typeError('defined', name)
    throw new Error(e)
  }
  scope[name] = value
}

let getVar = (scope, name) => {
  let variable = scope[name]
  if (variable == null) {
    let e = typeError('undefined', name)
    throw new Error(e)
  }
  return variable
}

let getAttrs = (scope, parser, attrs = []) => {
  let token = parser.take()

  switch (token.type) {
    case 'open_bracket':
      return attrs

    case 'attribute': {
      let value
      let name = token.value
      if (parser.nextType === 'variable') {
        let variable = getVar(scope, parser.take('variable').value)
        if (variable.type !== 'Static' && variable.type !== 'Argument') {
          let e = typeError('not_static', token.value)
          throw new Error(e)
        }
        value = variable
      } else {
        value = parser.take('string')
      }
      attrs.push(attributeNode(name, value))
      break
    }

    default:
      let expected = ['open_bracket', 'attribute']
      let e = syntaxError(expected, token.type)
      throw new Error(e)
  }
  return getAttrs(scope, parser, attrs)
}

let getChildren = (scope, parser, children = []) => {
  let token = parser.take()

  switch (token.type) {
    case 'close_bracket':
      return children

    case 'keyword': {
      let name = parser.take('variable').value

      switch (token.value) {
        case 'def': {
          let variable = staticVar(parser.take('string').value)
          setVar(scope, name, variable)
          break
        }

        case 'tmpl': {
          parser.take('open_paren')
          let args = parser.takeAll('variable')
          parser.take('close_paren')
          parser.take('open_bracket')
          let node = tmplVar(scope, args)
          let children = getChildren(argsToScope(node.scope, node.args), parser)
          if (children.length !== 1) {
            let e = typeError('tmpl_child', name)
            throw new Error(e)
          }
          node.value = children[0]
          setVar(scope, name, node)
          break
        }
      }
      break
    }

    case 'tag': {
      let node = elementNode(scope, token.value, getAttrs(scope, parser))
      node.children = getChildren(node.scope, parser)
      children.push(node)
      break
    }

    case 'string': {
      children.push(textNode(token.value))
      break
    }

    case 'variable': {
      let variable = getVar(scope, token.value)
      switch (variable.type) {
        case 'Static':
          children.push(variableNode(token.value))
          break
        case 'Argument':
          children.push(variableNode(token.value))
          break
        case 'Template':
          parser.take('open_paren')
          let args = parser.takeAll(['string', 'variable']).map(a =>
            a.type === 'variable' ? getVar(scope, a.value) && a : a
          )
          parser.take('close_paren')
          children.push(variableNode(token.value, args))
          break
      }
      break
    }

    default:
      let expected = ['close_bracket', 'keyword', 'tag', 'string', 'variable']
      let e = syntaxError(expected, token.type)
      throw new Error(e)
  }

  return parser.endOfInput ? children : getChildren(scope, parser, children)
}

module.exports = (input) => {
  let parser = new Parser(input)
  let node = rootNode()
  node.children = getChildren(node.scope, parser)
  return node
}
