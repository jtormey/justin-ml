
let parse = JSON.parse

let assign = (...args) =>
  Object.assign({}, ...args)

let inherit = (s0, s1) =>
  Object.assign(s0, s1)

let show = (o) =>
  console.log(JSON.stringify(o, null, 2))

let pad = (c, n) =>
  [...Array(n)].map(_ => c).join('')

let first = (xs) =>
  xs && xs.length ? xs[0] : null

module.exports = {
  parse,
  assign,
  inherit,
  show,
  pad,
  first
}
