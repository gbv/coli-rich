import { isEmpty } from "./utils.js"

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


