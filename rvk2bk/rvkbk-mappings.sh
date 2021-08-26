#!/bin/bash
# Get mappings of type < or = from any or a given RVK notation to BK, including annotations
RVK=$1
LIMIT=2000

curl -s -G "http://coli-conc.gbv.de/api/mappings" \
  `if [ "$RVK" ]; then echo "--data-urlencode \"from=$RVK\""; fi` \
  --data-urlencode "fromScheme=http://uri.gbv.de/terminology/rvk/" \
  --data-urlencode "toScheme=http://uri.gbv.de/terminology/bk/" \
  --data-urlencode "properties=annotations" \
  --data-urlencode "limit=$LIMIT" \
  --data-urlencode "type=http://www.w3.org/2004/02/skos/core#exactMatch|http://www.w3.org/2004/02/skos/core#narrowMatch" \
| jq -c .[]
