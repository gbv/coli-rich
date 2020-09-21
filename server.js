import express from "express"
const app = express()
app.set("json spaces", 2)

// configuration
import config from "./src/config.js"

// Add default headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

import { errorHandler, RequestError, NotFoundError } from "./src/api/errors.js"

import axios from "axios"
import { isEmpty } from "./src/lib/utils.js"
import Enricher from "./src/lib/enricher.js"
import { readFileSync } from "fs"
import { indexingToPica } from "./src/lib/pica-jskos.js"
import { serializePica, serializePicaField } from "pica-data"

const fetchJSON = async url => axios.get(url).then(res => res.data)
const schemes = JSON.parse(readFileSync("./public/schemes.json"))
const enricher = new Enricher({...config, fetchJSON })

function sendText(res, text) {
  res.setHeader("Content-Type", "text/plain")
  res.send(text)
}

app.get("/", async (req, res, next) => {
  var { id, format, fromScheme, toScheme } = req.query

  if (!id) {
    return next(new RequestError("Missing query parameter: id"))
  } else if (!id.match(/^[^:]+:ppn:[0-9X]+$/)) {
    return next(new RequestError("Malformed query parameter: id"))
  }
    
  // eslint-disable-next-line no-unused-vars
  const [dbkey, ppn] = id.split(":ppn:")

  // defaults
  fromScheme = fromScheme ? fromScheme.split("|") : Object.values(enricher.schemes).map(s => s.uri)
  toScheme = toScheme ? toScheme.split("|") : Object.values(enricher.schemes).map(s => s.uri)

  const url = `${config.unapi}?id=${id}&format=picajson`
  const record = await fetchJSON(url).catch(() =>  
    next(new NotFoundError("Record not found: "+id)))
  if (!record) return

  const indexing = enricher.extractIndexing(record)

  // TODO: move to Enricher, this lines duplicated in App.vue
  var from = new Set()
  fromScheme = fromScheme.filter(uri => !isEmpty(indexing[uri]))
  fromScheme.map(uri => (indexing[uri] || []).forEach(c => from.add(c.uri)))
  from = Array.from(from)

  if (format === "indexing") {
    res.json(indexing)
  } else if (format === "picajson") { 
    res.send(indexingToPica(indexing, enricher.schemes))
  } else if (format === "pp") {
    pica = serializePica(indexingToPica(indexing, enricher.schemes))
    sendText(res, "003@ $0" + ppn + "\n" + pica)
  } else {
    const diff = await enricher.enrich(indexing, { fromScheme, toScheme, from })
    if (format === "diff") {
      res.json(diff)
    } else {
      // TODO: move to pica-data library
      var pica = ["  003@ $0" + ppn]
      if (diff.add) {
        pica.push(
          ...indexingToPica(diff.add, enricher.schemes).map(field => "+ " + serializePicaField(field)),
        )
      }
      // TODO: fields to remove

      sendText(res, pica.join("\n"))
    }
  }
})

// TODO: respect query parameters?
app.get("/voc", (req, res) => {
  res.json(Object.values(schemes))
})

app.use(errorHandler)

enricher.setSchemes(schemes).then(() => {
  console.log("Initialized with "+Object.keys(enricher.schemes).length+" concept schemes (see /voc)")
  const { port } = config
  app.listen(port, () => {
    console.log(`Now listening on port ${port}`)
  })
})
