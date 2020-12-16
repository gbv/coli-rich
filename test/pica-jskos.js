import assert from "assert"
import jskos from "jskos-tools"
const { ConceptScheme } = jskos
import { picaSchemes, serializeDiff } from "../src/lib/pica-jskos.js"
import { PicaPath } from "pica-data"

describe("picaSchemes", () => {
  it("constructs a schemes object", () => {
    const schemes = picaSchemes([{ uri: "http://example.org", PICAPATH: "000X$x" }])
    assert.deepEqual(Object.keys(schemes),["http://example.org"])
    assert(schemes["http://example.org"] instanceof ConceptScheme)
    assert(schemes["http://example.org"].PICAPATH instanceof PicaPath)
  })
})

describe("serializeDiff", () => {
  const diff = [["=", "003@", null, "0", "123"], ["+", "045F", null, "a", "820"]]
  const expect = "  003@ $0123\n+ 045F $a820"

  it("serializes a PICA Diff", () => {
    assert.equal(serializeDiff(diff), expect)
  })
})
