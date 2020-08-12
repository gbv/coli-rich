# coli-rich

This repository contains a web application to illustrate enrichment of PICA catalog records with subject indexing data from concordances. The web interface is in German.

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
