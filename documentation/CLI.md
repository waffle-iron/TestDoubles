# TestDoubles CLI

The TestDoubles Command Line Interface is a unified tool to manage your TestDoubles services.

## Synopsis

td [options] [command] [parameters]

## Options

* help

> Lists all available TestDoubles commands and documentation reference.

## Available Commands

* [create](#create)
* [recreate](#recreate)
* [set-record-mode](#set-record-mode)
* [set-playback-mode](#set-playback-mode)
* [delete](#delete)
* [describe](#describe)

### create
   
Creates a new testdouble, or error if the testdouble already exists. There are two ways to create a testdouble. The necessary information for both ways is described below.

**Syntax**

* Create with testdouble name.

```sh
td [create] --td-name "testdoubleName" 
```
--td-name {testdoubleName} (String)

> The name of the testdouble to be created

* Create with an existing file.

```sh
td [create] --file "Google.json" 
```
--file {file name} (String)

> The JSON payload file for the testdouble to be created with absolute or relative path

The existing file must be in JSON format. An example JSON file is shown below.

```
{
    "name": "googleGeoPoints",
    "protocol": "http",
    "port": 5051,
    "stubs": []
}
```

**Examples**

This example specifies a new testdoubleName or the json payload file to create a new testdoubles instance

```sh
$ td create --td-name "googleGeoPoints"
$ td create --file "Google.json"
```
**Output**

The output displays the newly created testdouble parameters

```sh
TestDoubles server listening at http://localhost:5050
{
    "protocol": "http",
    "port": 52324,
    "name": "googleGeoPoints",
    "requests": [],
    "stubs": [],
    "_links": {
        "self": {
            "href": "http://localhost:2525/imposters/52324"
        }
    },
    "host": "localhost"
}
```
### recreate
   
Creates more than one testdoubles with json file input, or error if any one of the testdouble already exists. If data already exists, all the testdouble will be created with the data.

**Syntax**

Create multiple testdoubles with json payload

```sh
td [recreate] --file "fileName" 
```
--file {fileName} (String)

> The json file with absolute or relative path

**Examples**

This example creates multiple testdoubles passing the json payload file

```sh
$ td recreate --file "Google.json"
```
**Output**

The output displays all the newly created testdoubles parameters and data, if passed it with the json file
```sh
{
  "imposters": [
    {
      "protocol": "http",
      "port": 49487,
      "_links": {
        "self": {
          "href": "http://localhost:2525/imposters/49487"
        }
      }
    },
    {
      "protocol": "http",
      "port": 51469,
      "_links": {
        "self": {
          "href": "http://localhost:2525/imposters/51469"
        }
      }
    }
  ]
}
```
### set-record-mode

Creates the testdouble, with a proxy endpoint so that the testdouble can mimic the actual end service. If the testdouble does not exist, an error response will be returned. Any data in the testdouble that exists will be replaced with the proxy definition.

**Syntax**

```sh
td [set-record-mode] --td-name "testdoubleName" --td-servicehost "testdoubles hostname"
```
--td-name {testDoubleName} (String)

> The name of the testdouble instance 

--td-servicehost {testDoubles hostname} (String)

> The hostname of the end service. 

**Examples**

This example creates a testdouble proxy endpoint for the testdouble instance

```sh
$ td set-record-mode --td-name "googleGeoPoints" --td-servicehost "https://maps.googleapis.com"
```
**Output**

The output displays testdoubles proxy information
```sh
TestDoubles server listening at http://localhost:5050
{
    "protocol": "http",
    "port": 52324,
    "name": "googleGeoPoints",
    "requests": [],
    "stubs": [
        {
            "responses": [
                {
                    "proxy": {
                        "to": "https://maps.googleapis.com",
                        "mode": "proxyAlways",
                        "predicateGenerators": [
                            {
                                "matches": {
                                    "method": true,
                                    "path": true,
                                    "query": true
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ],
    "_links": {
        "self": {
            "href": "http://localhost:2525/imposters/52324"
        }
    },
    "host": "localhost"
}
```

### set-playback-mode

Removes the proxy for the existing testdouble, and saves any recorded data, replacing any previous data. Returns an error if the testdouble does not exist.

**Syntax**

```sh
td [set-playback-mode] --td-name "testdoubleName"
```
--td-name {testDoubleName} (String)

> The name of the testdouble instance created

**Examples**

This example deletes the proxy endpoint created for the testdouble instance

```sh
$ td set-playback-mode --td-name "googleGeoPoints"
```
**Output**

The output displays testdoubles recorded data 
```sh
{
    "protocol": "http",
    "port": 52324,
    "name": "googleGeoPoints",
    "requests": [],
    "stubs": [],
    "_links": {
        "self": {
            "href": "http://localhost:2525/imposters/52324"
        }
    },
    "host": "localhost"
}
```
### delete

Removes the proxy for the existing testdouble, and saves any recorded data, replacing any previous data. Returns an error if the testdouble does not exist.

**Syntax**

* Delete all testdoubles created, if testdoubles name isn't specified

```sh
td [delete] 
```
* Delete only the specified testdouble

```sh
td [delete] --td-name "testdoubleName"
```
--td-name {testDoubleName} (String)

> The name of the testdouble to be deleted

**Examples**

This example deletes either a single testdouble or all testdoubles created 

```sh
$ td delete
$ td delete --td-name "googleGeoPoints"
```
**Output**

The output displays testdoubles recorded data, if recorded
```sh
{
    "imposters": [
        {
            "protocol": "http",
            "port": 56490,
            "name": "Google",
            "stubs": []
        },
        {
            "protocol": "http",
            "port": 57646,
            "name": "Maps",
            "stubs": []
        }
    ]
}
```

### describe

Retrieves all the testdoubles that currently exist, or error if no testdoubles exist. Does not return any recorded data.

**Syntax**

* Describes all the testdoubles created with the recorded data

```sh
td [describe]
```
* Describes only the given testdoubles with the recorded data

```sh
td [describe] --td-name "googlegeopoints"
```
--td-name {testDoubleName} (String)

> The name of the testdouble needed for the description

**Examples**

This example displays either a single testdouble or multiple testdoubles recorded data

```sh
$ td describe
$ td describe --td-name "googleGeoPoints"
```
**Output**

The output displays all the testdoubles created
```sh
{
    "imposters": [
        {
            "protocol": "http",
            "port": 49487,
            "name": "Maps",
            "stubs": []
        },
        {
            "protocol": "http",
            "port": 51469,
            "name": "Google",
            "stubs": []
        }
    ]
}
```
