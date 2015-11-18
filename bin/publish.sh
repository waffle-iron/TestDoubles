#!/bin/bash

tag=`git describe --exact-match HEAD`
echo  "Tag is:" $tag

if [[ $tag == "" ]]; then
	echo "No tag is present for HEAD, therefore not publishing to npm"
	echo
else
	echo "++++++++++++++++ Releasing to NPM +++++++++++++++++++++++++++++ "
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
	npm publish
	rm .npmrc
fi