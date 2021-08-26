#!/bin/bash
./rvkbk-mappings.sh "$1" | jq -cf ./trusted-mappings.jq
