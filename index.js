
let lexer = require('./src/lexer')
let parser = require('./src/parser')
let transformer = require('./src/transformer')
let generator = require('./src/generator')

module.exports = (mul) => (
  generator(transformer(parser(lexer(mul))))
)
