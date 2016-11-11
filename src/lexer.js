
let keywords = ['def', 'tmpl']

let categorize = (value) => {
  let is = (s) => value === s
  let startsWith = (s) => value.indexOf(s) === 0
  let isKeyword = () => keywords.indexOf(value) > -1

  switch (true) {
    case is(' '):
      return { type: 'space', value }
    case is(':'):
      return { type: 'colon', value }
    case is('"'):
      return { type: 'quote', value }
    case is('{'):
      return { type: 'open_bracket', value }
    case is('}'):
      return { type: 'close_bracket', value }
    case is('\n'):
      return { type: 'newline', value }
    case startsWith('//'):
      return { type: 'comment', value }
    case startsWith('$'):
      return { type: 'variable', value }
    case isKeyword():
      return { type: 'keyword', value }
    default:
      return { type: 'word', value }
  }
}

module.exports = (input) => {
  return input
    .trim()
    .split(/(\s|:|\/\/|")/g)
    .filter(s => s.length)
    .map(categorize)
}
