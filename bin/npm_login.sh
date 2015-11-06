#!/bin/bash

#Reads an npm user's login credentials from environment variables and executes npm login

checkForEnvironmentVariables()
{
	if [ -z "$NPM_USERNAME" ]; then
		echo "NPM_USERNAME environment variable is not set"
		exit 1
	elif [ -z "$NPM_PASSWORD" ]; then
		echo "NPM_PASSWORD environment variable is not set"
		exit 1
	elif [ -z "$NPM_EMAIL" ]; then
		echo "NPM_EMAIL environment variable is not set"
		exit 1
	fi
}

checkForEnvironmentVariables

npm login <<!
$NPM_USERNAME
$NPM_PASSWORD
$NPM_EMAIL
!
