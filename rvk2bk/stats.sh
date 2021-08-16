#!/bin/bash

# enable cronjob with this script piped to stats.ndjson

set -e

CONCORDANCES=(rvk-bk ddc-bk)
DATE=$(date -I)

# Anzahl von Datensätzen, deren Sacherschließung mit Mappings angereichert wurde
ALL=$(./count.sh 'pica.seq=coli-conc.*')

echo -n "{\"date\":\"$DATE\",\"total\":$ALL"

for conc in "${CONCORDANCES[@]}"; do
  # Anzahl von Datensätzen, deren Sacherschließung mit RVK-BK-Mappings angereichert wurde
  COUNT=$(./count.sh "pica.seq=\"coli-conc $conc\"")
  echo -n ",\"$conc\":$COUNT"
done

echo "}"

# Anzahl von Datensätzen, deren Sacherschließung mit RVK-Mappings angereichert wurde
# ./count.sh 'pica.seq="coli-conc rvk.*"'

# Anzahl von Datensätzen, deren Sacherschließung mit einem bestimmten Mapping angreichert wurde
# Achtung: Sonderzeichen durch Leerzeichen ersetzen!
# https://coli-conc.gbv.de/api/mappings/5812d5a4-4301-4677-9236-e6e3b8d68f24
# ./count.sh 'pica.seq="https coli conc gbv de api mappings d415aba4-14c2-4a9c-822a-1a589787545d"'
