/**
 * Module to map between subject indexing in PICA and in JSKOS.
 */

import jskos from "jskos-tools"
const { ConceptScheme } = jskos

import { PicaPath } from "pica-data"

// Create a set of JSKOS concept schemes with PICAPATH
export const picaSchemes = array =>
  (array||[]).filter(s => s.PICAPATH).reduce((schemes, s) => {
    s = new ConceptScheme(s)
    s.PICAPATH = new PicaPath(s.PICAPATH)
    schemes[s.uri] = s
    return schemes
  }, {})

const ensureScheme = scheme => scheme instanceof ConceptScheme ? scheme : new ConceptScheme(scheme)
const ensurePath = path => path instanceof PicaPath ? path : new PicaPath(path)

// extract indexing with known pica schemes from PICA record
export const indexingFromPica = (record, schemes) => {
  const indexing = {}
  for (let scheme of schemes) {
    scheme = ensureScheme(scheme)
    const path = ensurePath(scheme.PICAPATH)
    const values = path.getUniqueValues(record)
    if (values.length) {
      const toConcept = n => scheme.conceptFromNotation(n, { inScheme: true })
      indexing[scheme.uri] = values.map(toConcept).filter(Boolean)
    }
  }
  return indexing
}

// convert indexing set with known pica schemes to PICA record
export const indexingToPica = (indexing, schemes) => {
  const pica = []
  const occCounter = {}

  for (const uri in indexing) {
    let scheme = schemes.find(s => s.uri === uri || (s.identifier||[]).find(i => i === uri))
    if (!scheme || !scheme.PICAPATH) continue

    scheme = ensureScheme(scheme)
    const path = ensurePath(scheme.PICAPATH)

    indexing[uri].forEach(concept => {
      const notation = concept.notation[0]

      var id   = path.toString()
      var occ  = path.occurrenceString()

      if (path.startOccurrence()) {
        if (id in occCounter) {
          occ = occCounter[id]
        } else {
          occ = path.startOccurrence()
        }
        occCounter[id] = occ>8 ? (1*occ)+1 : "0"+((1*occ)+1)
      }

      const field = [path.tagString(), occ]
      field.push(path.subfieldString(), notation)
      if (concept.SOURCE) {
        field.push("A", concept.SOURCE)
      }

      pica.push(field)
    })
  }

  return pica
}
