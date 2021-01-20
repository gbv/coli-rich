/* global process */
import pkg from "../package"
import _ from "lodash"
import { readFileSync } from "fs"

import databases from "../data/databases"

// Prepare environmento
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
const jsPath = env === "development" ? pkg.vue.publicPath : "dist/"
const scripts = [ `${jsPath}js/chunk-vendors.js`, `${jsPath}js/app.js` ]

// merge and export configuration
export default _.defaultsDeep({ env, scripts, databases }, configUser, configDefault)
