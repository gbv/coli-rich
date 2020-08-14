<template>
  <form v-on:submit.prevent="loadRecord">
    <textarea ref="editor" v-model="text"></textarea>
    <div v-if="unapi && dbkey">
      <input type="text" v-model="ppn" placeholder="PPN" />
      <button type="submit" :disabled="!ppn">laden</button>
      <a v-if="ppn && picabase" 
         v-bind:href="picabase+'PPNSET?PPN='+ppn" target="opac">&nbsp;🡕 im Katalog</a>
    </div>
  </form>
</template>

<script>
import { serializePica, parsePica, PicaPath, getPPN, filterPicaFields } from '../pica.js'
import CodeMirror from 'codemirror'
import CodeMirrorMarc from '../codemirror-marc.js'

function getTextChildren(nodes) {
    return nodes.map(node => typeof node.children === 'string' ? node.children : '').join('')
}

// CodeMirror instance for PICA Plain records
export default {
  props: [
      // unAPI base URL to load records from
      "unapi", 
      // database key to load records from via unAPI
      "dbkey",
      // list of PICA Path expressions to filter loaded records
      "fields",
      // base URL of catalog to link into
      "picabase"
  ],
  data: function() {
    return {
      text: '',
      record: [],
      ppn: null,
    }
  },
  created() {
    this.$watch('record', record => { 
      this.ppn = getPPN(record) || this.ppn
      this.$emit("change", { record, ppn: this.ppn })
    })
    // FIXME: change in slot is not detected!
    this.setText(getTextChildren(this.$slots.default()))
  },
  mounted: function() {
    this.editor = CodeMirror.fromTextArea(this.$refs.editor, {})
    this.editor.on('change', editor => this.setText(editor.getValue()))
  },
  methods: {
    setText(text) {
      this.text = text
      this.record = parsePica(text)
    },
    setRecord(record) {
      this.record = record
      this.text = serializePica(record)
      this.editor.setValue(this.text)
    },
    setPPN(ppn) {
      this.ppn = ppn
    },
    loadRecord() {
      fetch(`${this.unapi}?format=picajson&id=${this.dbkey}:ppn:${this.ppn}`)        
      .then(response => response.ok ? response.json() : null)
      .then(record => {
         if (record) {
           this.setRecord(this.fields ? filterPicaFields(record, this.fields) : record)
         }
      })
    }
  }
}
</script>

<style>
@import '../../css/codemirror.min.css';

.CodeMirror {
  border: 1px solid #ddd;
  height: auto;
}
</style>
