<template>
  <span v-if="path">
    <span v-if="definition && definition.pica3">{{ definition.pica3 }}=</span>
    <a
      v-if="definition"
      :href="definition.url"
      :title="definition.label">
      {{ path.toString }}
    </a>
    <a
      v-else-if="api"
      :href="api+'?field='+path.fieldIdentifier">{{ path.toString }}</a>
    <span v-else>{{ path.toString }}</span>
  </span>
</template>

<script>
import { PicaPath } from "pica-data"
import { fetchJSON } from "../../lib/utils.js"

export default {
  props: {
    path: {
      type: PicaPath,
      default: null,
    },
    api: {
      type: String,
      default: null,
    },
  },
  data() {
    return { definition: null }
  },
  created() {
    if (this.api && this.path) {
      const id = this.path.fieldIdentifier
      fetchJSON(this.api + "?field=" + id).then(avram => {
        this.definition = (avram.fields || {})[id] })
    }
  },
}
</script>
