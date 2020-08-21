<template>
  <table v-if="(mappings||[]).length">
    <tbody
      v-for="m in mappings"
      :key="m.uri">
      <tr>
        <td>
          <a :href="cocoda ? cocoda + '?mappingUri=' + m.uri : m.uri">{{ mappingTypeSymbol(m) }}</a>
        </td>
        <td>
          <ul v-if="m.to && m.to.memberSet.length">
            <li
              v-for="concept in m.to.memberSet"
              :key="concept.uri">
              <span
                v-if="m.toScheme && m.toScheme.notation"
                class="scheme">
                {{ m.toScheme.notation[0] }}
              </span>
              <concept-link :concept="concept" />
              <span
                v-if="(m.creator||[]).length"
                class="secondary">
                by <concept-link :concept="m.creator[0]" />
              </span>
              <span
                v-if="m.created"
                class="secondary">
                at {{ m.created }}
              </span>
            </li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import ConceptLink from "./ConceptLink.vue"
import jskos from "jskos-tools"
const { mappingTypes } = jskos

export default {
  components: { ConceptLink },
  inject: ["cocoda"],
  props: {
    mappings: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    mappingTypeSymbol(mapping) {
      const uri = mapping.type ? mapping.type[0] : "http://www.w3.org/2004/02/skos/core#mappingRelation"
      const type = mappingTypes.find(m => m.uri === uri)
      return type ? type.notation[0] : "?"
    },
  },
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
  padding-left: 0em;
}
ul.mapping-list {
  padding-left: 1em;
}
</style>
