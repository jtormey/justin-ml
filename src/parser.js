
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
      if (input.shift().type !== 'colon') {
        throw new Error('expected type: colon')
      } else {
        attr.value = parseString(input)
      }
      attrs.push(attr)
      return getAttrs(input, attrs)
    case 'open_bracket':
      return attrs
    default:
      throw new Error('expected type: space, word')

  }
}

let getChildren = (input, children = []) => {
  let token = input.shift()
  switch (token.type) {
    case 'close_bracket':
      return children
    case 'space':
      return getChildren(input, children, 0)
    case 'word': {
      children.push({
        type: 'Element',
        name: token.value,
        attrs: getAttrs(input),
        children: getChildren(input)
      })
      if (input.length) {
        getChildren(input, children, 1)
      }
      break
    }
    case 'quote': {
      input.unshift(token)
      children.push({
        type: 'TextNode',
        value: parseString(input)
      })
      getChildren(input, children, 2)
      break
    }
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
