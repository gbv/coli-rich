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
    <h3>Datensatz</h3>
    <div>
      <ul class="inline">
        <li
          v-for="(db, key) in databases"
          :key="key">
          <input
            :id="'check-'+key"
            type="radio"
            :value="key"
            :checked="dbkey == key"
            style="margin-right:0.5em;"
            @input="dbkey = key; loadRecord(null)">
          <label :for="'check-'+key">
            <concept-link :concept="db" />
          </label>
        </li>
      </ul>
    </div>
    <div
      id="recordEditor">
      <PicaEditor
        ref="recordEditor"
        :unapi="unapi"
        :dbkey="dbkey"
        :filter="fieldFilter"
        :picabase="databases[dbkey].picabase"
        :avram="avram"
        @update:ppn="updatePPN"
        @update:record="updateRecord" />
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
    </div>
    <h3>Ermittelte Anreicherung</h3>
    <p>Momentan werden nur 1-zu-1 Mappings zu Vokabularen mit denen noch nicht erschlossen wurde berücksichtigt.</p>
    <PicaEditor
      ref="enrichmentEditor"
      :header="false"
      :editable="false" />
  </section>
  <section v-if="!isEmpty(schemes)">
    <indexing-table
      :indexing="indexing"
      :schemes="schemes" />
  </section>
  <section v-if="!isEmpty(schemes)">
    <h3>Unterstützte Vokabulare</h3>
    <p>
      <em>Nicht aufgeführte Vokabulare, (Unter)Felder und invalide Notationen werden ignoriert!</em>
    </p>
    <table class="table">
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
              :api="avramApi" />
          </td>
          <td v-if="scheme.notationPattern">
            {{ scheme.notationPattern }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import PicaEditor from "pica-editor"
import ConceptLink from "./components/ConceptLink.vue"
import IndexingTable from "./components/IndexingTable.vue"
import PicaPath from "./components/PicaPath.vue"

import config from "./config.js"
import { picaSchemes, indexingFromPica, indexingToPica } from "../lib/pica-jskos.js"
import { mappingsByFromConcept, indexingConcepts, enrichIndexing } from "../lib/indexing.js"
import { isEmpty, fetchJSON } from "../lib/utils.js"
import { filterPicaFields, PicaPath as PPath } from "pica-data"

export default {
  components: { PicaEditor, PicaPath, ConceptLink, IndexingTable },
  provide() {
    return {
      cocoda: this.cocoda,
    }
  },
  data() {
    const { avramApi } = config
    return {
      ...config,
      avramApi,
      avram: undefined,
      ppn: "",
      loadSchemesPromise: null,
      schemes: {},
      fromScheme: [],
      toScheme: [],
      indexing: {},
      mappings: [],
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
        this.ppn = ppn
        this.dbkey = dbkey
        // Wait for schemes to be loaded, then load record
        this.loadSchemesPromise.then(() => this.loadRecord(ppn))
      }
    },
  },
  created() {
    this.loadSchemesPromise = this.loadSchemes()
  },    
  methods: {
    isEmpty,
    async loadSchemes() {
      const schemes = picaSchemes(await fetchJSON("schemes.json"))
      this.fromScheme = Object.values(schemes).map(s => s.uri)
      this.toScheme   = Object.values(schemes).map(s => s.uri)

      // TODO: in pica-data-js make "PicaPath.toString" a function
      this.indexingFields = [new PPath("003@"),...Object.values(schemes).map(s => s.PICAPATH)]

      const url = this.avramApi + "?profile=k10plus&fields=" + this.indexingFields.map(s=>s.toString).join("|")
      this.avram = await fetchJSON(url)

      this.schemes = schemes
      // Set up watchers after schemes are loaded
      // ? Can we move this to @change event of input elements? -> `fromScheme` is not current for that change 🤔
      this.$watch("fromScheme", () => this.getMappings())
      this.$watch("toScheme", () => this.getMappings())
    },
    loadRecord(ppn) {
      // Use $nextTick to give dbkey the chance to propagate to PicaEditor
      this.$nextTick(() => {
        this.$refs.recordEditor.loadRecord(ppn)
      })
    },
    updatePPN(ppn) { this.ppn = ppn },
    updateRecord(record) {
      this.indexing = indexingFromPica(record || [], this.schemes)
      console.log(this.indexing)
      this.getMappings()        
    },
    fieldFilter(record) {
      return filterPicaFields(record, this.indexingFields)
    },
    async getMappings() {
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

      // TODO: use cocoda-sdk
      // TODO: support querying by type and partOf

      const query = {
        fromScheme: fromScheme.join("|"),
        from:       Array.from(from).join("|"),
        toScheme:   toScheme.join("|"),
      }

      const mappings = await fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
      const mappingsFrom = mappingsByFromConcept(mappings)

      // add information for display
      Object.values(indexing).forEach(c => c.forEach(c => {
        c.mappings = mappingsFrom[c.uri] || []
        c.mappings.forEach(m => {
          m.toScheme = schemes[m.toScheme.uri] || m.toScheme
          m.to.memberSet.forEach(c => c.inScheme = [m.toScheme])
        })
      }))

      // calculate enrichment
      const { add } = enrichIndexing(indexing, mappingsFrom)
      // show enrichment
      this.$refs.enrichmentEditor.setRecord(indexingToPica(add, this.schemes))
    },
  },
}
</script>

<style>
#recordEditor div.CodeMirror {
  width: 100%;
}
</style>
