test: examples

examples: data/records.ndjson

data/records.ndjson: examples/ppns
	./ppn2pica < $< > $@
