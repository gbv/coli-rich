/* eslint-disable vue/valid-template-root */
<template>
  <section>
    <p>
      Aus im Rahmen von <a href="https://coli-conc.gbv.de/">coli-conc</a> gesammelten
      Konkordanzen lässt sich die inhaltliche Erschließung von PICA-Datensätzen
      anreichern. An dieser Stelle kann die automatische Anreicherung ausprobiert werden.
    </p>
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
                <concept-link :concept="db" />
                <a
                  v-if="db.picabase"
                  :href="db.picabase">&nbsp;🡕 Katalog</a>
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top;">
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
    <p>
      <em>
        Momentan werden alle vorhandenen 1-zu-1 Mappings berücksichtigt!
        Für Vokabulare mit denen schon Erschließung vorhanden ist, wird
        keine weitere Anreicherung ermittelt.
      </em>
    </p>
    <table>
      <thead v-if="!isEmpty(indexing)">
        <tr>
          <th>
            Ermittelte Erschließung und Mappings
          </th>
        </tr>
      </thead>
      <tbody v-if="!isEmpty(indexing)">
        <tr>
          <td>
            <table>
              <tbody
                v-for="(set, uri) in indexing"
                :key="uri">
                <tr
                  v-for="concept in set"
                  :key="concept.uri">
                  <td>{{ schemes[uri].notation[0] }}</td>
                  <td><concept-link :concept="concept" /></td>
                  <td v-if="(concept.mappings||[]).length">
                    <mapping-list :mappings="concept.mappings" />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <p>
    Mappings werden von <a :href="mappingApi">der Mappings-API</a>
    abgerufen.
  </p>
</template>

<script>
import PicaEditor from "./components/PicaEditor.vue"
import MappingList from "./components/MappingList.vue"
import ConceptLink from "./components/ConceptLink.vue"
import PicaPath from "./components/PicaPath.vue"

import { picaSchemes } from "./pica-jskos.js"
import config from "./config.js"
import { enrichIndexing, indexingToPica } from "./enrich-indexing.js"

import { isEmpty, fetchJSON } from "./utils.js"

function completeMapping(m) {
  if (!m.type) m.type = ["http://www.w3.org/2004/02/skos/core#mappingRelation"]
  if (!m.from) m.from = {}
  if (!m.to) m.to = {}
  ;(m.to.memberSet||[]).forEach(c => c.inScheme = [m.toScheme])
}

export default {
  components: { PicaEditor, PicaPath, ConceptLink, MappingList },
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
        this.loadRecord(ppn)
      }
    },
  },
  created() {
    this.$watch("indexing", () => this.getMappings())
    this.$watch("fromScheme", () => this.getMappings())
    this.$watch("toScheme", () => this.getMappings())
    this.$watch("schemes", () => this.updateIndexing())
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
      const indexing = {}
      for (const kos of Object.values(this.schemes)) {
        var conceptSet = []
        const path = kos.PICAPATH
        const values = path.getUniqueValues(this.record)
        if (values.length) {
          conceptSet = values.map(n => kos.conceptFromNotation(n, { inScheme: true })).filter(Boolean)
          indexing[kos.uri] = conceptSet
        }
      }
      this.indexing = indexing
    },
    getMappings() {
      const { toScheme, indexing } = this

      const fromScheme = []
      const from = {}
      this.fromScheme.forEach(scheme => {
        if (!isEmpty(indexing[scheme])) {
          fromScheme.push(scheme)
          indexing[scheme].forEach(c => from[c.uri] = c)
        }
      })
      if (isEmpty(from)) return

      Object.values(from).forEach(c => c.mappings = [])

      // TODO: support querying by type and partOf

      const query = {
        fromScheme: fromScheme.join("|"),
        from:       Object.keys(from).join("|"),
        toScheme:   toScheme.join("|"),
      }

      const { enrichmentEditor } = this.$refs

      return this.fetchMappings(query).then(mappings => {
        mappings.forEach(m => {
          const s = this.schemes[m.toScheme.uri]
          if (s) m.toScheme.notation = s.notation

          completeMapping(m);

          (m.from.memberSet||[]).forEach(c => from[c.uri].mappings.push(m))
        })
        var add = enrichIndexing(indexing)
        add = indexingToPica(add, this.schemes)

        enrichmentEditor.setRecord(add)
      })
    },
    fetchMappings(query) {
      return fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
    },
  },
}
</script>

<style>
@import '../css/main.css';

ul {
  padding-left: 0;
  list-style-type: none;
  padding-bottom: 0.3em;
}
</style>
