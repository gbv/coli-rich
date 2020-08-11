import assert from 'assert'
import { PicaPath } from '../js/pica.js'

const tests = {
    "003@": [/^003@$/, null, null], 
    "003@$0": [/^003@$/, null, '0'],
    "045Q[01-09]$a": [/^045Q$/, '01,09', 'a'],
    "045G$a": [/^045G$/, null, 'a'],
}

describe("PicaPath", () => {
    for (const [expr, want] of Object.entries(tests)) {
        const path = new PicaPath(expr)
        assert.equal(String(path.tag), String(want[0]))
        assert.equal(String(path.occ), String(want[1]))
        assert.equal(String(path.sf), want[2] ? `/^[${want[2]}]$/`: "null")
    }
})
