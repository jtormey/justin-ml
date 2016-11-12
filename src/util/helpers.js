
let util = require('util')

let parse = JSON.parse
let show = (o) => console.log(util.inspect(o, { depth: 10, colors: true }))

let assign = (...args) =>
  Object.assign({}, ...args)

let inherit = (s0, s1) =>
  Object.assign(s0, s1)

let pad = (c, n) =>
  [...Array(n)].map(_ => c).join('')

let first = (xs) =>
  xs && xs.length ? xs[0] : null

let contains = (elem, list) =>
  list.indexOf(elem) > -1

let asArray = (maybeArray) =>
  maybeArray && Array.isArray(maybeArray) ? maybeArray : [maybeArray]

let randId = () =>
  Math.random().toString(36).slice(2, 8)

module.exports = {
  parse,
  show,
  assign,
  inherit,
  pad,
  first,
  contains,
  asArray,
  randId
}
