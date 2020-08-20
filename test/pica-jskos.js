import assert from "assert"
import jskos from "jskos-tools"
const { ConceptScheme } = jskos
import { picaSchemes } from "../js/pica-jskos.js"
import { PicaPath } from "../js/pica.js"

describe("picaSchemes", () => {
  const schemes = picaSchemes([{ uri: "http://example.org", PICAPATH: "000X$x" }])
  assert.deepEqual(Object.keys(schemes),["http://example.org"])
  assert(schemes["http://example.org"] instanceof ConceptScheme)
  assert(schemes["http://example.org"].PICAPATH instanceof PicaPath)
})
