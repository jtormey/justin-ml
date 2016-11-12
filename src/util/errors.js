
let { pad } = require('./helpers')

let generalError = (type, errorf) => (...args) => (
  `${type}\n\n\t${errorf(...args)}\n`
)

let syntaxError = generalError('Syntax Error', (typeA, typeB) =>
  `Expected <${typeA}> but received <${typeB}>`
)

let typeError = generalError('Type Error', (type, varName) => {
  switch (type) {
    case 'undefined':
      return `Variable '${varName}' not found, is it out of scope?`
    case 'defined':
      return `Variable '${varName}' has already been defined`
    case 'not_static':
      return `Attribute variable '${varName}' must be assigned to a static type`
    case 'tmpl_child':
      return `Template '${varName}' must have exactly one child`
  }
})

let eoiError = generalError('Unexpected End of Input', () =>
  `Expected a token but reached end of input stream`
)

let lexicalError = (input, meta) => (
  `Unexpected Token (line ${meta.lc})\n
    | ${meta.lastline}${input.split('\n')[0]}
    | ${pad('~', meta.lastline.length)}^
  `
)

module.exports = {
  generalError,
  syntaxError,
  typeError,
  eoiError,
  lexicalError
}
