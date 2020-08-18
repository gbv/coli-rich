export const picaFieldIdentifier = ([tag, occ]) =>
  tag + (occ ? "/" + (occ.length === 1 ? "0" + occ : occ) : "")

export const serializePicaField = field =>
  picaFieldIdentifier(field)
    + " "
    + field.slice(2).map((s,i) => i % 2 ? s.replace(/\$/g,"$") : "$" + s).join("")

export const serializePica = pica =>
  pica.map(serializePicaField).join("\n")

// utility to write long regular expressions
const regex = (...parts) => new RegExp(parts.map(r => r.source).join(""))
const picaPlainLine = regex(
  /^([012][0-9][0-9][A-Z@])/, // tag
  /(\/([0-9]{2,3}))?/,        // occurrence
  /\s*/,
  /(\$([A-Za-z0-9]).+)+/,
)

export const parsePica = text => text.split(/\n/).map(line => {
  const match = line.match(picaPlainLine)
  if (match) {
    const sf = match[4].split(/\$([A-Za-z0-9])/).slice(1).map(s => s.replace(/\$\$/g,"$"))
    return [ match[1], match[3], ...sf ]
  }
}).filter(Boolean)

export class PicaPath {
  constructor(s) {
    const match = s.match(
      /^([012.][0-9.][0-9.][A-Z@.])(\[(([0-9.]{2})|([0-9]{2}-[0-9]{2}))\])?(\$([_A-Za-z0-9]+))?$/)
    if (!match) throw "Invalid PICA Path expression"

    this.tag = new RegExp("^"+match[1]+"$")
    this.occ = match[4]
      ? new RegExp("^"+match[4]+"$")
      : (match[5] ? match[5].split("-") : null)
    this.sf  = match[7] ? new RegExp("^["+match[7]+"]$") : null
  }

  get tagString() {
    return this.tag.source.substring(1, this.tag.source.length-1)
  }

  get startOccurrence() {
    return Array.isArray(this.occ) ? this.occ[0] : null
  }

  get endOccurrence() {
    return Array.isArray(this.occ) ? this.occ[1] : null
  }

  get occurrenceString() {
    if (Array.isArray(this.occ)) return this.occ.join("-")
    return this.occf ? this.occ.source.substr(1,this.occ.source.length-1) : ""
  }

  get subfieldString() {
    const source = this.sf ? this.sf.source : ""
    return source.substring(2,source.length-2)
  }

  get toString() {
    return this.tagString
            + (this.occ ? "/" + this.occurrenceString : "")
            + (this.sf ? "$" + this.subfieldString : "")
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

  extractSubfields(field) {
    return field.filter((_,i) => i>2 && i%2 && (!this.sf || this.sf.test(field[i-1])))
  }

  getFields(record) {
    return record.filter(f => this.matchField(f))
  }

  getValues(record) {
    return [].concat(...(this.getFields(record).map(f => this.extractSubfields(f))))
  }

  getUniqueValues(record) {
    return [...new Set(this.getValues(record))]
  }
}

const PPN = new PicaPath("003@$0")
export function getPPN(record) {
  return PPN.getValues(record)[0]
}

export const filterPicaFields = (pica, expr) => {
  expr = Array.isArray(expr) ? expr : expr.split(/\|/)
  expr = expr.map(e => e instanceof PicaPath ? e : new PicaPath(e))
  return pica.filter(field => expr.some(e => e.matchField(field)))
}
