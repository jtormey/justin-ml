
# justin-ml

Just another templating language

## Usage

### Installation

From npm: `npm i -g justin-ml`

From local copy: `npm i -g .`, or run with the `npm start` script

### Compiling

Options

* `-V, --version` Installed version
* `-i, --input` Input file (optional, can use file arg instead)
* `-o, --output` Output file (optional, default writes to stdout)
* `--pretty` Format outputted html

```
$ justin-ml compile_this.jml
```

## Language

### Syntax

Brackets instead of closing tags

```
div {
  span { }
}
```

Attributes use : instead of =

```
a href:"google.com" { }
```

Text represented as strings

```
span { "some text" }
```

JS style comments

```
// This will be ignored
span { "hello" }
```

### Features

Variables

```
def $primary "blue"
def $link "google.com"

a href:$link color:$primary {
  "go to " $link
}
```

Templates

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

## Todo

* Way to import other files
* Control flow keywords
