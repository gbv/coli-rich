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

  examples: [
      "1673636357",
      "168675535X" // only DDC and LCC
  ]
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
