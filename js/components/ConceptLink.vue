<template>
  <span v-if="(concept.notation||[]).length" class="notation">
    <a v-if="cocoda && concept.inScheme && concept.inScheme.length && concept.inScheme[0].uri"
       v-bind:href="cocoda+'?fromScheme='+concept.inScheme[0].uri+'&from='+concept.uri"
       target="cocoda"
       >{{concept.notation[0]}}</a>
    <span v-else>{{concept.notation[0]}}</span>
  </span>
  <span v-if="(concept.prefLabel||{}).de">{{concept.prefLabel.de}}</span>
</template>

<script>
// Show a concept with its notation and label
export default {
  inject: ['cocoda'],
  props: {
    concept: Object
  }
}
</script>

<style scoped>
.notation {
  font-weight: bold; 
}
</style>
