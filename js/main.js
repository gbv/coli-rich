import { serializePica, filterPicaFields, PicaPath } from './pica.js'
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
    this.editor = CodeMirror.fromTextArea(
      document.getElementById('pica-editor'), { viewportMargin: Infinity })    
  },
  methods: {
    loadRecord() {
      this.editor.setValue(this.record = "")
      const indexing = document.getElementById('indexing')
      indexing.innerHTML = ""
      fetchPica(this.ppn).then(pica => {
        var expr = ['003@',...pathes]

        pica.push(["045G",null,'a','300'])

        pica = filterPicaFields(pica, expr)
        this.record = serializePica(pica)
        this.editor.setValue(this.record)
        
        for (const kos of config.schemes) {
            const path = new PicaPath(kos.PICAPATH)
            const values = path.getUniqueValues(pica)
            if (values.length) {
                indexing.innerHTML += kos.notation[0]+": "+values+"<br>"
            }
        }
      })
    }
  }
}

Vue.createApp(App).mount("#app")
