<template>
  <a :href="`https://bartoc.org/vocabularies?uri=${scheme.uri}`">{{ scheme.notation[0] }}</a>
</template>

<script>
// Shows notation of a scheme, linked to BARTOC
export default {
  props: {
    scheme: {
      type: Array,
      required: true,
    },
  },
}
</script>
