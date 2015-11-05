var utils = require('../utils.js');
var requests = require('../requests.js');
var http = require('http');
var mbPort = process.env.MB_PORT || 2525;
var mbHost = process.env.MB_HOST || 'localhost';

/**
 * Generates a proxy stub for the given service host.
 * @param  {string} serviceHost The hostname of the end service that is to be emulated.
 * @return {Object} The proxy stub that will be used for the testdouble's definition.
 */
function createProxyStubs(serviceHost)
{
	utils.logger.debug("service host: " + serviceHost);

	return [
	   {
	     "responses": [
	       {
	         "proxy": {
	           "to": serviceHost,
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
	];
}

/**
 * Handles the case in which the local testdouble is undefined.
 * @param {Object} testDoubleDefinition The testdouble object to be created with a proxy. 
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getAllTestDoubles(testDoubleDefinition, reply)
{
	var testDouble = {};

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters/' + '?replayable=true',
		method: 'GET'
	};

	//queries mb to check if the testdouble exists
	var checkProxyExists = http.request(options, function(res) {

		res.setEncoding('utf8');
		var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			utils.logger.info('[' + testDoubleDefinition.name + ']' + '  made initial request to find testdouble with name ' + testDoubleDefinition.name);
			utils.logger.debug('[' + testDoubleDefinition.name + ']' + '  data from find all call: ' + data);
			data = JSON.parse(data);

			var imposters = data.imposters;
			var index = 0;
			var exists = false;

			//checks to see if the testdoubles list contains a testdouble with the given name
			while(index < imposters.length && exists === false)
			{
				if(imposters[index].name === testDoubleDefinition.name)
				{
					exists = true;
				}

				index++;
			}

			//this is the index at which testdouble is found, also co-controlled by exists 
			var portIndex = index-1;

			utils.logger.debug('[' + testDoubleDefinition.name + ']' + ' portIndex: ' + portIndex);
			testDouble = data.imposters[portIndex];
			utils.logger.debug('  JSON after creating: ' + JSON.stringify(testDouble, null, 4));

			if(exists)
			{
				testDouble.stubs = createProxyStubs(testDoubleDefinition.serviceHost);
				utils.logger.debug('  JSON before deleting: ' + JSON.stringify(testDouble, null, 4));

				utils.logger.debug('  [' + testDouble.name + ']' + ' entering deleteRequest() from getAllTestDoubles()');
				requests.deleteRequest(testDouble, reply);
			}

			else
			{
				utils.logger.debug('  testDouble does not exist, exiting create proxy handler');
				utils.sendFailureReply(reply, "missing resource", "testdouble does not exist");
			}
		});

		res.on('error', function(error) {
			utils.logger.error('  could not create proxy because of problems in checking if proxy exists response: ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not create proxy because of problems in response: " + error.message);
		});
	});

	checkProxyExists.end();

	checkProxyExists.on('error', function(error) {
		utils.logger.error('  could not create testdouble because of problems in checking if proxy exists request: ' + error.message);
		utils.sendFailureReply(reply, "bad request",  "could not create proxy because of problems in intial checking request for all testdoubles: "  + error.message);			
	});
}

/**
 * Creates a testdouble with a proxy definition, overriding any previously saved definitions.
 * @param {Object} request The request object that is passed by Hapi.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function createProxyHandler(request, reply) 
{
	utils.logger.debug('Entering create proxy handler, Begin request POST /testdoubles/{testDoubleName}/proxy');
	utils.logger.debug('  [' + request.params.testDoubleName +']' + '  entering getTestDoubleDefinition()');

	var serviceHost  = request.payload.serviceHost;

	//checks if serviceHost is contained in the payload
	if(serviceHost === undefined || serviceHost === '' || typeof serviceHost !== 'string')
	{
		utils.sendFailureReply(reply, "bad data", "service host is required");
		utils.logger.debug('  [' + request.params.testDoubleName +']' + '  service host not passed, exiting create proxy handler');
		return;
	}

	//serviceHost is in payload
	else
	{
		var testDouble = utils.getTestDoubleDefinition(request.params.testDoubleName);

		var testDoubleDefinition = {
			"name": request.params.testDoubleName,
			"serviceHost": serviceHost
		};

		//local testdouble is undefined, search through all mb's testdoubles, 
		//and if exists, recreate with proxy, else send failure reply
		if(testDouble === undefined)
		{
			utils.logger.debug('  entering getAllTestDoubles()');
			getAllTestDoubles(testDoubleDefinition, reply);
		}

		//local testdouble does exist
		else
		{
			utils.logger.debug('  came into else, local testdouble does exist');
			testDouble.stubs = createProxyStubs(testDoubleDefinition.serviceHost);
			utils.logger.debug(' entering deleteRequest()');
			requests.deleteRequest(testDouble, reply);
		}
	}
}

module.exports = {
	createProxyHandler: createProxyHandler
};