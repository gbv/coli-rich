#!/bin/bash
# Get mappings of type < or = from a given RVK notation to BK, including annotations

curl -s -G "http://coli-conc.gbv.de/api/mappings" \
  --data-urlencode "from=$1" \
  --data-urlencode "fromScheme=http://uri.gbv.de/terminology/rvk/" \
  --data-urlencode "toScheme=http://uri.gbv.de/terminology/bk/" \
  --data-urlencode "properties=annotations" \
  --data-urlencode "type=http://www.w3.org/2004/02/skos/core#exactMatch|http://www.w3.org/2004/02/skos/core#narrowMatch" \
  | jq -c .[]
