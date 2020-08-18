import { isEmpty } from "./utils.js"
import { PicaPath } from "./pica.js"

// use concept mappings from an IndexingSet to create additional IndexingSet
export function enrichIndexing(indexing) {
  const addSet = {}
  for (const fromScheme in indexing) {
    indexing[fromScheme].forEach(concept => {
      (concept.mappings || []).forEach(m => {

        // only respect 1-to-1-mappings
        if (m.from.memberSet.length !== 1) return
        if (m.to.memberSet.length !== 1) return

        const toScheme = m.toScheme.uri

        // skip if KOS is already used in indexing
        if (!isEmpty(indexing[toScheme])) return

        // TODO: take into account mapping type

        const set = (addSet[toScheme] = addSet[toScheme] || {})
        const notation = m.to.memberSet[0].notation
        const SOURCE = m.uri
        set[notation] = { notation, SOURCE }
      })
    })
  }

  for (const scheme in addSet) {
    addSet[scheme] = Object.values(addSet[scheme])
  }

  return addSet
}

// convert IndexingSet with known schemes to PICA record
export function indexingToPica(indexing, schemes) {
  const pica = []
  const occCounter = {}

  for (const schemeUri in indexing) {
    const scheme = schemes[schemeUri]

    if (!scheme || !scheme.PICAPATH) continue
    const path = scheme.PICAPATH instanceof PicaPath
      ? scheme.PICAPATH : new PicaPath(scheme.PICAPATH)

    indexing[schemeUri].forEach(concept => {
      const notation = concept.notation[0]

      var id   = path.toString
      var occ  = path.occurrenceString

      if (path.startOccurrence) {
        if (id in occCounter) {
          occ = occCounter[id]
        } else {
          occ = path.startOccurrence
        }
        occCounter[id] = occ>8 ? (1*occ)+1 : "0"+((1*occ)+1)
      }

      const field = [path.tagString, occ]
      field.push(path.subfieldString, notation)
      if (concept.SOURCE) {
        field.push("A", concept.SOURCE)
      }

      pica.push(field)
    })
  }

  return pica
}
