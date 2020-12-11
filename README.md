# coli-rich

[![Build Status](https://travis-ci.org/gbv/coli-rich.svg?branch=master)](https://travis-ci.org/gbv/coli-rich)

This repository contains a web application to illustrate and analyze the enrichment of PICA catalog records with subject indexing data from concordances collected in [project coli-conc](https://coli-conc.gbv.de/). The application consists of:

* A web interface in German, deployed automatically at <https://gbv.github.io/coli-rich/>
* A web service (not deployed yet)

## Usage

Try out the web interface at <https://gbv.github.io/coli-rich/>.

The web service can be started on port 3077:

~~~sh
npn run start
~~~

A list of configured concept schemes is made available at `/voc`. The base URL `/` expects the following query parameters:

* `id` (required) database key and ppn, e.g. `opac-de-627:ppn:168675535X` for K10Plus
* `fromScheme` and `toScheme`: optional concept scheme URIs, separated by `|`
* `format` response format (optional):
  * `picajson`: original record, reduced to subject indexing fields in PICA/JSON syntax
  * `pp`: original record, reduced to subject indexing fields in PICA Plain syntax
  * `indexing`: subject indexing found in the original record
  * `diff`: changes to be applied to the record in JSON format
  * `ppdiff`: changes to be applied to the record in PICA+ change format (default)

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
