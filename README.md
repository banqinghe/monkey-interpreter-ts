# monkey-interpreter-ts

This is a TypeScript implementation of the [Monkey Programming Language](https://monkeylang.org/) interpreter, as described in the book *Writing An Interpreter In Go* by Thorsten Ball.

Most of the code for the interpreter itself is directly translated from Go to TypeScript, with some minor adjustments to fit the TypeScript environment.

## Quick Start

Just try executing `npx monkey-parser` in the shell, there will be a fully functional repl.

## Run

Node.js >= 18

```shell
pnpm install

# execute all tests
pnpm test

# start the repl
pnpm repl # try `.load ./example/sum.mky` in repl
```
