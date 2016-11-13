
let lexer = require('./lexer')
let parser = require('./parser')
let transformer = require('./transformer')
let generator = require('./generator')

module.exports = (code, options) => (
  generator(transformer(parser(lexer(code))), options)
)
