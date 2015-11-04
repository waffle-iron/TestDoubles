#!/bin/bash

port=$1
incrementor=$2

for((i=-180;i<=180;i+=$incrementor)); 
do 
	baseURL="http://localhost:${port}/maps/api/geocode/json?latlng="
	geoPoints="0,$i"
	URL=$baseURL$geoPoints

	#curl command to execute the URL
	OUTPUT="$(curl -s $URL)"
	echo "${OUTPUT}" | grep -E '"formatted_address"' | head -1
done