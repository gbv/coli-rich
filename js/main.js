import { createApp } from 'vue'

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


//const HelloWorld = httpVueLoader('./js/components/HelloWorld.vue')
/*
const App = {
  data() {    
    const ppn = "161165839X"
    return {
      ...config,
      ppn,
      record: `003@ $0${ppn}`
    }
  },
  //components: { HelloWorld },
  mounted: function () {
    //this.editor = CodeMirror.fromTextArea(
    //  document.getElementById('pica-editor'), { viewportMargin: Infinity })    
    //this.editor.setValue
  },
  methods: {
    setRecord(record) {
      //this.editor.setValue(serializePica(this.record = record))
    },
    loadRecord() {
      this.setRecord([])

      const indexing = document.getElementById('indexing')
      indexing.innerHTML = ""
      fetchPica(this.ppn).then(pica => {
        var expr = ['003@',...pathes]

        pica.push(["045G",null,'a','300'])

        pica = filterPicaFields(pica, expr)
        this.setRecord(pica)
        
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
}*/

import App from './components/App.vue'

createApp(App).mount("#app")
