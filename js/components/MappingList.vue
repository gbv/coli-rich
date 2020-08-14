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
              <span v-if="m.toScheme && m.toScheme.notation" class="scheme">
                {{m.toScheme.notation[0]}}
              </span>
              <concept-link :concept="concept"/>
              <span v-if="(m.creator||[]).length" class="secondary">
                 by <concept-link :concept="m.creator[0]"/>
              </span>
              <span v-if="m.created" class="secondary">
                at {{m.created}}
              </span>
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
.secondary {
  font-size: smaller;
}
.scheme {
  padding-right: 0.5em;
}
ul {
  list-style-type: none;
}
ul.mapping-list {
  padding-left: 1em;
}
</style>
