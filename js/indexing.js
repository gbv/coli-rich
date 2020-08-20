import { isEmpty } from "./utils.js"

export function* indexingConcepts(indexing) {
  for (let scheme in indexing) {
    for (let concept of indexing[scheme]) {
      yield concept
    }
  }
}

// partition mappings by from concept uri
export function mappingsByFromConcept(mappings) {
  const from = {}

  mappings
    // only respect 1-to-... mappings with memberSets
    .filter(m => ((m.from||{}).memberSet||[]).length === 1)
    .filter(m => (m.to||{}).memberSet)
    .forEach(m => {
      const { uri } = m.from.memberSet[0]        
      if (uri) {
        if (uri in from) {
          from[uri].push(m)
        } else {
          from[uri] = [m]
        }
      }
    })

  return from
}

// use concept mappings from an IndexingSet to create additional IndexingSet
export function enrichIndexing(indexing, mappings) {
  const add = {}

  for (const from in mappings) {
    // TODO: if multiple mappings to same target scheme, take best one
      
    mappings[from].forEach(m => {

      // only respect 1-to-1-mappings
      if (m.to.memberSet.length !== 1) return

      const toScheme = m.toScheme.uri

      // skip if KOS is already used in indexing
      if (!isEmpty(indexing[toScheme])) return

      // TODO: take into account mapping type

      const set = (add[toScheme] = add[toScheme] || {})
      const notation = m.to.memberSet[0].notation
      const SOURCE = m.uri
      set[notation] = { notation, SOURCE }
    })
  }

  for (const scheme in add) {
    add[scheme] = Object.values(add[scheme])
  }

  return { add }
}


