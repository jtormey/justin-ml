
let vars = {}

let setVar = (name, value) => {
  if (vars[name] != null) throw new Error('variable already defined: ' + name)
  else vars[name] = value
}

let getVar = (name) => {
  let variable = vars[name]
  if (variable == null) throw new Error('variable not found: ' + name)
  return variable
}

let get = (type, input) => {
  let token = input.shift()
  if (token.type !== type) throw new Error('expected: ' + type)
  else return token.value
}

let takeUntil = (type, input) => {
  while (input.length && input[0].type !== type) input.shift()
}

let parseString = (input) => {
  let open = input.shift()
  if (open.type !== 'quote') throw new Error('expected: quote (open)')
  let str = ''
  while (input[0].type !== 'quote') {
    let next = input.shift()
    if (next == null || next.value == null) {
      throw new Error('next string value was null')
    }
    str += next.value
  }
  input.shift()
  return str
}

let getAttrs = (input, attrs = []) => {
  let token = input.shift()
  let attr = { type: 'Attribute' }

  switch (token.type) {
    case 'open_bracket':
      return attrs
    case 'space':
      break

    case 'word': {
      attr.name = token.value
      get('colon', input)
      let isNextVar = input[0].type === 'variable'
      attr.value = isNextVar ? getVar(get('variable', input)) : parseString(input)
      attrs.push(attr)
      break
    }

    default:
      throw new Error(`expected type: space, word (received: ${token.type})`)
  }
  return getAttrs(input, attrs)
}

let getChildren = (input, children = []) => {
  let token = input.shift()

  switch (token.type) {
    case 'close_bracket':
      return children
    case 'space':
      break
    case 'newline':
      break
    case 'comment':
      takeUntil('newline', input)
      break

    case 'keyword': {
      get('space', input)
      let name = get('variable', input)
      get('space', input)

      switch (token.value) {
        case 'def': {
          setVar(name, {
            type: 'Static',
            value: parseString(input)
          })
          break
        }

        case 'tmpl': {
          get('open_bracket', input)
          let children = getChildren(input)
          if (children.length !== 1) {
            throw new Error('template must have one child element')
          }
          setVar(name, {
            type: 'Template',
            value: children[0]
          })
          break
        }
      }
      break
    }

    case 'word': {
      children.push({
        type: 'Element',
        name: token.value,
        attrs: getAttrs(input),
        children: getChildren(input)
      })
      break
    }

    case 'quote': {
      input.unshift(token)
      children.push({
        type: 'TextNode',
        value: parseString(input)
      })
      break
    }

    case 'variable': {
      let variable = getVar(token.value)
      switch (variable.type) {
        case 'Static':
          children.push({
            type: 'TextNode',
            value: variable.value
          })
          break
        case 'Template':
          children.push(variable.value)
          break
        default:
          throw new Error('encountered unknown variable type')
      }
      break
    }

    default:
      throw new Error(`expected type: word (received ${token.type})`)
  }

  return input.length > 0 ? getChildren(input, children) : children
}

module.exports = (input) => {
  return {
    type: 'Root',
    children: getChildren(input)
  }
}
