test: examples

examples: data/records.reduced.ndjson

data/records.reduced.ndjson: examples/ppns
	./ppn2pica < $< | ./reducepica > $@
