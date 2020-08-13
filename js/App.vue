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
          <td><input type="checkbox" v-model="fromScheme" v-bind:value="scheme.uri"></td>
          <td><input type="checkbox" v-model="toScheme" v-bind:value="scheme.uri"></td>
          <td>{{ scheme.notation[0] }}</td>
          <td>{{ scheme.prefLabel.de }}</td>
          <td><a v-bind:href="cocoda+'?fromScheme='+scheme.uri">↦ </a></td>
          <td><a v-bind:href="cocoda+'?toScheme='+scheme.uri">⇥</a></td>
          <td>
              <a v-if="scheme.PICAFIELD"
                 v-bind:href="avram+'?field='+scheme.PICAFIELD">{{scheme.PICAPATH.toString}}</a>
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
              <table v-if="indexing">
                <tbody v-for="(set, uri) in indexing">
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
import { enrichIndexing, indexingToPica } from './enrich-indexing.js'

import { isEmpty } from './utils.js'

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
    const fromScheme = []
    const toScheme = []
    config.schemes.forEach(kos => {
      if (kos.PICAPATH) {
        kos.PICAPATH = new PicaPath(kos.PICAPATH)
        kos.PICAFIELD = kos.PICAPATH.tagString.replace(/\[(.+)\]/,"/$1")
        fromScheme.push(kos.uri)
        toScheme.push(kos.uri)
      }
      schemes[kos.uri] = new ConceptScheme(kos)
    })
    return {
      ...config,
      schemes,
      recordText: '003@ $0161165839X', // inital example record
      ppn: '',
      fieldFilter,
      fromScheme,
      toScheme,
      indexing: {},
      mappings: [],
      enriched: ""
    }
  },
  created() {
    this.$watch('indexing', () => this.getMappings())
    this.$watch('fromScheme', () => this.getMappings())
    this.$watch('toScheme', () => this.getMappings())
  },
  methods: {
    recordChanged(ev) {    
      const record = ev.record || []
      this.ppn = ev.ppn

      const indexing = {}
      for (const kos of Object.values(this.schemes)) {
          var conceptSet = []
          if (kos.PICAPATH) {
              const path = kos.PICAPATH
              const values = path.getUniqueValues(record)
              if (values.length) {
                  conceptSet = values.map(n => kos.conceptFromNotation(n, { inScheme: true })).filter(Boolean)
                indexing[kos.uri] = conceptSet
              }
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

      // TODO: support type and partOf
      const query = {
          fromScheme: fromScheme.join('|'),
          from:       Object.keys(from).join('|'),
          toScheme:   toScheme.join('|'),
      }

      return this.fetchMappings(query).then(mappings => {
        // add 'inScheme'
        mappings.forEach(m => {
          m.from.memberSet.forEach(c => {
              if (!from[c.uri]) { 
                  console.log(c.uri)
                } else {
            from[c.uri].mappings.push(m)
                }
          })          
          if (m.to && m.to.memberSet) { 
              m.to.memberSet.forEach(c => c.inScheme = [m.toScheme])
          }
        })

        const add = enrichIndexing(indexing)
        const pica = serializePica(indexingToPica(add, this.schemes))
        this.enriched = pica
        console.log(pica)
      })
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
