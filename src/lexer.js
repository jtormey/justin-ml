
let { assign, first } = require('./util/helpers')
let { lexicalError } = require('./util/errors')

class Lexer {
  constructor () {
    this._matches = []
  }
  match (exp, type, meta = {}) {
    this._matches.push({ exp, type, meta })
    return this
  }
  run (input, _tokens = [], _meta = { lc: 1, lastline: '' }) {
    let next = this._matches
      .map(m => assign(m, { value: first(input.match(m.exp)) }))
      .filter(m => m.value)
      .sort((a, b) => b.value.length > a.value.length)[0]

    if (!next) {
      let e = lexicalError(input, _meta)
      throw new Error(e)
    }

    if (next.value === '\n') {
      _meta.lc += 1
      _meta.lastline = ''
    } else {
      _meta.lastline += next.value
    }

    if (next.type != null) {
      let token = { type: next.type }
      if (next.meta.value) token.value = next.value
      _tokens.push(token)
    }

    let nextInput = input.slice(next.value.length)
    return nextInput.length ? this.run(nextInput, _tokens, _meta) : _tokens
  }
}

let lexer = new Lexer()

lexer
  .match('^{', 'open_bracket')
  .match('^}', 'close_bracket')
  .match(/^\(/, 'open_paren')
  .match(/^\)/, 'close_paren')
  .match(/^\s/, null)
  .match(/^\/\/[^\n]*/, null)
  .match(/^def|^tmpl/, 'keyword', { value: true })
  .match(/^"[^"^\n]*"/, 'string', { value: true })
  .match(/^\$(\w|\d)+/, 'variable', { value: true })
  .match(/^\w+(-\w+)?/, 'tag', { value: true })
  .match(/^\w+(-\w+)?:/, 'attribute', { value: true })

module.exports = (input) => {
  return lexer.run(input)
}
