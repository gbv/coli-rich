import lint from "mocha-eslint"

// ESLint as part of the tests
let paths = [
  "*.js",
  "src/**/*.{js,vue}",
]
let options = {
  contextName: "ESLint",
}
lint(paths, options)
