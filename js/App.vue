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
          <th></th>
          <th>Name</th>
          <th colspan="2">Cocoda</th>
          <th>Felder</th>
          <th>Valide Notationen</th>
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
          <td v-if="scheme.notationPattern">{{scheme.notationPattern}}</td>
        </tr>
      </tbody>
    </table>
    <p>
      <em>Nicht aufgeführte Vokabulare, (Unter)Felder und invalide Notationen werden ignoriert!</em>
    </p>
  </section>
  <section>
   <table> 
     <thead>
       <tr><th>Datensatz</th></tr>
     </thead>
     <tbody>
       <tr>
         <td>
           <ul class="inline">
             <li v-for="(db, key) in databases">
               <input type="radio" v-bind:value="key" v-model="dbkey" style="margin-right:0.5em;"/>   
               <concept-link :concept="db"/>
               <a v-bind:href="db.picabase" v-if="db.picabase">&nbsp;🡕 Katalog</a>
             </li>
           </ul>
         </td>
       </tr>
       <tr>
         <td style="vertical-align: top;">
           <PicaEditor :unapi="unapi" :dbkey="dbkey" 
                       :fields="fieldFilter" :picabase="databases[dbkey].picabase"
                        @change="recordChanged" ref="recordEditor"
           >{{recordText}}</PicaEditor>
           <div v-if="examples && examples.length" style="font-size: smaller; padding-top: 0.2em;">
             Beispiele:
             <ul class="inline">
               <li v-for="ex in examples">
                 <a @click="loadRecord(ex)">{{ex}}</a>
               </li>
             </ul>
           </div>
          </td>
       </tr>
     </tbody>
     <thead v-if="enriched">
       <tr><th>Ermittelte Anreicherung</th></tr>
     </thead>
     <tbody v-if="enriched">
       <tr>
         <td>
           <PicaEditor>{{enriched}}</PicaEditor>
         </td>
        </tr>
      </tbody>
    </table>         
  </section>
  <section>
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
    <p>
      Mappings werden von <a v-bind:href="mappingApi">der Mappings-API</a>
      abgerufen.
    </p>

</template>

<script>
import PicaEditor from './components/PicaEditor.vue'
import MappingList from './components/MappingList.vue'
import ConceptLink from './components/ConceptLink.vue'

import { ConceptScheme } from './concept-scheme.js' 
import { PicaPath, serializePica } from './pica.js'
import config from './config.js'
import { enrichIndexing, indexingToPica } from './enrich-indexing.js'

import { isEmpty, fetchJSON } from './utils.js'

function completeMapping(m) {
  if (!m.type) m.type = ["http://www.w3.org/2004/02/skos/core#mappingRelation"]
  if (!m.from) m.from = {}
  if (!m.to) m.to = {}
  (m.to.memberSet||[]).forEach(c => c.inScheme = [m.toScheme])
}

export default {
  components: { PicaEditor, ConceptLink, MappingList },
  provide() {
    return {
      cocoda: this.cocoda
    }
  },
  data() {
    return {
      ...config,
      recordText: '003@ $0161165839X', // inital example record
      ppn: '',
      schemes: {},
      fromScheme: [],
      toScheme: [],
      schemes: {},
      indexing: {},
      mappings: [],
      record: [],
      enriched: "",
      fieldFilter: ['....'],
    }
  },
  created() {
    this.$watch('indexing', () => this.getMappings())
    this.$watch('fromScheme', () => this.getMappings())
    this.$watch('toScheme', () => this.getMappings())
    this.$watch('schemes', () => this.updateIndexing())
    this.loadSchemes()
  },
  methods: {
    isEmpty,
    loadSchemes() {
      const schemes = {}
      fetchJSON("schemes.json").then(array => {
        (array||[]).filter(s => s.PICAPATH && s.notation).forEach(scheme => {
          const { uri } = scheme
          scheme.PICAPATH = new PicaPath(scheme.PICAPATH)
          scheme.PICAFIELD = scheme.PICAPATH.tagString.replace(/\[(.+)\]/,"/$1")
          schemes[uri] = new ConceptScheme(scheme)
        })
        this.fromScheme = Object.values(schemes).map(s => s.uri)
        this.toScheme   = Object.values(schemes).map(s => s.uri)
        this.fieldFilter = ['003@',...Object.values(schemes).map(s => s.PICAPATH)]
        this.schemes = schemes
      })
    },
    loadRecord(ppn) {
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
          fromScheme: fromScheme.join('|'),
          from:       Object.keys(from).join('|'),
          toScheme:   toScheme.join('|'),
      }

      return this.fetchMappings(query).then(mappings => {
        mappings.forEach(m => {
          const s = this.schemes[m.toScheme.uri]
          if (s) m.toScheme.notation = s.notation

          completeMapping(m);

          (m.from.memberSet||[]).forEach(c => from[c.uri].mappings.push(m))
        })
        var add = enrichIndexing(indexing)
        add = indexingToPica(add, this.schemes)
        const pica = serializePica(add)
        this.enriched = pica
      })
    },
    fetchMappings(query) {
      return fetchJSON(`${this.mappingApi}?` + new URLSearchParams(query))
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
