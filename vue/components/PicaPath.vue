<template>
  <span v-if="path">
    <span v-if="schedule && schedule.pica3">{{ schedule.pica3 }}=</span>
    <a
      v-if="schedule"
      :href="schedule.url"
      :title="schedule.label">
      {{ pathString }}
    </a>
    <span v-else>{{ pathString }}</span>
  </span>
</template>

<script>
import { PicaPath, picaFieldSchedule } from "pica-data"

export default {
  props: {
    path: {
      type: PicaPath,
      default: null,
    },
    avram: {
      type: Object,
      default: null,
    },
  },
  computed: {
    pathString() {
      return this.path ? this.path.toString() : ""
    },
    schedule() {
      const { path } = this
      if (path) {
        return picaFieldSchedule(this.avram, [path.tagString(), path.startOccurrence()])
      } else {
        return null
      }
    },
  },
}
</script>
