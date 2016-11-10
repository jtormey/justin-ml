
let vars = {}

let setVar = (name, value) => {
  if (vars[name] != null) {
    throw new Error('variable already defined: ' + name)
  } else {
    vars[name] = value
  }
}

let getVar = (name) => {
  let val = vars[name]
  if (val == null) {
    throw new Error('variable not found: ' + name)
  }
  return String(val)
}

let get = (type, input) => {
  let token = input.shift()
  if (token.type !== type) {
    throw new Error('expected: ' + type)
  } else {
    return token
  }
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
    case 'space':
      return getAttrs(input, attrs)
    case 'word':
      attr.name = token.value
      get('colon', input)
      attr.value = input[0].type === 'variable'
        ? getVar(input.shift().value)
        : parseString(input)
      attrs.push(attr)
      return getAttrs(input, attrs)
    case 'open_bracket':
      return attrs
    default:
      throw new Error(`expected type: space, word (received: ${token.type})`)
  }
}

let getChildren = (input, children = []) => {
  if (input.length === 0) {
    return children
  }
  let token = input.shift()
  switch (token.type) {
    case 'keyword': {
      get('space', input)
      let variable = get('variable', input)
      get('space', input)
      let value = parseString(input)
      setVar(variable.value, value)
      return getChildren(input, children)
    }
    case 'close_bracket':
      return children
    case 'space':
      return getChildren(input, children)
    case 'word': {
      children.push({
        type: 'Element',
        name: token.value,
        attrs: getAttrs(input),
        children: getChildren(input)
      })
      if (input.length) {
        getChildren(input, children)
      }
      break
    }
    case 'quote': {
      input.unshift(token)
      children.push({
        type: 'TextNode',
        value: parseString(input)
      })
      getChildren(input, children)
      break
    }
    case 'variable': {
      children.push({
        type: 'TextNode',
        value: getVar(token.value)
      })
      getChildren(input, children)
      break
    }
    case 'comment':
      takeUntil('newline', input)
      getChildren(input, children)
      break
    case 'newline':
      getChildren(input, children)
      break
    default:
      throw new Error(`expected type: word (received ${token.type})`)
  }
  return children
}

module.exports = (input) => {
  return {
    type: 'Document',
    children: getChildren(input)
  }
}
