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

let readIn = () => {
  let src = program.input ? program.input : program.args[0]
  return fs.readFileSync(src).toString()
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

writeOut(compile(readIn(), options))
