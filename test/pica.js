import assert from "assert"
import jskos from "jskos-tools"
const { ConceptScheme } = jskos
import { PicaPath, picaSchemes } from "../js/pica.js"

const tests = {
  "003@": { tag: /^003@$/, occ: null, sf: null },
  "003@$0": { tag: /^003@$/, occ: null, subfieldString: "0"},
  "045Q[01-09]$a": {
    tag: /^045Q$/, occ: "01,09",
    startOccurrence: "01",
    endOccurrence: "09",
    occurrenceString: "01-09",
    subfieldString: "a",
  },
  "045G$a": { tag: /^045G$/, occ: null, subfieldString: "a"},
}

describe("PicaPath", () => {
  for (const [expr, expect] of Object.entries(tests)) {
    const path = new PicaPath(expr)
    for (let key in expect) {
      assert.equal(String(path[key]), String(expect[key]))
    }
  }
})

describe("picaSchemes", () => {
  const schemes = picaSchemes([{ uri: "http://example.org", PICAPATH: "000X$x" }])
  assert.deepEqual(Object.keys(schemes),["http://example.org"])
  assert(schemes["http://example.org"] instanceof ConceptScheme)
  assert(schemes["http://example.org"].PICAPATH instanceof PicaPath)
})
