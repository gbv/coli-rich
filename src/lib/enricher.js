import cdk from "cocoda-sdk"

const clone = data => JSON.parse(JSON.stringify(data))

export default class Enricher {

  constructor(config) {
    this.registry = cdk.initializeRegistry(config.mappingsRegistry)
    this.schemes = config.schemes
  }    

  findScheme(scheme) {
    const { uri } = scheme
    return this.schemes.find(s => s.uri === uri || (s.identifier||[]).find(i => i === uri))
  }

  async enrich(indexing, strategy = {}) {

    const fromScheme = strategy.fromScheme
      ? strategy.fromScheme.filter(uri => indexing[uri])  // explicitly listed
      : Object.keys(indexing)                             // all schemes

    const toScheme = strategy.toScheme
      ? strategy.toScheme.filter(uri => indexing[uri])    // explicitly listed
      : this.schemes.filter(s => !indexing[s.uri])        // all schemes

    const from = [].concat(fromScheme.map(uri => indexing[uri].map(c => c.uri)))
    if (!from.length) {
      return {}
    }

    const query = {
      from:     from.join("|"),
      toScheme: toScheme.map(s => s.uri).join("|"),
    }
    var mappings = await this.registry.getMappings(query)

    // post-filter mappings:
    // only respect 1-to-x mappings with memberSets
    mappings = mappings
      .filter(m => ((m.from||{}).memberSet||[]).length === 1)
      .filter(m => m.from.memberSet[0].uri)        
      .filter(m => (m.to||{}).memberSet)
      .filter(m => (m.toScheme||{}).uri)
    
    const indexingSet = clone(indexing)
    Object.values(indexingSet).forEach(set => set.forEach(c => c.PATCH = "="))

    mappings.forEach(m => {
      const scheme = this.findScheme(m.toScheme)
      if (scheme) {
        const { memberSet } = m.to
        
        if (!indexingSet[scheme.uri]) {
          indexingSet[scheme.uri] = []
        }          
        const set = indexingSet[scheme.uri]

        for (let concept of memberSet) {
          const duplicate = set.find(c => c.uri === concept.uri)

          concept = duplicate || concept
          concept.inScheme = { uri: scheme.uri, notation: scheme.notation }
          concept.PATCH = "+"

          if (concept.mappings) {
            concept.mappings.push(clone(m))
          } else {
            concept.mappings = [clone(m)]
          }

          if (!duplicate) {
            set.push(concept) 
          }
        }
      }
    })

    // TODO: post-process indexingSet to filter out concepts to remove

    return indexingSet
  }
}
