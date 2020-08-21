<template>
  <table>
    <thead>
      <tr>
        <th>
          Ermittelte Erschließung und Mappings
        </th>
      </tr>
    </thead>
    <tbody>
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
                  <mapping-table :mappings="concept.mappings" />
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
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
}
</script>
