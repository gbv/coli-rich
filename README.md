# KXP Mapper

Manage addition of subject indexing into K10plus based on coli-conc mappings.

## Requirements

The current prototype is being developed in Perl based on [Catmandu](https://github.com/LibreCat/Catmandu). Additionally required Perl modules are listed in `cpanfile`. This should install the modules on Debian-based systems:

    sudo apt-get install libcatmandu-perl
    cpanm --installdeps .

## Overview

This repository contains several helper scripts to build an automatic workflow.

PICA+ records are read and written in newline-delimited [PICA/JSON](http://format.gbv.de/pica/json). To view PICA/JSON records in human readable format use `catmandu`, e.g.:

    catmandu convert ndjson to pp < data/records.reduced.ndjson

Run `make` to execute the scripts with some examples.

### ppn2pica

Reads a list of PPN identifiers from STDIN, fetches the corresponding PICA+ records via unAPI from K10plus and prints the records in line-delimited PICA/JSON:

    ./ppn2pica < examples/ppns > data/records.full.ndjson

### reducepica

Reads and writes newline-delimited PICA/JSON. Reduces the records to fields used for subject indexing (listed in field `PICAPATH` in `config/schemes.ndjson`):

    ./reducepica < data/record.full.ndjson > data/records.reduced.ndjson

### extendpica

Reads and writes a list of line-delimited PICA/JSON records. Records must have a PPN at least. Checks whether the vocabulary specified as first argument is used but not the second. Looks up a matching mappings and adds a PICA field on success:

    ./extendpica rvk bk < data/records.reduced.ndjson

Again, use `catmandu` for inspecting PICA records in plain format. See `extendpica --help` for additional options.

To check which records have been modified use `diff`.

*This is a very early prototype, only simple cases a supported!*

## Configuration

See `config/config.default.json` for default configuration values. These can be overridden in a local file `config/config.json`.

JSKOS concept schemes are configured in `config/schemes.json` with `config/schemes.default.json` as default list. Each scheme must be given a JSON key mapped to a [JSKOS Concept Scheme] including fields `uri`, `namespace`, and `PICAPATH` at least.

Default schemes can be disabled by setting their value to `false`.

[JSKOS Concept Scheme]: https://gbv.github.io/jskos/jskos.html#concept-schemes
