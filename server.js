import express from "express"
const app = express()
app.set("json spaces", 2)

// configuration
import config from "./src/config.js"

// Add default headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  next()
})

import axios from "axios"
import { isEmpty } from "./src/lib/utils.js"
import Enricher from "./src/lib/enricher.js"
import { readFileSync } from "fs"
import { indexingConcepts } from "./src/lib/indexing.js"
import { indexingToPica } from "./src/lib/pica-jskos.js"

const fetchJSON = async url => axios.get(url).then(res => res.data)

const schemes = JSON.parse(readFileSync("./public/schemes.json"))
const enricher = new Enricher({...config, fetchJSON })

app.get("/", async (req, res, next) => {
  var { dbkey, ppn, format, fromScheme, toScheme } = req.query

  // defaults
  fromScheme = fromScheme ? fromScheme.split("|") : Object.values(schemes).map(s => s.uri)
  toScheme = toScheme ? toScheme.split("|") : Object.values(schemes).map(s => s.uri)
  dbkey = dbkey || config.dbkey

  try {
    if (!ppn) throw new Error("Missing parameter: ppn") 

    const id = `${dbkey}:ppn:${ppn}`
    const url = `${config.unapi}?id=${id}&format=picajson`
    const record = await fetchJSON(url)
      .catch(() => { throw new Error("Record not found: "+id) } )
    const indexing = enricher.extractIndexing(record)

    // TODO: move to Enricher
    var from = new Set()
    fromScheme = fromScheme.filter(uri => !isEmpty(indexing[uri]))
    fromScheme.map(uri => (indexing[uri] || []).forEach(c => from.add(c.uri)))
    for(let c of indexingConcepts(indexing)) {
      c.mappings = []
    }
    from = Array.from(from)

    const result = await enricher.enrich(indexing, { fromScheme, toScheme, from })
    if (format === "pica") {
      res.json(indexingToPica(result, enricher.schemes)) // FIXME
    } else {
      res.json(result)
    }
 
  } catch(error) {
    return next(error) // TODO: add error handler
  }
})

// TODO: respect query parameters?
app.get("/voc", (req, res) => {
  res.json(schemes)
})

enricher.setSchemes(schemes).then(() => {
  console.log("Initialized with "+Object.keys(enricher.schemes).length+" concept schemes (see /voc)")
  const { port } = config
  app.listen(port, () => {
    console.log(`Now listening on port ${port}`)
  })
})
