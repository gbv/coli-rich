#!/bin/bash
./rvkbk-mappings.sh "$1" | jq -f ./trusted-mappings.jq
