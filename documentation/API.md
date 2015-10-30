# TestDoubles API 

The REST API provides a programmatic approach to access TestDoubles features.

The "{}" denotes that an appropriate value must be substituted for the required parameter, for the api path only.

- [GET /testdoubles](#get-testdoubles)
- [GET /testdoubles/{testDoubleName}](#get-testdoublestestdoublename)
- [POST /testdoubles](#post-testdoubles)
- [POST /testdoubles/{testDoubleName}/proxy](#post-testdoublestestdoublenameproxy)
- [POST /testdouble/{testDoubleName}](#post-testdoublestestdoublename)
- [DELETE /testdoubles/{testDoubleName}/proxy](#delete-testdoublestestdoublenameproxy)
- [DELETE /testdoubles](#delete-testdoubles)
- [DELETE /testdoubles/{testDoubleName}](#delete-testdoublestestdoublename)
- [PUT /testdoubles](#put-testdoubles)

## GET /testdoubles

> Retrieves all the testdoubles that currently exist, or error if no testdoubles exist. Does not return any recorded data.

There is no JSON payload for this API.

CURL example

```
curl -X GET http://hostname:port/testdoubles
```

## GET /testdoubles/{testDoubleName}

> Retrieves a testdouble, or error if the testdouble does not exist.

There is no JSON payload for this API.

CURL example

```
curl -X GET http://hostname:post/testdoubles/{testDoubleName}
```

## POST /testdoubles

> Creates a new testdouble, or error if the testdouble already exists. 

Required parameters

1. testDoubleName: The name of the testdouble.

JSON example

```
{
    "name": "google",
    "protocol": "http"
}
```

CURL example with regular JSON data

```
curl -X POST -H 'Content-Type: application/json' -d '{"name": "google", "protocol": "http"}' http://hostname:port/testdoubles
```

CURL example with JSON file

```
curl -X POST -H 'Content-Type: application/json' --data @"path/to/file" http://hostname:port/testdoubles
```

## POST /testdoubles/{testDoubleName}/proxy

> Creates the testdouble, but with a proxy endpoint so that the testdouble can mimic the end service.
If the testdouble does not exist, an error response will be returned.
Any data in the testdouble that exists will be replaced with the proxy definition.

Required parameters

1. testDoubleName: The name of the testdouble.
2. serviceHost: the hostname of the end service. Must be passed as a JSON payload.

JSON Example

```
{
    "serviceHost": "http://maps.googleapis.com"
}
```

CURL example

```
curl -X POST -H 'Content-Type: application/json' -d'{
    "serviceHost": "https://api.stackexchange.com"
}' http://hostname:port/testdoubles/{testDoubleName}/proxy
```

## POST /testdoubles/{testDoubleName}

> Creates a testdouble with the specified data after converting it into the required format.

Required parameter

1. testDouble name: The name of the testdouble
2. File: The file containing the data
3. Format of the file: The type of data

Options 2 and 3 must be sent through the payload.

## DELETE /testdoubles/{testDoubleName}/proxy

> Removes the proxy for the existing testdouble, and saves any recorded data, replacing any previous data.
Returns an error if the testdouble does not exist.

There is no JSON payload for this API.

Required parameter

1. testDoubleName: The name of the test double

CURL example
```
curl -X DELETE http://hostname:port/testdoubles/{testDoubleName}/proxy
```

## DELETE /testdoubles

> Deletes all testdoubles.

There is no JSON payload for this API.

CURL example

```
curl -X DELETE http://hostname:port/testdoubles
```

## DELETE /testdoubles/{testDoubleName}

> Deletes a testdouble.

There is no JSON payload for this API.

Required parameter

1. testDoubleName: The name of the testdouble.

CURL example

```
curl -X DELETE http://hostname:port/testdoubles/{testDoubleName}
```

## PUT /testdoubles

> Imports a list of testdoubles.

JSON payload example

```
{
    "imposters": [
        {
            "name": "google",
            "protocol": "http",
            "requests": [],
            "stubs": []
        },
        {
            "name": "test",
            "protocol": "http",
            "requests": [],
            "stubs": []
        }
    ]
}
```

Required parameter

The parameter must be passed as a JSON payload, as shown above. Each element in the imposters array represents a testdouble.
Each testdouble must have a name at a minimum, otherwise the entire operation will be rejected.

CURL example with file

```
curl -X PUT -H ${header} --data @"path/to/file/here" http://hostname:port/testdoubles
```
