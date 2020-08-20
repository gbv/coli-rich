import jskos from "jskos-tools"
const { ConceptScheme } = jskos

import { PicaPath } from "./pica.js"

// Create a set of JSKOS concept schemes with PICAPATH
export const picaSchemes = array =>
  (array||[]).filter(s => s.PICAPATH).reduce((schemes, s) => {
    s = new ConceptScheme(s)
    s.PICAPATH = new PicaPath(s.PICAPATH)
    schemes[s.uri] = s
    return schemes
  }, {})
