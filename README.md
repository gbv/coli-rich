# KXP Mapper

Manage addition of subject indexing into K10plus based on coli-conc mappings.

## Requirements

The current prototype is being developed in Perl based on [Catmandu](https://github.com/LibreCat/Catmandu). Additionally required Perl modules are listed in `cpanfile`. This should install the modules on Debian-based systems:

    sudo apt-get install libcatmandu-perl
    cpanm --installdeps .

## Overview

This repository contains several helper scripts to build an automatic workflow.

### ppn2pica

Reads a list of PPN identifiers from STDIN, fetches the corresponding PICA+ records via unAPI from K10plus, reduces the records to fields used for subject indexing (listed in field `PICAPATH` in `config/schemes.ndjson`) and prints the records in line-delimited PICA/JSON format:

    ./ppn2pica < examples/ppns > data/records.ndjson

To view the PICA records in human readable format use:

    catmandu convert ndjson to pp < data/records.ndjson

### extendpica

Reads and writes a list of line-delimited PICA/JSON records. Checks whether the vocabulary specified first is used but not the second. Looks up a matching mapping and adds a PICA field on success:

    ./extendpica rvk bk < data/records.ndjson

Again, use `catmandu` for inspecting PICA records in plain format. To check which records have been modified use `diff`.

*This is a very early prototype, only simple cases a supported!*

## Configuration

See `config/config.default.json` for default configuration values. These can be overridden in a local file `config/config.json`.

JSKOS concept schemes are configured in `config/schemes.json` with `config/schemes.default.json` as default list. Each scheme must be given a JSON key mapped to a [JSKOS Concept Scheme] including fields `uri`, `namespace`, and `PICAPATH` at least.

Default schemes can be disabled by setting their value to `false`.

[JSKOS Concept Scheme]: https://gbv.github.io/jskos/jskos.html#concept-schemes
