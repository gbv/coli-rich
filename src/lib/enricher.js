import { picaSchemes, indexingFromPica } from "./pica-jskos.js"
import { mappingsByFromConcept, enrichIndexing } from "./indexing.js"
import { PicaPath } from "pica-data"

import { fetchJSON } from "./utils.js"

/**
 * - holds a set of Concept Schemes with PICAPATH
 * - loads an Avram Schema with those fields
 */

export default class Enricher {

  constructor(config) {
        
    // configuration (required)
    this.mappingApi = config.mappingApi
    this.avramApi = config.avramApi
    this.profile = "k10plus"

    // is set via setSchemes
    this.schemes = undefined
    this.avram = undefined
  }

  // set concept schemes and load Avram schema with PICA fields listed in schemes
  async setSchemes(schemes) {
    this.schemes = picaSchemes(schemes)
        
    this.indexingFields = [new PicaPath("003@"),...Object.values(this.schemes).map(s => s.PICAPATH)]
    console.log(this.indexingFields)

    const url = this.avramApi + "?profile=k10plus&field=" + this.indexingFields.map(s=>s.fieldIdentifier()).join("|")
    this.avram = await fetchJSON(url)
  }

  extractIndexing(record) {
    return indexingFromPica(record || [], this.schemes)
  }

  async enrich(indexing, options) {
    const query = {
      fromScheme: options.fromScheme.join("|"),
      from:       options.from.join("|"),
      toScheme:   options.toScheme.join("|"),
    }

    console.log(options)

    const mappings = await fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
    const mappingsFrom = mappingsByFromConcept(mappings)

    console.log(mappings)

    // add information to indexing concepts (also for display)
    Object.values(indexing).forEach(c => c.forEach(c => {
      c.mappings = mappingsFrom[c.uri] || []
      c.mappings.forEach(m => {
        m.toScheme = this.schemes[m.toScheme.uri] || m.toScheme
        m.to.memberSet.forEach(c => c.inScheme = [m.toScheme])
      })
    }))

    return enrichIndexing(indexing, mappingsFrom)
  }


}
