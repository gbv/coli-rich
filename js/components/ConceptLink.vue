<template>
  <span v-if="(concept.notation||[]).length" class="notation">
    <a v-if="cocoda && scheme"
       v-bind:href="cocoda+'?fromScheme='+scheme+'&from='+concept.uri"
       target="cocoda"
       >{{concept.notation[0]}}</a>
    <span v-else>{{concept.notation[0]}}</span>
  </span>
  <span v-if="label">{{label}}</span>
</template>

<script>
// Show a concept with its notation and label
export default {
  inject: ['cocoda'],
  props: {
    concept: Object
  },
  computed: {
    scheme() {
      return ((this.concept.inScheme||[])[0]||{}).uri
    },
    label() {
      const label = this.concept.prefLabel || {}
      if ("de" in label) return label.de
      for (var lang in label) return label[lang]
      return ''
    }
  }
}
</script>

<style scoped>
.notation {
  font-weight: bold; 
}
</style>
