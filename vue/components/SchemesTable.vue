<template>
  <table class="table" v-if="schemes">
    <thead>
      <tr>
        <th />
        <th>Name</th>
        <th colspan="2">
          Cocoda
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
          <scheme-link :scheme="scheme"></scheme-link>
        </td>
        <td>{{ scheme.prefLabel.de }}</td>
        <td><a :href="`${cocoda}?fromScheme=${scheme.uri}`">↦ </a></td>
        <td><a :href="`${cocoda}?toScheme=${scheme.uri}`">⇥</a></td>
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
  props: ["schemes","avram"]
} 
</script>
