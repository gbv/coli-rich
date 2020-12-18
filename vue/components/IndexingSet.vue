<template>
  <table class="table">
    <tbody>
      <tr 
        v-for="(set, uri) in indexing"
        :key="uri">
        <td>
          <scheme-link :scheme="getScheme(uri)" />
        </td>
        <td class="concepts">
          <ul class="concepts">
            <li
              v-for="concept in set"
              :key="concept.uri">
              <div
                :class="{ 
                  add: concept.PATCH === '+',
                  remove: concept.PATCH === '-',
                  keep: concept.PATCH === '=',
                }">
                <concept-link :concept="concept" />
                <mapping-table
                  v-if="concept.mappings"
                  :mappings="concept.mappings" />
              </div>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
// table of subject indexing data
import ConceptLink from "./ConceptLink.vue"
import MappingTable from "./MappingTable.vue"
import SchemeLink from "./SchemeLink.vue"

export default {
  components: { ConceptLink, MappingTable, SchemeLink },
  props: {
    indexing: { type: Object, default: ()=>({}) },
    schemes: { type: Object, default: ()=>({}) },
  },
  methods: {
    getScheme(uri) {
      return this.schemes.find(s => s.uri === uri)
    },
  },
}
</script>

<style>
td.concepts {
    padding: 0 !important;
}
ul.concepts {
  padding: 0;
  margin: 0;
  list-style-type: none;
}
ul.concepts li div {
  padding: 0.3em;
}
div.keep { background: #ddd; }
div.keep:before { content: "= "; }
div.add { background: #dfd; }
div.add:before { content: "+ "; }
div.remove { background: #fdd; }
div.remove:before { content: "- "; }
</style>
