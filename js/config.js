export default
{
  unapi: "https://unapi.k10plus.de/",
  dbkey: "opac-de-627",
  cocoda: "https://coli-conc.gbv.de/cocoda/app/",
  avram: "https://uri.gbv.de/avram-demo/", // TODO: change location!
  schemes: [ // TODO: load via API
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
