import pkg from "../package"
import _ from "lodash"
import { readFileSync } from "fs"

// Prepare environment
import dotenv from "dotenv"
dotenv.config()
const env = process.env.NODE_ENV || "development"
const configFile =  (process.env.CONFIG_FILE || "./config/config.json")

// Load default config
import configDefault from "./config.default.json"

// Load user config
let configUser = {}
try {
  configUser = JSON.parse(readFileSync(configFile, "utf8"))
} catch(error) {
  console.warn(`Warning: Could not load configuration file from ${configFile}. The application might not behave as expected.`)
}

// set script pathes depending on environment
let scripts = ["dist/js/chunk-vendors.js", "dist/js/app.js"]
if (env === "development") {
  const { publicPath } = pkg.vue
  scripts = [
    `${publicPath}js/chunk-vendors.js`,
    `${publicPath}js/chunk-common.js`,
    `${publicPath}js/app.js`,
  ]
}

// merge and export configuration
export default _.defaultsDeep({ env, scripts }, configUser, configDefault)
