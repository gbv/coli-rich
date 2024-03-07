# coli-rich

[![Build Status](https://travis-ci.org/gbv/coli-rich.svg?branch=master)](https://travis-ci.org/gbv/coli-rich)

This repository contains a web application to calculate, analyze and illustrate the enrichment of PICA catalog records with subject indexing data from concordances collected in [project coli-conc](https://coli-conc.gbv.de/). The application consists of a web interface and an API.

## Table of Contents

- [Install](#install)
  - [Clone and Install](#clone-and-install)
  - [Configuration](#configuration)
  - [Run Server](#run-server)
- [Contribute](#contribute)
- [License](#license)

## Install

coli-rich is written in ECMAScript 2015 (ES6) with [Vue3](https://v3.vuejs.org/). The application currently requires Node.js 14.

### Clone and Install

~~~
git clone https://github.com/gbv/coli-rich.git
cd coli-rich
npm install
~~~

### Configuration

Default configuration (located in `config/config.default.json`) can be modified by:

* user configuration file `config/config.json`.
* environment variables `NODE_ENV` (`development` or `production`) and `CONFIG_FILE`.

### Run Server

Recommended installation requires [pm2](https://www.npmjs.com/package/pm2):

~~~
pm2 start ecosystem.config.json
~~~

Alternatively build static files and run (by default on port 3077):

~~~
npm run build
npm run start
~~~

Or start in in development mode (hot-reloading)

~~~
run run dev
~~~

## Contribute

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

## License

MIT ©2024 Verbundzentrale des GBV (VZG)
