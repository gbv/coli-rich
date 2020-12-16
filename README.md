# coli-rich

[![Build Status](https://travis-ci.org/gbv/coli-rich.svg?branch=master)](https://travis-ci.org/gbv/coli-rich)

This repository contains a web application to calculate, analyze and illustrate the enrichment of PICA catalog records with subject indexing data from concordances collected in [project coli-conc](https://coli-conc.gbv.de/). The application consists of a web interface and an API.

## Technical Background

coli-rich extends [JSKOS](https://gbv.github.io/jskos/) format by Indexing Sets.

An **Indexing Set** is a JSON object that maps Concept Scheme URIs to sets of concepts, each being `inScheme` of the corresponding Concept Scheme. A minimal example with one Concept Scheme and one Concept:

~~~json
{
  "http://bartoc.org/en/node/18785": [
    {
      "uri": "http://uri.gbv.de/terminology/bk/43.31",
      "notation": [ "43.31" ],
      "inScheme": [
        { 
          "uri": "http://bartoc.org/en/node/18785" 
        }
      ]
    }
  ]
}
~~~

The concepts in an Indexing Set can further have fields:

* `PATCH` with value `=` (keep), `+` (add), or `-` (remove)
* `mappings` with a set of mappings that resulted in addition or removal of the concepts

Given the Concept Scheme field `PICAPATH`, an Indexing Set can be converted from and to PICA format or PICA Patch format.

## Usage

The web service can be started on port 3077:

~~~sh
npn run start
~~~


## Development

The application is written in ECMAScript 2015 (ES6) with [Vue3](https://v3.vuejs.org/).

Install dependencies and start developer instance:

~~~sh
npm i
npm run dev
~~~

Run some tests:

~~~sh
npm test
~~~

Build static web interface files for deployment in subfolder `/dist/`:

~~~sh
npm run build
~~~
