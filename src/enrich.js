import schemes from "../data/schemes"
import databases from "../data/databases"
import config from "./config"

import { RequestError, NotFoundError } from "./api-errors.js"

import axios from "axios"
const fetchJSON = async url => axios.get(url).then(res => res.data)

const sendText = (res, text) => {
  res.setHeader("Content-Type", "text/plain")
  res.send(text)
}

import { isEmpty } from "./lib/utils.js"
import { indexingToPica } from "./lib/pica-jskos.js"
import { serializePica, serializePicaField } from "pica-data"

import Enricher from "./lib/enricher.js"
const enricher = new Enricher({...config, fetchJSON })
enricher.setSchemes(schemes)

async function getIndexings(id) {
  if (!id) {
    throw new RequestError("Missing query parameter: id")
  } else if (!id.match(/^[^:]+:ppn:[0-9X]+$/)) {
    throw new RequestError("Malformed query parameter: id")
  }

  const dbkey = id.split(":ppn:")[0]
  if (!databases.find(db => db.dbkey === dbkey)) {
    throw new RequestError(`Database ${dbkey} not supported`)
  }

  const url = `${config.unapi}?id=${id}&format=picajson`
  const record = await fetchJSON(url).catch(() => { throw new NotFoundError(`PICA record not found: ${id}`) })

  return enricher.extractIndexing(record)
}

export async function indexingHandler (req, res, next) {
  const { id, format } = req.query

  try {
    const indexing = await getIndexings(id)

    if (format === "picajson") { 
      res.send(indexingToPica(indexing, enricher.schemes))
    } else if (format === "pp") {
      const ppn = id.split(":").pop()
      const pica = serializePica(indexingToPica(indexing, enricher.schemes))
      sendText(res, "003@ $0" + ppn + "\n" + pica)
    } else {
      res.json(indexing)
    }
  } catch(error) {
    next(error)
  }
}

export async function enrichHandler (req, res, next) {
  var { id, format, fromScheme, toScheme } = req.query

  try {
    const indexing = await getIndexings(id)
    const ppn = id.split(":").pop()

    // defaults
    fromScheme = fromScheme ? fromScheme.split("|") : Object.values(enricher.schemes).map(s => s.uri)
    toScheme = toScheme ? toScheme.split("|") : Object.values(enricher.schemes).map(s => s.uri)

    // <TODO>
    // TODO: move to Enricher, this lines duplicated in App.vue
    var from = new Set()
    fromScheme = fromScheme.filter(uri => !isEmpty(indexing[uri]))
    fromScheme.map(uri => (indexing[uri] || []).forEach(c => from.add(c.uri)))
    from = Array.from(from)

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
    // </TODO>

  } catch(error) {
    next(error)
  }


}
