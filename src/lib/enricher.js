import { mappingsByFromConcept, enrichIndexing } from "./indexing.js"

export default class Enricher {

  constructor(config) {
    this.mappingApi = config.mappingApi
    this.fetchJSON = config.fetchJSON
    this.schemes = config.schemes
  }    

  async enrich(indexing, { from, toScheme }) {
    const query = {
      from:       (from||[]).join("|"),
      toScheme:   (toScheme||[]).join("|"),
    }

    // TODO: support multiple strategies

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
