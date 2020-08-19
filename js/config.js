export default
{
  // where to load records from
  unapi: "https://unapi.k10plus.de/",
  databases: {
    "opac-de-627": {
      prefLabel: { de: "K10Plus" },
      picabase: "https://opac.k10plus.de/",
    },
    "test-k10plus-kxpt": {
      picabase: "https://kxpt.k10plus.de/DB=1.1/",
      prefLabel: { de: "K10plus-Test (kxpt)" },
    },
  },
  dbkey: "opac-de-627",

  // link into Cocoda
  cocoda: "https://coli-conc.gbv.de/cocoda/app/",

  mappingApi: "https://coli-conc.gbv.de/api/mappings",

  avram: "https://format.k10plus.de/avram.pl",

  examples: [
    "161165839X",
    "1673636357",
    "168675535X", // only DDC and LCC
    "786733772",
  ],
  /*
    {
      uri:  "http://bartoc.org/en/node/430",
      namespace: "http://d-nb.info/gnd/",
      notation: [ "GND" ],
      notationPattern: "[0-9X-]+",
      prefLabel: { de: "Gemeinsame Normdatei" },
      PICAPATH: "041A[00-99]$9|044K[00-09]$9|013D$8" // FIXME: does not include notation but PPN
    },
  ]
  */
}
