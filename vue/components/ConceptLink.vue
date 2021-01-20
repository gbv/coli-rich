<template>
  <span
    v-if="concept && (concept.notation||[]).length"
    class="notation">
    <a
      v-if="cocoda.value && scheme"
      :href="`${cocoda.value}?fromScheme=${scheme}&from=${concept.uri}`"
      target="cocoda">{{ concept.notation[0] }}</a>
    <span v-else>{{ concept.notation[0] }}</span>
  </span>
  <span v-if="label">{{ label }}</span>
</template>

<script>
/**
 * Concept with its notation (linked to Cocoda) and label (preferrably German).
 */
export default {
  inject: ["cocoda"],
  props: {
    concept: {
      type: Object,
      default: () => null,
    },
  },
  computed: {
    scheme() {
      return ((this.concept.inScheme||[])[0]||{}).uri
    },
    label() {
      const label = this.concept.prefLabel || {}
      if ("de" in label) return label.de
      for (var lang in label) return label[lang]
      return ""
    },
  },
}
</script>

<style scoped>
.notation {
  font-weight: bold;
  padding-right: 0.5em;
}
</style>
