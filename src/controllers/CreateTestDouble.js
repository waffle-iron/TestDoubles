var utils = require('../utils.js');
var requests = require('../requests.js');
var http = require('http');
var mbPort = process.env.MB_PORT || 2525;
var mbHost = process.env.MB_HOST || 'localhost';

/**
 * GETs a testdouble for a given port.
 * @param {object} testDouble The definition of the testdouble. 
 */
function getTestDouble(testDouble, reply)
{
	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters/' + testDouble.port,
		method: 'GET'
	};

	var getRequest = http.request(options, function(res) {

		res.setEncoding('utf8');
		var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			data = JSON.parse(data);
			data.host = res.socket._host;

			var object = 
			{
				"contents": JSON.stringify(data, null, 4),
				"path": __dirname + '/../../testdoubles/' + data.name + '.json'
			};

			utils.save(object, 'file');
			utils.sendFailureReply(reply, "resource conflict", "testdouble already exists");
		});

		res.on('error', function(error) {
			utils.logger.error('  could not save updated testdouble because of problems in get request, saving older definition: ' + error.message);

			var object = 
			{
				"contents": JSON.stringify(testDouble, null,4),
				"path": __dirname + '/../../testdoubles/' + testDouble.name + '.json',
			};

			utils.save(object, 'file');
			utils.sendFailureReply(reply, "resource conflict", "testdouble already exists");
		});
	});

	getRequest.end();

	getRequest.on('error', function(error) {
		utils.logger.error('  could not save updated testdouble because of problems in get request, saving older definition: ' + error.message);

		var object = 
		{
			"contents": JSON.stringify(testDouble, null,4),
			"path": __dirname + '/../../testdoubles/' + testDouble.name + '.json',
		};

		utils.save(object, 'file');
		utils.sendFailureReply(reply, "resource conflict", "testdouble already exists");
	});
}

/**
 * Creates a testdouble, and the request parameters has an optional parameter for the protocol.
 * @param {Object} request The request object that is passed by Hapi.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function createHandler(request, reply)
{	
	utils.logger.debug('Entering create handler, Begin request POST /testdoubles');

	var testDoubleDefinition = request.payload;

	if(!testDoubleDefinition.hasOwnProperty('name'))
	{
		utils.sendFailureReply(reply, "bad data", "missing name");
		utils.logger.debug('  No name for testdouble, exiting from create handler');
		return;
	}	

	else
	{
		var testDouble = utils.getTestDoubleDefinition(request.payload.name);

		if(!testDoubleDefinition.hasOwnProperty('protocol'))
		{
			testDoubleDefinition.protocol = "http";
		}

		utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' path: ' + request.path);
		utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' method: ' + request.method);
		utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' port: ' + testDoubleDefinition.port);
		utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' headers: ' + JSON.stringify(request.headers, null, 4));	
		utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' payload: ' + JSON.stringify(request.payload, null, 4));	

		if(request.info.remoteAddress !== '127.0.0.1' && testDoubleDefinition.port === undefined)
		{
			utils.logger.debug('  client IP not 127.0.0.1 and testdouble definition port is undefined, therefore setting to 5051');
			testDoubleDefinition.port = 5051;
		}

		var options = {
			hostname: mbHost,
			port: mbPort,
			path: '/imposters/' + '?replayable=true',
			method: 'GET'
		};

		//queries mb to check if the testdouble exists
		var checkTestDoubleExistsRequest = http.request(options, function(res) {

			res.setEncoding('utf8');
			var data = '';

			res.on('data', function(body) {
				data += body;
			});

			res.on('end', function() {

				utils.logger.info('[' + testDoubleDefinition.name + ']' + '  made initial request to check if testdouble exists');
				utils.logger.debug('[' + testDoubleDefinition.name + ']' + '  data from mb: ' + data);
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
				utils.logger.debug('[' + testDoubleDefinition.name + ']' + ' portIndex from createTestDouble: ' + portIndex);

				//if mb has a testdouble
				if(exists)
				{
					//exists and local testdouble is also undefined, make another get request to save the latest data
					if(testDouble === undefined)
					{
						utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' imposter before making final request '  + JSON.stringify(imposters[portIndex]));
						getTestDouble(data.imposters[portIndex], reply);
					}

					//exists and local testdouble also exists, send failure reply
					else
					{
						utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' An existing testdouble definition found, exiting create handler');
						utils.sendFailureReply(reply, "resource conflict", "testdouble already exists");
					}
				}

				//mb does not have a testdouble
				else
				{
					//if !exists and local testdouble is also not undefined
					if(testDouble !== undefined)
					{
						utils.remove(__dirname + '/../../testdoubles/' + testDoubleDefinition.name + '.json');
						utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' inconsistent state in create, does not exist in mb, but exists in td, deleting local file');
					}

					utils.logger.debug('  [' + testDoubleDefinition.name + ']' + ' mountebank input: ' + JSON.stringify(testDoubleDefinition, null, 4));
					requests.postRequest(testDoubleDefinition, reply);
				}
			});

			res.on('error', function(error) {
				utils.logger.error('  could not create testdouble because of problems in checking if testdoubles exist response: ' + error.message);
				utils.sendFailureReply(reply, "bad response", "could not create testdouble because of problems in response: " + error.message);
			});
		});

		checkTestDoubleExistsRequest.end();

		checkTestDoubleExistsRequest.on('error', function(error) {
			utils.logger.error('  could not create testdouble because of problems in checking if testdoubles exist request: ' + error.message);
			utils.sendFailureReply(reply, "bad request",  "could not create testdouble because of problems in request: "  + error.message);			
		});
	}
}

module.exports = {
	createHandler: createHandler
};