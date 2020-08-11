<template>
  <section>
    <p>
      Aus im Rahmen von <a href="https://coli-conc.gbv.de/">coli-conc</a> gesammelten
      Konkordanzen lässt sich die inhaltliche Erschließung von PICA-Datensätzen
      anreichern. Mappings werden von <a v-bind:href="mappingApi">der Mappings-API</a>
      abgerufen.
    </p>
      <table> 
        <thead>
          <tr>
            <th>
              Datensatz (in PICA+)
            </th>
            <th>
              Erschließung
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <PicaEditor :unapi="unapi" :dbkey="dbkey" :fields="fieldFilter"
                           @change="recordChanged"
              >{{recordText}}</PicaEditor>
            </td>
            <td>
              <a v-if="ppn" v-bind:href="opac+'PPNSET?PPN='+ppn" target="opac">🡕 Katalog</a>
              <ul v-if="bundles">
                  <li v-for="(set, uri) in bundles">
                     {{schemes[uri].notation[0]}}: 
                     <concept-list :concepts="set" :cocoda="cocoda"></concept-list>
                  </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
  </section>
  <section>
    <p>Mappings zwischen folgende Vokabulare werden unterstützt:</p>
    <table>
      <thead>
        <tr>
          <th>↦ </th>
          <th>⇥</th>
          <th></th>
          <th>Name</th>
          <th colspan="2">Cocoda</th>
          <th>Felder</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="scheme in schemes">
          <td><input type="radio" v-model="fromScheme" v-bind:value="scheme.uri"></td>
          <td><input type="radio" v-model="toScheme" v-bind:value="scheme.uri"></td>
          <td>{{ scheme.notation[0] }}</td>
          <td>{{ scheme.prefLabel.de }}</td>
          <td><a v-bind:href="cocoda+'?fromScheme='+scheme.uri">↦ </a></td>
          <td><a v-bind:href="cocoda+'?toScheme='+scheme.uri">⇥</a></td>
          <td>
              <a v-if="scheme.PICAFIELD"
                 v-bind:href="avram+'?field='+picaPathField(scheme.PICAPATH)">{{scheme.PICAPATH}}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import PicaEditor from './PicaEditor.vue'
import ConceptList from './ConceptList.vue'

import { ConceptScheme } from '../concept-scheme.js' 
import { PicaPath } from '../pica.js'
import config from '../config.js'

const fieldFilter = [
    '003@',
    ...Object.values(config.schemes).map(s => s.PICAPATH).filter(Boolean)
]

export default {
  data() {
    const schemes = {}       
    config.schemes.forEach(kos => {
      if (kos.PICAPATH) {
        kos.PICAFIELD = kos.PICAPATH.split("$")[0].replace(/\[(.+)\]/,"/$1")
      }
      schemes[kos.uri] = new ConceptScheme(kos)
    })
    return {
      ...config,
      schemes,
      recordText: '003@ $0161165839X', // inital example record
      ppn: '',
      fieldFilter,
      fromScheme: null,
      toScheme: null,
      bundles: {},
      mappings: []
    }
  },
  components: { PicaEditor, ConceptList },

  created() {
    this.$watch('bundles', () => this.getMappings())
    this.$watch('fromScheme', () => this.getMappings())
    this.$watch('toScheme', () => this.getMappings())
  },
  methods: {
    recordChanged(ev) {
      this.ppn = ev.ppn

      var bundles = {}
      for (const kos of Object.values(this.schemes)) {         
          if (kos.PICAPATH) {
              const path = new PicaPath(kos.PICAPATH)
              const values = path.getUniqueValues(ev.record)
              if (values.length) {
                  bundles[kos.uri] = values.map(n => kos.conceptFromNotation(n, { inScheme: true }))
              }
          }
      }
      this.bundles = bundles
    },
    getMappings() {
      Object.values(this.bundles).forEach(concepts => concepts.forEach(c => c.MAPPINGS = []))

      const { fromScheme, toScheme } = this

      var fromList = this.bundles[fromScheme]
      if (!fromList || !toScheme) return

      fromList.forEach(concept => {
          const from = concept.uri
          const query = { fromScheme, toScheme, from }

          this.fetchMappings(query).then(mappings => {
              concept.MAPPINGS = mappings
          })
       })

    },
    fetchMappings(query) {
      return fetch(`${this.mappingApi}?` + new URLSearchParams(query))
        .then(response => response.ok ? response.json() : null)
    }
  }
}
</script>

<style scoped>
ul {
  padding-left: 0;
  list-style-type: none;
  padding-bottom: 0.3em;
}
</style>
