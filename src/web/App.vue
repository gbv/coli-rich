/* eslint-disable vue/valid-template-root */
<template>
  <p>
    Aus im Rahmen von <a href="https://coli-conc.gbv.de/">coli-conc</a> gesammelten
    Konkordanzen lässt sich die inhaltliche Erschließung von PICA-Datensätzen
    anreichern. An dieser Stelle kann die automatische Anreicherung durch Mappings
    ausprobiert werden. Mappings können mit <a :href="cocoda">Cocoda</a> erstellt
    und bearbeitet werden.
  </p>
  <section v-if="!isEmpty(schemes)">
    <table>
      <thead>
        <tr><th>Datensatz</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <ul class="inline">
              <li
                v-for="(db, key) in databases"
                :key="key">
                <input
                  v-model="dbkey"
                  type="radio"
                  :value="key"
                  style="margin-right:0.5em;">
                <a :href="db.picabase">
                  <concept-link :concept="db" />
                </a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td
            id="recordEditor"
            style="vertical-align: top;">
            <PicaEditor
              ref="recordEditor"
              :unapi="unapi"
              :dbkey="dbkey"
              :fields="fieldFilter"
              :picabase="databases[dbkey].picabase"
              @change="recordChanged" />
            <div
              v-if="examples && examples.length"
              style="font-size: smaller; padding-top: 0.2em;">
              Beispiele:
              <ul class="inline">
                <li
                  v-for="ex in examples"
                  :key="ex">
                  <a @click="loadRecord(ex)">{{ ex }}</a>
                </li>
              </ul>
            </div>
          </td>
        </tr>
      </tbody>
      <thead>
        <tr><th>Ermittelte Anreicherung</th></tr>
        <tr><td>Momentan werden nur 1-zu-1 Mappings zu Vokabularen mit denen noch nicht erschlossen wurde berücksichtigt.</td></tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <PicaEditor ref="enrichmentEditor" />
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <section v-if="!isEmpty(schemes)">
    <indexing-table
      :indexing="indexing"
      :schemes="schemes" />
  </section>
  <section v-if="!isEmpty(schemes)">
    <table>
      <caption>Unterstützte Vokabulare</caption>
      <thead>
        <tr>
          <th>↦ </th>
          <th>⇥</th>
          <th />
          <th>Name</th>
          <th colspan="2">
            Cocoda
          </th>
          <th>Felder</th>
          <th>Valide Notationen</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="scheme in schemes"
          :key="scheme.uri">
          <td>
            <input
              v-model="fromScheme"
              type="checkbox"
              :value="scheme.uri">
          </td>
          <td>
            <input
              v-model="toScheme"
              type="checkbox"
              :value="scheme.uri">
          </td>
          <td>{{ scheme.notation[0] }}</td>
          <td>{{ scheme.prefLabel.de }}</td>
          <td><a :href="cocoda+'?fromScheme='+scheme.uri">↦ </a></td>
          <td><a :href="cocoda+'?toScheme='+scheme.uri">⇥</a></td>
          <td>
            <pica-path
              :path="scheme.PICAPATH"
              :api="avram" />
          </td>
          <td v-if="scheme.notationPattern">
            {{ scheme.notationPattern }}
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      <em>Nicht aufgeführte Vokabulare, (Unter)Felder und invalide Notationen werden ignoriert!</em>
    </p>
  </section>
</template>

<script>
import PicaEditor from "./components/PicaEditor.vue"
import ConceptLink from "./components/ConceptLink.vue"
import IndexingTable from "./components/IndexingTable.vue"
import PicaPath from "./components/PicaPath.vue"

import config from "./config.js"
import { picaSchemes, indexingFromPica, indexingToPica } from "../lib/pica-jskos.js"
import { mappingsByFromConcept, indexingConcepts, enrichIndexing } from "./indexing.js"
import { isEmpty, fetchJSON } from "./utils.js"

export default {
  components: { PicaEditor, PicaPath, ConceptLink, IndexingTable },
  provide() {
    return {
      cocoda: this.cocoda,
    }
  },
  data() {
    const { avram } = config
    return {
      ...config,
      avram,
      ppn: "",
      loadSchemesPromise: null,
      schemes: {},
      fromScheme: [],
      toScheme: [],
      indexing: {},
      mappings: [],
      record: [],
      fieldFilter: ["...."],
    }
  },
  watch: {
    $route({ query }) {
      const { ppn, dbkey } = query
      if (!ppn || !dbkey) {
        return
      }
      // Load record when ppn or dbkey has changed
      if (ppn != this.ppn || dbkey != this.dbkey) {
        this.dbkey = dbkey
        this.loadRecord(ppn)
      }
    },
  },
  created() {
    this.$watch("indexing", () => this.getMappings())
    this.$watch("fromScheme", () => this.getMappings())
    this.$watch("toScheme", () => this.getMappings())
    this.$watch("schemes", () => this.updateIndexing())
    this.$watch("dbkey", () => this.loadRecord(this.ppn))
    this.loadSchemesPromise = this.loadSchemes()
  },
  methods: {
    isEmpty,
    async loadSchemes() {
      const schemes = picaSchemes(await fetchJSON("schemes.json"))
      this.fromScheme = Object.values(schemes).map(s => s.uri)
      this.toScheme   = Object.values(schemes).map(s => s.uri)
      this.fieldFilter = ["003@",...Object.values(schemes).map(s => s.PICAPATH)]
      this.schemes = schemes
    },
    async loadRecord(ppn) {
      // Wait for schemes to be loaded
      await this.loadSchemesPromise
      this.$refs.recordEditor.setPPN(ppn)
      this.$refs.recordEditor.loadRecord()
    },
    recordChanged(ev) {
      this.ppn = ev.ppn
      this.record = ev.record || []
      this.updateIndexing()
    },
    updateIndexing() {
      this.indexing = indexingFromPica(this.record, this.schemes)
    },
    getMappings() {
      const { toScheme, indexing, schemes } = this

      const from = new Set()
      const fromScheme = this.fromScheme.filter(uri => !isEmpty(indexing[uri]))
      fromScheme.map(uri => (indexing[uri] || []).forEach(c => from.add(c.uri)))

      // unset current mappings
      for(let c of indexingConcepts(indexing)) {
        c.mappings = []
      }

      if (!from.size) {
        this.$refs.enrichmentEditor.setRecord([])
        return
      }

      // TODO: support querying by type and partOf

      const query = {
        fromScheme: fromScheme.join("|"),
        from:       Array.from(from).join("|"),
        toScheme:   toScheme.join("|"),
      }

      return fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
        .then(mappings => {
          const mappingsFrom = mappingsByFromConcept(mappings)

          // add information for display
          Object.values(indexing).forEach(c => c.forEach(c => {
            c.mappings = mappingsFrom[c.uri]
            c.mappings.forEach(m => {
              m.toScheme = schemes[m.toScheme.uri] || m.toScheme
              m.to.memberSet.forEach(c => c.inScheme = [m.toScheme])
            })
          }))

          // calculate enrichment
          return enrichIndexing(indexing, mappingsFrom)
        })
        .then( ({add}) => {
          // show enrichment
          this.$refs.enrichmentEditor.setRecord(indexingToPica(add, this.schemes))
        })
    },
  },
}
</script>

<style>
#recordEditor div.CodeMirror {
  height: 20ex;
}
</style>
