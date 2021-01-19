import { indexingFromPica, indexingToPica, indexingToDiff, serializeDiff } from "./pica-jskos"

import schemes from "../data/schemes"
import databases from "../data/databases"
import config from "../config/index.js"

import { RequestError, NotFoundError } from "./api-errors"

import Enricher from "./enricher.js"

import axios from "axios"

const getPicaRecord = async id => {
  const url = `${config.unapi}?id=${id}&format=picajson`
  return await axios.get(url).then(res => res.data).catch(() => { throw new NotFoundError(`PICA record not found: ${id}`) })
}

const sendText = (res, text) => {
  res.setHeader("Content-Type", "text/plain")
  res.send(text)
}

import { serializePica } from "pica-data"

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

  return indexingFromPica(await getPicaRecord(id), schemes)
}

export async function indexingHandler (req, res, next) {
  const { id, format } = req.query

  try {
    const indexing = await getIndexings(id)

    if (format === "picajson") {
      res.send(indexingToPica(indexing, schemes))
    } else if (format === "pp") {
      const ppn = id.split(":").pop()
      const pica = serializePica(indexingToPica(indexing, schemes))
      sendText(res, "003@ $0" + ppn + "\n" + pica)
    } else {
      res.json(indexing)
    }
  } catch(error) {
    next(error)
  }
}

const enricher = new Enricher({ ...config, schemes })

export async function enrichHandler (req, res, next) {
  const { id, format, strategy } = req.query

  try {
    const indexing = await enricher.enrich(await getIndexings(id), strategy)

    if (format === "indexing") {
      res.json(indexing)
    } else {
      const diff = indexingToDiff(indexing, schemes)
      const ppn = id.split(":").pop()
      diff.unshift(["=", "003@", null, "0", ppn])

      if ( format === "diff" ) {
        res.json(diff)
      } else {
        sendText(res, serializeDiff(diff))
      }
    }
  } catch(error) {
    next(error)
  }
}
