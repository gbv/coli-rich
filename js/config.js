export default
{
  // where to load records from
  unapi: "https://unapi.k10plus.de/",
  dbkey: "opac-de-627",

  // link into catalog
  opac: "https://opac.k10plus.de/",

  // link into Cocoda
  cocoda: "https://coli-conc.gbv.de/cocoda/app/",

  mappingApi: "https://coli-conc.gbv.de/api/mappings",

  avram: "https://uri.gbv.de/avram-demo/", // TODO: change location!
  schemes: [ // TODO: load via API
    /* 
    {
      uri:  "http://bartoc.org/en/node/430",
      namespace: "http://d-nb.info/gnd/",
      notation: [ "GND" ],
      notationPattern: "[0-9X-]+",
      prefLabel: { de: "Gemeinsame Normdatei" },
      PICAPATH: "041A[00-99]$9|044K[00-09]$9|013D$8" // FIXME: does not include notation but PPN
    },
    */
    {
      "uri": "http://uri.gbv.de/terminology/bk/",
      "prefLabel": { "de": "Basisklassifikation" },
      "notation": [ "BK" ],
      "PICAPATH": "045Q[01-09]$a",
      "namespace": "http://uri.gbv.de/terminology/bk/",
      "notationPattern": "(0|1-2|3-4|5|7-8|[0-9]{2}(\\.[0-9]{2})?)"
    },
    {
      "uri": "http://uri.gbv.de/terminology/rvk/",
      "prefLabel": { "de": "Regensburger Verbundklassifikation" },
      "notation": [ "RVK" ],
      "PICAPATH": "045R$a",
      "namespace": "http://rvk.uni-regensburg.de/nt/",
      "notationPattern": "(LD,)?[A-Z]([A-Z]( [0-9]+([a-z]|\\.[0-9]+)?( [A-Z][0-9]*)?)?)?( - [A-Z]([A-Z]( [0-9]+([a-z]|\\.[0-9]+)?( [A-Z][0-9]*)?)?)?)?"
    },
    {
      "uri": "http://bartoc.org/en/node/18497",
      "notation": [ "SDNB" ],
      "notationPattern": "[0-9]([0-9][0-9](\\.[0-9][0-9]?)?)?|[BKS]",
      "prefLabel": {
        "de": "Sachgruppen der Deutschen Nationalbibliografie (ab 2004)"
      },
      PICAPATH: "045G$a",
      "notationPattern": "[0-9]([0-9][0-9](\\.[0-9][0-9]?)?)?|[BKS]",
      "namespace": "http://uri.gbv.de/terminology/sdnb/",
    }
  ]
}
