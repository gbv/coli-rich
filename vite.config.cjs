const path = require("path")
const license = require("rollup-plugin-license")

module.exports = {
  optimizeDeps: {
    include: ["codemirror"],
  },
  esbuildTarget: "es2015",
  rollupInputOptions: {
    plugins: [
      // Add a plugin that assembles licenses for dependencies
      license({
        banner: {
          commentStyle: "ignored",
          content: "For license information, please see LICENSES.txt.",
        },
        thirdParty: {
          output: {
            file: path.join(__dirname, "dist", "_assets", "LICENSES.txt"),
          },
        },
      }),
    ],
  },
}
