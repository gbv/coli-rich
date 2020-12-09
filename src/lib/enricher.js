import { picaSchemes, indexingFromPica } from "./pica-jskos.js"
import { mappingsByFromConcept, enrichIndexing } from "./indexing.js"
import { PicaPath } from "pica-data"

export default class Enricher {

  constructor(config) {
        
    // configuration (required)
    this.mappingApi = config.mappingApi
    this.avramApi = config.avramApi
    this.profile = "k10plus"
    this.fetchJSON = config.fetchJSON

    // is set via setSchemes
    this.schemes = {}
    this.avram = undefined
  }    

  // set concept schemes and load Avram schema with PICA fields listed in schemes
  async setSchemes(schemes) {
    this.schemes = picaSchemes(schemes)
        
    this.indexingFields = [new PicaPath("003@"),...Object.values(this.schemes).map(s => s.PICAPATH)]

    const url = this.avramApi + "?profile=k10plus&field=" + this.indexingFields.map(s=>s.fieldIdentifier()).join("|")
    this.avram = await this.fetchJSON(url)
    // TODO: catch error and throw error message
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

    const mappings = await this.fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
    const mappingsFrom = mappingsByFromConcept(mappings)

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
