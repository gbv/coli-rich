import lint from "mocha-eslint"

// ESLint as part of the tests
let paths = [
  "**/*.js",
  "**/*.vue",
  "**/.*.js",
  "!node_modules/**/*",
  "!node_modules/**/.*",
  "!dist/**/*",
  "!dist/**/.*",
]
let options = {
  contextName: "ESLint",
}
lint(paths, options)
