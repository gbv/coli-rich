import pkg from "../package"

const config =
{
  // where to get PICA records from
  unapi: "https://unapi.k10plus.de/",
  dbkey: "opac-de-627",

  // where to get PICA Avram schema from
  avramApi: "https://format.k10plus.de/avram.pl",

  // where to get mappings from
  mappingsRegistry: {
    provider: "MappingsApi", 
    api: "https://coli-conc.gbv.de/api/",
  },

  // link into Cocoda
  cocoda: "https://coli-conc.gbv.de/cocoda/app/",

  port: "3077",

  examples: [
    "1673636357",
    "168675535X", // only DDC and LCC
    "786733772",
    "1726524604", // contains enrichment
    "161165839X",
  ],
}

// eslint-disable-next-line no-undef
config.env = process.env.NODE_ENV || "development"

if (config.env === "development") {
  const { publicPath } = pkg.vue
  config.scripts = [
    `${publicPath}js/chunk-vendors.js`,
    `${publicPath}js/chunk-common.js`,
    `${publicPath}js/app.js`,
  ]
} else {
  config.scripts = ["dist/js/chunk-vendors.js", "dist/js/app.js"]
}

export default config
