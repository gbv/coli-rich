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
        <td>{{ scheme.notation[0] }}</td>
        <td>{{ scheme.prefLabel.de }}</td>
        <td><a :href="cocoda+'?fromScheme='+scheme.uri">↦ </a></td>
        <td><a :href="cocoda+'?toScheme='+scheme.uri">⇥</a></td>
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

export default {
  components: { PicaPath },
  inject: ["cocoda"],
  props: ["schemes","avram"]
} 
</script>
