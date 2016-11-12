
let { contains, asArray } = require('./util/helpers')
let { root, element, text, variable, attribute } = require('./util/nodes')
let { syntaxError, typeError, eoiError } = require('./util/errors')

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

class Scope {
  constructor (parent = null, args = []) {
    this._scope = {}
    this._parent = parent
    this._args = args
  }
  get depth () {
    return this._parent ? this._parent.depth + 1 : 0
  }
  set (name, value) {
    if (this.get(name)) {
      throw new Error(typeError('defined', name))
    }
    this._scope[name] = value
    return this
  }
  get (name) {
    return (
      this._scope[name] || (this._parent && this._parent.get(name)) || null
    )
  }
  call (args = []) {
    if (this._args.length !== args.length) {
      throw new Error('Received mismatched args lists')
    }
    let closure = new Scope(this)
    this._args.forEach((arg, i) => closure.set(arg.value, args[i]))
    return closure
  }
  create (args) {
    return new Scope(this, args)
  }
  link (parent) {
    this._parent = parent
    return this
  }
}

let getAttrs = (scope, parser, attrs = []) => {
  let token = parser.take()

  switch (token.type) {
    case 'open_bracket':
      return attrs

    case 'attribute': {
      let name = token.value
      let value = parser.take(['string', 'variable'])
      attrs.push(attribute(name, value))
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
          let variable = parser.take('string')
          scope.set(name, variable)
          break
        }

        case 'tmpl': {
          parser.take('open_paren')
          let args = parser.takeAll('variable')
          parser.take('close_paren')
          parser.take('open_bracket')

          let closure = scope.create(args)
          let children = getChildren(closure, parser)

          if (children.length !== 1) {
            let e = typeError('tmpl_child', name)
            throw new Error(e)
          }

          scope.set(name, {
            type: 'tmpl',
            scope: closure,
            value: children[0]
          })
          break
        }
      }
      break
    }

    case 'tag': {
      let node = element(scope, token.value, getAttrs(scope, parser))
      node.children = getChildren(node.scope, parser)
      children.push(node)
      break
    }

    case 'string': {
      children.push(text(token.value))
      break
    }

    case 'variable': {
      if (parser.nextType === 'open_paren') {
        parser.take('open_paren')
        let args = parser.takeAll(['string', 'variable'])
        parser.take('close_paren')
        children.push(variable(token.value, args))
      } else {
        children.push(variable(token.value))
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
  let rootScope = new Scope()
  let node = root(rootScope)
  node.children = getChildren(node.scope, parser)
  return node
}
