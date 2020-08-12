<template>
  <section>
    <p>
      Aus im Rahmen von <a href="https://coli-conc.gbv.de/">coli-conc</a> gesammelten
      Konkordanzen lässt sich die inhaltliche Erschließung von PICA-Datensätzen
      anreichern. Mappings werden von <a v-bind:href="mappingApi">der Mappings-API</a>
      abgerufen.
      Unterstütze Vokabulare:
    </p>
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
                 v-bind:href="avram+'?field='+scheme.PICAFIELD">{{scheme.PICAPATH}}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <section>
      <table> 
        <thead>
          <tr>
            <th>
              Datensatz (in PICA+)
            </th>
            <th>
              Erschließung
              <a v-if="ppn" v-bind:href="opac+'PPNSET?PPN='+ppn" target="opac">🡕 Katalog</a>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="vertical-align: top;">
              <PicaEditor :unapi="unapi" :dbkey="dbkey" :fields="fieldFilter"
                           @change="recordChanged"
              >{{recordText}}</PicaEditor>
              <div v-if="enriched" style="padding-top: 0.5em;">
                Anreicherung:
                <PicaEditor>{{enriched}}</PicaEditor>
              </div>
            </td>
            <td>
              <table v-if="bundles">
                <tbody v-for="(set, uri) in bundles">
                  <tr v-for="concept in set">
                    <td>{{schemes[uri].notation[0]}}</td>
                    <td><concept-link :concept="concept"/></td>
                    <td v-if="(concept.mappings||[]).length">
                      <mapping-list :mappings="concept.mappings"/>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
  </section>

</template>

<script>
import PicaEditor from './components/PicaEditor.vue'
import MappingList from './components/MappingList.vue'
import ConceptLink from './components/ConceptLink.vue'

import { ConceptScheme } from './concept-scheme.js' 
import { PicaPath, serializePica } from './pica.js'
import config from './config.js'

const fieldFilter = [
    '003@',
    ...Object.values(config.schemes).map(s => s.PICAPATH).filter(Boolean)
]

export default {
  components: { PicaEditor, ConceptLink, MappingList },
  provide() {
    return {
      cocoda: this.cocoda
    }
  },
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
      mappings: [],
      enriched: ""
    }
  },
  created() {
    this.$watch('bundles', () => this.getMappings())
    this.$watch('fromScheme', () => this.getMappings())
    this.$watch('toScheme', () => this.getMappings())
  },
  methods: {
    recordChanged(ev) {    
      const record = ev.record || []
      this.ppn = ev.ppn

      const bundles = {}
      for (const kos of Object.values(this.schemes)) {
          var conceptSet = []
          if (kos.PICAPATH) {
              const path = new PicaPath(kos.PICAPATH)
              const values = path.getUniqueValues(record)
              if (values.length) {
                  conceptSet = values.map(n => kos.conceptFromNotation(n, { inScheme: true })).filter(Boolean)
                bundles[kos.uri] = conceptSet
              }
          }
//          this.bundles[kos.uri] = conceptSet
      }        
      this.bundles = bundles
    },
    getMappings() {
      Object.values(this.bundles).forEach(concepts => concepts.forEach(c => c.mappings = []))

      const { fromScheme, toScheme } = this

      var fromList = this.bundles[fromScheme]
      if (!fromList || !toScheme) return

      Promise.all( fromList.map(concept => {
          const from = concept.uri
          const query = { fromScheme, toScheme, from }

          return this.fetchMappings(query).then(mappings => {
              return concept.mappings = mappings              
          })
      }) ).then(mappings => {
          this.enrich(mappings)
      })
    },
    enrich(mappings) {
      // trivial strategy: just take the first mapping of each source concept
      mappings = [...mappings.map(m => m[0])]

      var add = []
      var pathes = {}

      mappings.filter(Boolean).forEach(m => {
          const toScheme = this.schemes[m.toScheme.uri]          

          // skip if KOS is already used
          if ((this.bundles[toScheme.uri] || []).length) {
            return
          }

          // TODO: take into account mapping type

          // only respect 1-to-1-mappings
          if (m.to.memberSet.length !== 1) return

          const notation = m.to.memberSet[0].notation[0]
          const source = m.uri

          var path = pathes[toScheme.uri] || (pathes[toScheme.uri]=new PicaPath(toScheme.PICAPATH))

          var occ = "" // TODO: occurrence from path (count in ranges)
          var pica = [path.tagString, occ]
          pica.push(path.subfieldString, notation, 'A', source)
          add.push(pica)
      })
      
      this.enriched = serializePica(add)
    },
    fetchMappings(query) {
      return fetch(`${this.mappingApi}?` + new URLSearchParams(query))
        .then(response => response.ok ? response.json() : null)
    }
  }
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
