
# justin-ml

Just another templating language

## Syntax

### Brackets instead of closing tags

```
div {
  span { }
}
```

### Attributes use : instead of =

```
a href:"google.com" { }
```

### Text represented as strings

```
span { "some text" }
```

### JS style comments

```
// This will be ignored
span { "hello" }
```

## Language Features

### Variables

```
def $primary "blue"
def $link "google.com"

a href:$link color:$primary {
  "go to " $link
}
```

### Templates

```
tmpl $button ($color $action) {
  button color:$color {
    "clicking here will " $action
  }
}

div class:"shopping-cart-footer" {
  $button ("grey" "cancel your order")
  $button ("green" "continue to checkout")
}
```
