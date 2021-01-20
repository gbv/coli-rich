<template>
  <a :href="`https://bartoc.org/vocabularies?uri=${scheme.uri}`">{{ scheme.notation[0] }}</a>
</template>

<script>
/**
 * Notation of a scheme, linked to BARTOC.
 */
export default {
  props: {
    scheme: {
      type: Object,
      required: true,
    },
  },
}
</script>
