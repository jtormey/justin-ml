
let categorize = (value) => {
  switch (value) {
    case ' ':
      return { type: 'space', value }
    case ':':
      return { type: 'colon', value }
    case ',':
      return { type: 'comma', value }
    case '"':
      return { type: 'quote', value }
    case '{':
      return { type: 'open_bracket', value }
    case '}':
      return { type: 'close_bracket', value }
    default:
      return { type: 'word', value }
  }
}

module.exports = (input) => {
  return input
    .trim()
    .split(/(\s|:|")/g)
    .filter(s => s !== '\n' && s.length)
    .map(categorize)
}
