
let { expect } = require('chai')
let compile = require('..')

let test = (tmpl, output) => () => {
  expect(compile(tmpl)).to.equal(output.replace(/\s{2,}/g, ''))
}

let fail = (tmpl, error) => () => {
  expect(() => compile(tmpl)).to.throw(error)
}

describe('compiler', () => {
  it('should compile a string', test(
    `"hello world"`,
    `hello world`
  ))

  it('should compile basic html', test(
    `span {}`,
    `<span></span>`
  ))

  it('should compile nested html', test(
    `div {
      span { "text" }
    }`,
    `<div>
      <span>text</span>
    </div>`
  ))

  it('should compile html attributes', test(
    `div id:"mydiv" {
      p class:"text" { "content" }
    }`,
    `<div id="mydiv">
      <p class="text">content</p>
    </div>`
  ))

  it('should ignore comments', test(
    `// this should be ignored
    span { "hello" } // same here`,
    `<span>hello</span>`
  ))

  it('should interpret a content variable', test(
    `def $text "hello world"
    span { $text }`,
    `<span>hello world</span>`
  ))

  it('should interpret an attribute variable', test(
    `def $home "google.com"
    a href:$home { "home" }`,
    `<a href="google.com">home</a>`
  ))

  it('should not be able to use an undefined variable', fail(
    `span { $nonexistent }`,
    'Type Error'
  ))

  it('should not be able reassign a variable', fail(
    `def $var "a" def $var "b"
    span { $var }`,
    'Type Error'
  ))

  it('should not be able to use a variable that is out of scope', fail(
    `div { def $var "closure" }
    span { $var }`,
    'Type Error'
  ))

  it('should interpret a tmpl', test(
    `tmpl $btn () {
      button { "click me" }
    }
    div {
      $btn ()
    }`,
    `<div>
      <button>click me</button>
    </div>`
  ))

  it('should interpret a tmpl with args', test(
    `tmpl $btn ($color $text) {
      button color:$color { $text }
    }
    div {
      $btn ("grey" "cancel")
      $btn ("blue" "continue")
    }`,
    `<div>
      <button color="grey">cancel</button>
      <button color="blue">continue</button>
    </div>`
  ))

  it('should pass variables to tmpl args', test(
    `def $primary "blue"
    def $secondary "grey"
    tmpl $btn ($color $text) {
      button color:$color { $text }
    }
    div {
      $btn ($secondary "cancel")
      $btn ($primary "continue")
    }`,
    `<div>
      <button color="grey">cancel</button>
      <button color="blue">continue</button>
    </div>`
  ))

  it('should fail if not passed correct args', fail(
    `tmpl $anchor ($link) { a href:$link { $link } }
    div { $anchor () }`,
    'Received mismatched args lists'
  ))
})
