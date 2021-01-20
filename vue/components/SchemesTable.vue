<template>
  <table
    v-if="schemes"
    class="table">
    <thead>
      <tr>
        <th />
        <th>Name</th>
        <th colspan="2">
          Mappings
        </th>
        <th>Felder</th>
        <th>Valide Notationen</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="scheme in schemes"
        :key="scheme.uri">
        <td>
          <scheme-link :scheme="scheme" />
        </td>
        <td>{{ scheme.prefLabel.de }}</td>
        <td v-if="cocoda.value">
          <a :href="`${cocoda.value}?fromScheme=${scheme.uri}`">↦ </a>
        </td>
        <td v-if="cocoda.value">
          <a :href="`${cocoda.value}?toScheme=${scheme.uri}`">⇥</a>
        </td>
        <td
          v-else
          colspan="2" />
        <td>
          <PicaPath
            :path="scheme.PICAPATH"
            :avram="avram" />
        </td>
        <td v-if="scheme.notationPattern">
          {{ scheme.notationPattern }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import PicaPath from "./PicaPath.vue"
import SchemeLink from "./SchemeLink.vue"

export default {
  components: { PicaPath, SchemeLink },
  inject: ["cocoda"],
  props: {
    schemes: {
      type: Array,
      required: true,
    },
    avram: {
      type: Object,
      default: null,
    },
  },
}
</script>
