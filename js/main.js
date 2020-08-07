import { serializePica, filterPicaFields } from './pica.js'
import config from './config.js'

const fetchPica = ppn => 
  fetch(`${config.unapi}?format=picajson&id=${config.dbkey}:ppn:${ppn}`)
  .then(response => response.json())

const pathes = Object.keys(config.schemes).map(s => config.schemes[s].PICAPATH).filter(Boolean)

var editor = document.getElementById('pica-editor')
editor = CodeMirror.fromTextArea(editor, { lineNumbers: true });
document.getElementById('loadViaPPN').addEventListener("click", () => {
  var ppn = document.getElementById("ppn").value
  fetchPica(ppn).then( pica => {
      pica = filterPicaFields(pica, ['003@|',...pathes].join("|"))
      pica = serializePica(pica)
      editor.setValue(pica)
  })
})

config.picaPathField = s => {
    s = s.split("$")[0]
    s = s.replace(/\[(.+)\]/,"/$1")
    return s
}

const App = {
  data() {
    return config
  }
}

Vue.createApp(App).mount("#app")
