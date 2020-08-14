# coli-rich

[![Build Status](https://travis-ci.org/gbv/coli-rich.svg?branch=master)](https://travis-ci.org/gbv/coli-rich)

This repository contains a web application to illustrate and analyze the enrichment of PICA catalog records with subject indexing data from concordances collected in [project coli-conc](https://coli-conc.gbv.de/). The application consists of:

* A web interface in German, deployed automatically at <https://gbv.github.io/coli-rich/>
* A web service (not deployed yet)

## Usage

Try out the web interface at <https://gbv.github.io/coli-rich/>.

## Development

The application is written in ECMAScript 2015 (ES6) with [Vue3] and [Vite].

[Vue3]: https://v3.vuejs.org/
[vite]: https://github.com/vitejs/vite#readme

Install dependencies and start developer instance:

~~~sh
npm i
npm run dev
~~~

Run some tests:

~~~sh
npm test
~~~

Build static files for deployment. The application is configured to be put in a subfolder `/coli-rich/`:

~~~sh
npm run build
~~~
