var utils = require('../utils.js');
var requests = require('../requests.js');
var http = require('http');
var mbPort = process.env.MB_PORT || 2525;
var mbHost = process.env.MB_HOST || 'localhost';

/**
 * Handles the case in which the local testdouble is undefined.
 * @param {Object} testDoubleDefinition The testdouble object. 
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
	var checkGetTestdouble = http.request(options, function(res) {

		res.setEncoding('utf8');
		var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			utils.logger.info('[' + testDoubleDefinition.name + ']' + '  made initial request to find testdouble with name in get testdouble ' + testDoubleDefinition.name);
			utils.logger.debug('[' + testDoubleDefinition.name + ']' + '  data from find all call in get testdouble: ' + data);
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

			if(exists)
			{
				utils.logger.debug('  JSON before getting: ' + JSON.stringify(testDouble, null, 4));
				utils.logger.debug('  [' + testDouble.name + ']' + ' entering getTestDouble() from getAllTestDoubles()');
				requests.getTestDouble(testDouble, reply);
			}

			else
			{
				utils.logger.debug('  testDouble does not exist, exiting get handler');
				utils.sendFailureReply(reply, "missing resource", "testdouble does not exist");
			}
		});

		res.on('error', function(error) {
			utils.logger.error('  could not get testdouble because of problems in checking if get testdouble exists response: ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not get testdouble because of problems in preliminary checking response: " + error.message);
		});
	});

	checkGetTestdouble.end();

	checkGetTestdouble.on('error', function(error) {
		utils.logger.error('  could not get testdouble because of problems in preliminary checking if get testdouble exists request: ' + error.message);
		utils.sendFailureReply(reply, "bad request",  "could not get testdouble because of problems in preliminary checking request for all testdoubles: "  + error.message);			
	});
}

/**
 * Retrieves a testdouble's definition.
 * @param {Object} request The request object that is passed by Hapi.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getTestDoubleHandler(request, reply)
{
	utils.logger.debug('Entering get testdouble handler, Begin request GET /testdoubles/{testDoubleName}');
	utils.logger.debug('  entering getTestDoubleDefinition()');
	var testDouble = utils.getTestDoubleDefinition(request.params.testDoubleName);

	//local testdouble is undefined
	if(testDouble === undefined)
	{
		var testDoubleDefinition = {
			"name": request.params.testDoubleName
		};

		utils.logger.debug('  local testdouble is undefined, entering getAllTestDoubles() for get API');
		getAllTestDoubles(testDoubleDefinition, reply);
	}

	//local testdouble is defined
	else
	{
		requests.getTestDouble(testDouble, reply);
	}
}

module.exports = {
	getTestDoubleHandler: getTestDoubleHandler
};