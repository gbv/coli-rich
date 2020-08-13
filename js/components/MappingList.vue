<template>
  <table v-if="(mappings||[]).length">
    <tbody v-for="m in mappings">
      <tr>
        <td>
          <a v-bind:href="m.uri">{{mappingTypeSymbol(m)}}</a>
        </td>
        <td>
          <ul v-if="m.to && m.to.memberSet.length">
            <li v-for="concept in m.to.memberSet">
              <span v-if="(concept.inScheme||[]).length && concept.inScheme[0].notation">
                {{concept.inScheme[0].notation[0]}}
                &nbsp;
              </span>
              <concept-link :concept="concept"/>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import mappingTypes from '../mapping-types.json'
import ConceptLink from './ConceptLink.vue'

export default {
  components: { ConceptLink },
  props: {
    mappings: Array,
  },
  methods: {
    mappingTypeSymbol(mapping) {
      const type = mappingTypes.find(m => m.uri === mapping.type[0])
      return type ? type.notation[0] : '?'
    }
  }
}
</script>

<style scoped>
ul {
  list-style-type: none;
}
ul.mapping-list {
  padding-left: 1em;
}
</style>
