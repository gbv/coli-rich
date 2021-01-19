# coli-rich

[![Build Status](https://travis-ci.org/gbv/coli-rich.svg?branch=master)](https://travis-ci.org/gbv/coli-rich)

This repository contains a web application to calculate, analyze and illustrate the enrichment of PICA catalog records with subject indexing data from concordances collected in [project coli-conc](https://coli-conc.gbv.de/). The application consists of a web interface and an API.

## Table of Contents

* [Install](#install)

## Install

coli-rich requires at least Node 14.

### Clone and Install

~~~
git clone https://github.com/gbv/coli-rich.git
cd jskos-server
npm install
~~~

### Configuration

Default configuration (located in `config/config.default.json`) can be modified by:

* user configuration file `config/config.json`.
* environment variables `NODE_ENV` (`development` or `production`) and `CONFIG_FILE`.

### Build static files

Unless running in development mode, static files need to be build first:

~~~
npm run build
~~~

### Install as service

Recommended installation requires [pm2](https://www.npmjs.com/package/pm2).

## Usage

### Run Server

~~~
# start in production mode on port 3077 (default)
npm run start

# start in development mode (hot-reloading)
run run dev
~~~

### Update

To update an existing installation:

~~~
git pull
npm install
npm run build
pm2 restart coli-conc
~~~

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
