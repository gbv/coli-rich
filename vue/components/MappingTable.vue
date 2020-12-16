<template>
  <table class="mapping-table">
    <tbody
      v-for="m in mappings"
      :key="m.uri">
      <tr>
        <td>
          <scheme-link :scheme="m.fromScheme" style="padding-right: 0.5em" />            
          <concept-link :concept="m.from.memberSet[0]" />
        </td>
        <td>
          <a :href="cocoda ? cocoda + '?mappingUri=' + m.uri : m.uri">{{ mappingTypeSymbol(m) }}</a>
        </td>
        <td>
          <span v-if="(m.creator||[]).length">
            <concept-link :concept="m.creator[0]" />
          </span>
          <span v-if="m.created">
            at {{ m.created }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import ConceptLink from "./ConceptLink.vue"
import SchemeLink from "./SchemeLink.vue"
import { mappingTypes } from "jskos-tools"

export default {
  components: { ConceptLink, SchemeLink },
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

<style>
.mapping-table {
  font-size: smaller;
}
</style>
