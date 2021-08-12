#!/bin/bash
catmandu convert kxpmeta --query "$1" to JSON | jq -r .[].numberOfRecords
