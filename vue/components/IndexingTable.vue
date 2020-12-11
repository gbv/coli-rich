<template>
  <table class="table">
    <tr 
      v-for="(set, uri) in indexing"
      :key="uri">
      <td>{{ getScheme(uri).notation[0] }}</td> <!-- TODO show full name -->
      <td>
        <ul>
          <li
            v-for="concept in set"
            :key="concept.uri">
            <concept-link :concept="concept" />
          </li>
        </ul>
      </td>
    </tr>
  </table>
</template>

<script>
import ConceptLink from "./ConceptLink.vue"
import MappingTable from "./MappingTable.vue"

export default {
  components: { ConceptLink, MappingTable },
  props: {
    indexing: { type: Object, default: ()=>({}) },
    schemes: { type: Object, default: ()=>({}) },
  },
  methods: {
    getScheme(uri) {
        return this.schemes.find(s => s.uri === uri)
    }
  }
}
</script>
