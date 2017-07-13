#!/bin/bash

find ./datas/geojson -type f | while read file
do
    arr=( `echo $file | tr -s '/' ' '`)
    pref=${arr[3]}
    dir="topojson/"$pref

    if [ ! -d ./datas/topojson/$pref ]
    then
        mkdir ./datas/topojson/$pref
    fi

    basename=$(basename $file)
    if [ $basename = '.DS_Store' -o ! ${basename##*.} = 'geojson' ]; then
      continue
    fi

    name=( `echo $basename | sed -e "s/\.geojson//"`)

    geo2topo -q 1e6 ./datas/geojson/$pref/$name.geojson > ./datas/topojson/$pref/$name.topojson

done