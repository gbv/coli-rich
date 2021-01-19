<script>
import SchemesTable from "./components/SchemesTable.vue"
import IndexingSet from "./components/IndexingSet.vue"
import PicaEditor from "pica-editor"

import { indexingFromPica, indexingToDiff, serializeDiff } from "../src/pica-jskos"

import Enricher from "../src/enricher"
import jskos from "jskos-tools"
const { ConceptScheme } = jskos
import { PicaPath } from "pica-data"

import cdk from "cocoda-sdk"

// fetch JSON data, return null on error
const fetchJSON = url => fetch(url).then(res => res.ok ? res.json() : null)

export default {
  components: { SchemesTable, PicaEditor, IndexingSet },
  provide() {
    return { jskos, cocoda: undefined }
  },
  data() {
    return {
      indexing: {},
      schemes: [],
      avram: undefined,
      enricher: undefined,
      enrichedIndexing: {},
      diff: "",
      dbkey: "opac-de-627",
      ppn: undefined,
      examples: [],
      loadSchemesPromise: null,
    }
  },
  watch: {
    $route({ query }) {
      const { id } = query
      if (!id || !id.match(/^[^:]+:ppn:[0-9X]+$/)) {
        return
      }
      const [dbkey, ppn] = id.split(":ppn:")
      // Load record when ppn or dbkey has changed
      if (ppn != this.ppn || dbkey != this.dbkey) {
        this.ppn = ppn
        this.dbkey = dbkey
        // Wait for schemes to be loaded, then load record
        this.loadSchemesPromise.then(() => this.loadRecord(ppn))
      }
    },
  },
  created() {
    fetchJSON("api/config").then(config => {
      this.config = config
      this.cocoda = config.cocoda
      this.examples = config.examples
      this.loadSchemesPromise = this.loadSchemes()
    })
  },
  methods: {
    async loadSchemes() {
      // TODO: use cocoda-sdk instead
      const schemes =(await fetchJSON("api/voc")).map(s => new ConceptScheme(s))

      for (let s of schemes) {
        const api = s.API ? s.API[0] : undefined
        if (api) {
          s.REGISTRY = await cdk.initializeRegistry({ api, provider: "ConceptApi" })
        }
      }

      this.schemes = schemes

      this.profile = "k10plus"
      const indexingFields = ["003@",...Object.values(schemes).map(s => s.PICAPATH)].map(p => new PicaPath(p))
      const url = this.config.avramApi + "?profile=" + this.profile + "&field=" + indexingFields.map(s=>s.fieldIdentifier()).join("|")
      this.avram = await fetchJSON(url)

      const config = this.config
      this.enricher = new Enricher({ ...config, schemes })
    },
    updatePPN(ppn) {
      if (ppn !== ppn) {
        this.ppn = ppn
        this.$router.push({ query: { id: `${this.dbkey}:ppn:${ppn}` }})
      }
    },
    loadRecord(ppn) {
      // Use $nextTick to give dbkey the chance to propagate to PicaEditor
      this.$nextTick(() => {
        this.$refs.recordEditor.loadRecord(ppn)
      })
    },

    async updateRecord(record) {
      this.enrichedIndexing = {}
      this.diff = ""

      this.indexing = indexingFromPica(record, this.schemes)
      await this.loadConceptLabels(this.indexing)

      this.enrichedIndexing = await this.enricher.enrich(this.indexing)
      await this.loadConceptLabels(this.enrichedIndexing)

      this.diff = serializeDiff(indexingToDiff(this.enrichedIndexing, this.schemes))
    },

    async loadConceptLabels(indexingSet) {
      for (let [uri, concepts] of Object.entries(indexingSet)) {
        const scheme = this.schemes.find(s => s.uri === uri)
        if (scheme && scheme.REGISTRY && concepts.length) {
          const found = await scheme.REGISTRY.getConcepts({ concepts })
          for (let {uri, prefLabel} of found) {
            concepts.find(c => c.uri === uri).prefLabel = prefLabel
          }
        }
      }
    },
  },
}
</script>
