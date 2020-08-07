export const picaFieldIdentifier = ([tag, occ]) => 
    tag + (occ ? "/" + (occ.length === 1 ? "0" + occ : occ) : "")

export const serializePicaField = field =>
    picaFieldIdentifier(field)
    + " " 
    + field.slice(2).map((s,i) => i % 2 ? s.replace(/\$/g,"$") : "$" + s).join("")

export const serializePica = pica =>
    pica.map(serializePicaField).join("\n")

// Partial PICA Path expression parser
export class PicaPath {
    constructor(s) {
        const match = s.match(/^([012.][0-9.][0-9.][A-Z@.])(\[(([0-9.]{2})|([0-9]{2}-[0-9]{2}))\])?/)
        if (!match) throw "Invalid PICA Path expression"
        this.tag = new RegExp("^"+match[1]+"$")
        this.occ = match[4] 
            ? new RegExp("^"+match[4]+"$") 
            : (match[5] ? match[5].split("-") : null)
    }

    matchField(field) {
        const [tag, occ] = field
        if (!this.tag.test(tag)) { return false }
        if (tag[0] === "2" || (!occ && !this.occ)) { return true }
        if (this.occ && !occ) return true
        return Array.isArray(this.occ)
            ? this.occ[0] <= occ && this.occ[1] >= occ
            : this.occ.test(occ)
    }
}

export const filterPicaFields = (pica, expr) => {
    expr = expr.split(/\|/).filter(e => e.length).map(e => new PicaPath(e))
    return pica.filter(field => expr.some(e => e.matchField(field)))
}
