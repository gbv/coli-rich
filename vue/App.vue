<script>
import SchemesTable from "./components/SchemesTable.vue"
import IndexingTable from "./components/IndexingTable.vue"
import PicaEditor from "pica-editor"

import { indexingFromPica } from "../src/lib/pica-jskos"

import Enricher from "../src/lib/enricher"
import jskos from "jskos-tools"

import config from "../src/config.js"
import { isEmpty, fetchJSON } from "../src/lib/utils.js"

export default {
  components: { SchemesTable, PicaEditor, IndexingTable },
  provide() {
    return { jskos, cocoda: config.cocoda }
  },
  data() {
    return {
        indexing: {},
        schemes: [],
    }
  },
  created() {
      this.loadSchemes()
  },    
  methods: {
      async loadSchemes() {
        this.schemes = await fetchJSON("api/voc")
      },
      async updateRecord(record) {
        this.indexing = indexingFromPica(record, this.schemes)
      }
  }
}
/*
  // set concept schemes and load Avram schema with PICA fields listed in schemes
  _setSchemes(schemes) {
    this.profile = "k10plus"
    this.avramApi = config.avramApi
    this.avram = undefined
    this.schemes = picaSchemes(schemes)
        
    this.indexingFields = [new PicaPath("003@"),...Object.values(this.schemes).map(s => s.PICAPATH)]

    const url = this.avramApi + "?profile=" + this.profile + "&field=" + this.indexingFields.map(s=>s.fieldIdentifier()).join("|")
    this.fetchJSON(url).then(avram => { this.avram = avram })
    // TODO: catch error and throw error message
  }
*/
</script>
