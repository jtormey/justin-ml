#!/usr/bin/env node

let fs = require('fs')
let program = require('commander')
let pkg = require('../../package.json')
let compile = require('../..')

program
  .version(pkg.version)
  .usage('[options] <file>')
  .option('-i, --input <file>', 'File to compile to html')
  .option('-o, --output <file>', 'File to write output to')
  .option('--pretty', 'Make output pretty')
  .parse(process.argv)

let readIn = (cb) => {
  let src = program.input ? program.input : program.args[0]
  if (src != null) {
    if (src.slice(-4) !== '.jml') {
      throw new Error('File must be a .jml file')
    }
    cb(fs.readFileSync(src).toString())
  } else if (!process.stdin.isTTY) {
    let input = []
    process.stdin.on('data', (data) => { input.push(data.toString()) })
    process.stdin.on('end', () => { cb(input.join('')) })
  } else {
    program.help()
  }
}

let writeOut = (output) => {
  if (program.output) {
    fs.writeFileSync(program.output, output)
  } else {
    process.stdout.write(output)
  }
}

let options = {
  pretty: program.pretty
}

readIn(input => {
  writeOut(compile(input, options))
})
