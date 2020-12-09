all: schemes.json databases.json

# collect JSKOS data about concept schemes listed in schemes.txt
schemes.json: schemes.txt
	xargs -i curl -s 'https://bartoc.org/api/voc?uri={}' < $< | \
		jq '.[]|{uri,identifier,prefLabel,notation,notationPattern,namespace,uriPattern,PICAPATH}' | jq -Sn '[inputs]' > $@

# collect data about PICA databases listed in databases.txt by their dbkey
databases.json: databases.txt
	xargs -i curl -s 'https://uri.gbv.de/database/{}?format=jsonld' < $< | \
		jq '{url,srubase,dbkey,uri,picabase,title}' | jq -Sn '[inputs]' > $@
