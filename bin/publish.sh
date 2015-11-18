#!/bin/bash

commit=`git log -1 --format=%B`
echo  "Commit is:" $commit

if [[ $commit =~ ^[0-9]*\.[0-9]*\.[0-9]*$ ]]; then
	echo
	echo "++++++++++++++++ Releasing to NPM +++++++++++++++++++++++++++++ "
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
	npm publish
	rm .npmrc
else
	echo "Not a semantic version commit, therefore not releasing to npm"
fi