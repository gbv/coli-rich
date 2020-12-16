<template>
  <a :href="`https://bartoc.org/vocabularies?uri=${scheme.uri}`">{{ scheme.notation[0] }}</a>
</template>

<script>
// Shows notation of a scheme, linked to BARTOC
import PicaPath from "./PicaPath.vue"
import SchemeLink from "./SchemeLink.vue"

export default {
  components: { SchemeLink },
  props: ["scheme"]
} 
</script>
