<script>
import SchemesTable from "./components/SchemesTable.vue"
import IndexingSet from "./components/IndexingSet.vue"
import PicaEditor from "pica-editor"

import { indexingFromPica } from "../src/lib/pica-jskos"

import Enricher from "../src/lib/enricher"
import jskos from "jskos-tools"
const { ConceptScheme } = jskos
import { PicaPath } from "pica-data"

import config from "../src/config.js"
import { fetchJSON } from "../src/lib/utils.js"
import cdk from "cocoda-sdk"


export default {
  components: { SchemesTable, PicaEditor, IndexingSet },
  provide() {
    return { jskos, cocoda: config.cocoda }
  },
  data() {
    return {
        indexing: {},
        schemes: [],
        avram: undefined,
        enricher: undefined,
        enrichedIndexing: {},
        dbkey: 'opac-de-627',
        ppn: undefined,        
        examples: config.examples,
    }
  },
  created() {
      this.loadSchemes()
  },    
  methods: {
      async loadSchemes() {
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
        const url = config.avramApi + "?profile=" + this.profile + "&field=" + indexingFields.map(s=>s.fieldIdentifier()).join("|")
        this.avram = await fetchJSON(url)

        this.enricher = new Enricher({ ...config, schemes })
      },      
      updatePPN(ppn) {
        this.ppn = ppn
      },
      loadRecord(ppn) {
        // Use $nextTick to give dbkey the chance to propagate to PicaEditor
        this.$nextTick(() => {
          this.$refs.recordEditor.loadRecord(ppn)
        })
      },

      async updateRecord(record) {
        this.indexing = indexingFromPica(record, this.schemes)
        await this.loadConceptLabels(this.indexing)

        this.enrichedIndexing = await this.enricher.enrich(this.indexing)
        await this.loadConceptLabels(this.enrichedIndexing)
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
      }
  }
}
</script>
