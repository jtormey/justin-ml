
let { assign } = require('./util/helpers')
let { staticVar, tmplVar, rootNode, elementNode, textNode, attributeNode, variableNode } = require('./util/nodes')
let { syntaxError, typeError } = require('./util/errors')

let argsToScope = (scope, args) => (
  assign(scope, ...args.map(a => ({ [a.value]: { type: 'Argument', value: a.value } })))
)

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

let get = (type, input) => {
  let token = take(input)
  if (!token || token.type !== type) {
    let e = syntaxError(type, token ? token.type : null)
    throw new Error(e)
  }
  return token
}

let getAll = (type, input) => {
  let tokens = []
  while (input[0] && input[0].type === type) tokens.push(take(input))
  return tokens
}

let getEvery = (types, input) => {
  let tokens = []
  while (types.indexOf(input[0] && input[0].type) > -1) tokens.push(take(input))
  return tokens
}

let take = (input) => input.shift()

let getAttrs = (scope, input, attrs = []) => {
  let token = take(input)

  switch (token.type) {
    case 'open_bracket':
      return attrs

    case 'attribute': {
      let value
      let name = token.value
      if (input[0].type === 'variable') {
        let variable = getVar(scope, get('variable', input).value)
        if (variable.type !== 'Static' && variable.type !== 'Argument') {
          let e = typeError('not_static', token.value)
          throw new Error(e)
        }
        value = variable
      } else {
        value = get('string', input)
      }
      attrs.push(attributeNode(name, value))
      break
    }

    default:
      let expected = ['open_bracket', 'attribute']
      let e = syntaxError(expected, token.type)
      throw new Error(e)
  }
  return getAttrs(scope, input, attrs)
}

let getChildren = (scope, input, children = []) => {
  let token = take(input)

  switch (token.type) {
    case 'close_bracket':
      return children

    case 'keyword': {
      let name = get('variable', input).value

      switch (token.value) {
        case 'def': {
          let variable = staticVar(get('string', input).value)
          setVar(scope, name, variable)
          break
        }

        case 'tmpl': {
          get('open_paren', input)
          let args = getAll('variable', input)
          get('close_paren', input)
          get('open_bracket', input)
          let node = tmplVar(scope, args)
          let children = getChildren(argsToScope(node.scope, node.args), input)
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
      let node = elementNode(scope, token.value, getAttrs(scope, input))
      node.children = getChildren(node.scope, input)
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
          get('open_paren', input)
          let args =
            getEvery(['string', 'variable'], input)
            .map(a => a.type === 'variable' ? getVar(scope, a.value) && a : a)
          get('close_paren', input)
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

  return input.length > 0 ? getChildren(scope, input, children) : children
}

module.exports = (input) => {
  let node = rootNode()
  node.children = getChildren(node.scope, input)
  return node
}
