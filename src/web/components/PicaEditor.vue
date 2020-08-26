<template>
  <form @submit.prevent="loadRecord">
    <textarea
      ref="editor"
      v-model="text" />
    <div class="helpline cm-s-default">
      <code
        v-if="field"
        class="cm-variable-2">{{ field }}</code>
      <span v-if="subfield">
        <code class="cm-comment">$</code>
        <code class="cm-keyword">{{ subfield }}</code>
      </span>
    </div>
    <div v-if="unapi && dbkey">
      <input
        v-model="ppn"
        type="text"
        placeholder="PPN">
      <button
        type="submit"
        :disabled="!ppn">
        laden
      </button>
      <a
        v-if="ppn && picabase"
        :href="picabase+'PPNSET?PPN='+ppn"
        target="opac">&nbsp;🡕 im Katalog</a>
    </div>
  </form>
</template>

<script>
import { serializePica, parsePica, getPPN, filterPicaFields } from "../../lib/pica.js"
import CodeMirror from "codemirror"
import "./codemirror-pica.js"

function getTextChildren(nodes) {
  return nodes.map(node => typeof node.children === "string" ? node.children : "").join("")
}

// CodeMirror instance for PICA Plain records
export default {
  props: {
    // unAPI base URL to load records from
    unapi: {
      type: String,
      default: null,
    },
    // database key to load records from via unAPI
    dbkey: {
      type: String,
      default: null,
    },
    // list of PICA Path expressions to filter loaded records
    fields: {
      type: Array,
      default: null,
    },
    // base URL of catalog to link into
    picabase: {
      type: String,
      default: null,
    },
    // whether PICA record can be edited
    editable: {
      type: Boolean,
      default: true,
    },
    // Avram Schema
    schema: {
      type: Object,
      default: null,
    },
  },
  emits: ["change"],
  data: function() {
    return {
      text: "",
      record: [],
      ppn: null,
      field: null,
      subfield: null,
    }
  },
  created() {
    const slot = this.$slots.default
    this.setText(slot ? getTextChildren(slot()) : "")
    this.$watch("record", record => {
      this.ppn = getPPN(record) || this.ppn
      this.$emit("change", { record, ppn: this.ppn })
    })
  },
  mounted: function() {
    const options = { readOnly: !this.editable }
    this.editor = CodeMirror.fromTextArea(this.$refs.editor, options)
    this.editor.on("change", editor => this.setText(editor.getValue()))
    this.editor.on("cursorActivity", () => {
      const pica = this.picaAtCursor() || {}
      this.field = pica.field
      this.subfield = pica.subfield
    })
  },
  methods: {
    picaAtCursor() {
      const { line, ch } = this.editor.getCursor()
      const tokens = this.editor.getLineTokens(line)
      //console.log(tokens)
      if (tokens.length && tokens[0].type === "variable-2") {
        var field = tokens[0].string
        var subfield
        for(const tok of tokens) {
          if (tok.type === "keyword") subfield = tok.string
          if (tok.end>ch) break
        }
        return { field, subfield }
      }
      return 
    },
    setText(text) {
      this.text = text
      this.record = parsePica(text)
    },
    setRecord(record) {
      this.record = record
      this.text = serializePica(record)
      if (this.editor) { // editor may not be mounted yet
        this.editor.setValue(this.text)
      }
    },
    loadRecord(ppn) {
      if (ppn) {
        this.ppn = ppn
      }
      if (!this.ppn || !this.dbkey) {
        this.setRecord([])
        return
      }
      fetch(`${this.unapi}?format=picajson&id=${this.dbkey}:ppn:${this.ppn}`)
        .then(response => response.ok ? response.json() : null)
        .then(record => {
          if (record) {
            this.setRecord(this.fields ? filterPicaFields(record, this.fields) : record)
          }
          // Push changed ppn and dbkey to router
          this.$router.push({
            query: {
              ppn: this.ppn,
              dbkey: this.dbkey,
            },
          })
        })
    },
  },
}
</script>

<style>
@import '../styles/codemirror.min.css';

.CodeMirror {
  border: 1px solid #ddd;
  height: auto;
}

.helpline {
  padding: 3px;
  height: 1.2em;
}
</style>
