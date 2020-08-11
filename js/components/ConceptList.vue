<template>
  <ul class="concept-list">
    <li v-for="c in concepts">
      <a v-if="cocoda && c.inScheme && c.inScheme.length && c.inScheme[0].uri"
         v-bind:href="cocoda+'?fromScheme='+c.inScheme[0].uri+'&from='+c.uri"
         target="cocoda"
         >{{c.notation[0]}}</a>
      <span v-else>{{c.notation[0]}}</span>
      <ul v-if="c.MAPPINGS && c.MAPPINGS.length">
        <li v-for="m in c.MAPPINGS">
          <a v-bind:href="m.uri">{{mappingTypeSymbol(m)}}</a>
          <concept-list :cocoda="cocoda" :concepts="m.to.memberSet" />
        </li>
      </ul>
    </li>
  </ul>
</template>

<script>
import mappingTypes from '../mapping-types.json'

export default {
  name: 'concept-list',
  props: {
    concepts: Array,
    cocoda: String
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
ul.concept-list {
  padding-left: 1em;
}
</style>
