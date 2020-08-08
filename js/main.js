import { serializePica, filterPicaFields } from './pica.js'
import config from './config.js'

const fetchPica = ppn => 
  fetch(`${config.unapi}?format=picajson&id=${config.dbkey}:ppn:${ppn}`)
  .then(response => response.json())

const pathes = Object.keys(config.schemes).map(s => config.schemes[s].PICAPATH).filter(Boolean)

config.picaPathField = s => {
    s = s.split("$")[0]
    s = s.replace(/\[(.+)\]/,"/$1")
    return s
}

const App = {
  data() {    
    return {
      ...config,
      ppn: "161165839X",
      record: ""
    }
  },
  mounted: function () {
    var editor = document.getElementById('pica-editor')
    this.editor = CodeMirror.fromTextArea(editor, { lineNumbers: true });
  },
  methods: {
    loadRecord() {
      fetchPica(this.ppn).then(pica => {
        var expr = ['003@|',...pathes]
        this.record = serializePica(filterPicaFields(pica, expr.join("|")))
        this.editor.setValue(this.record)
      }).catch(e => {
        this.editor.setValue(this.record = "")
      })
    }
  }
}

Vue.createApp(App).mount("#app")
