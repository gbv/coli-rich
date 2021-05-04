#!/bin/bash
set -e

RVK=$1

die() {
  printf '%s\n' "$1" >&2
  exit 1
}

[[ $RVK =~ ^[A-Z][A-Z]$ ]] \
  || die "Bitte RVK-Hauptklasse (zwei Großbuchstaben) angeben!"

curl -s "http://coli-conc.gbv.de/rvk/api/data?notation=$RVK" | jq -e 'length==1' > /dev/null \
  || die "RVK $RVK nicht gefunden"

echo "K10plus-Datensätze mit RVK $RVK (oder speziellerer Klasse...)"
catmandu convert kxp --query "pica.rvk=$RVK" to pp | picadata -p '003@|045Q|045R' > $RVK.pica

picadata -c $RVK.pica
