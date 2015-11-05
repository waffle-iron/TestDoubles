var http = require('http');
var utils = require('./utils.js');
var mbPort = process.env.MB_PORT || 2525;
var mbHost = process.env.MB_HOST || 'localhost';

/**
 * Retrieves a static object for HTTP DELETE request options. 
 * @param  {Object} testDoubleDefinition The testdouble definition that contains the port for the delete options.
 * @return {Object} The DELETE options for the HTTP request.
 */
function populateDeleteOptions(testDoubleDefinition)
{
	return {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters/' + testDoubleDefinition.port,
		method: 'DELETE',
		headers: {}
	};
}

/**
 * GETs a testdouble, but without proxies and requests array.
 * @param {Object} testDoubleDefinition The definition of the testdouble
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getRequest(testDoubleDefinition, reply)
{
	utils.logger.debug('  port before getting: ' + testDoubleDefinition.port);
	utils.logger.info('[' + testDoubleDefinition.name + ']' + '  getting testdouble');

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters/' + testDoubleDefinition.port + '?replayable=true&removeProxies=true',
		method: 'GET'
	};	

	var getReq = http.request(options, function(res) {
		res.setEncoding('utf8');
		var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			data = JSON.parse(data);

			if(data.hasOwnProperty('errors'))
			{
				utils.sendFailureReply(reply, "missing resource", "testdouble does not exist");
				utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
			}

			else
			{
				deleteRequest(data, reply);
			}
		});

		//if request has errors, send a failure response, but keep everything as is
		res.on('error', function(error) {
			utils.logger.error('could not delete proxy because of problems in get response:  ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not create proxy because of problems in get response: " + error.message);
		});
	});

	getReq.end();

	getReq.on('error', function(error) {
		utils.logger.error('could not delete proxy because of problems in get request:  ' + error.message);
		utils.sendFailureReply(reply, "bad request", "could not create testdouble because of problems in get request: " + error.message);
	});
}

/**
 * POSTs a testdouble with the given definition.
 * @param {Object} testDoubleDefinition The definition of the testdouble.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client. The response object 
 * consists of the port and the success status.
 */
function postRequest(testDoubleDefinition, reply)
{
	utils.logger.debug('  port before posting: ' + testDoubleDefinition.port);
	utils.logger.debug('  testDoubleDefinition before posting: ' + JSON.stringify(testDoubleDefinition, null, 4));

	var testDoubleDefString = JSON.stringify(testDoubleDefinition, null, 4);
	utils.logger.debug('  length of string before posting: ' + testDoubleDefString.length);
	utils.logger.debug('  buffer length before posting: ' + Buffer.byteLength(testDoubleDefString));
	
	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	var req = http.request(options, function(res) {
	    utils.logger.debug('[' + testDoubleDefinition.name + ']' + '  status code inside of postRequest(): ' + res.statusCode);
	    utils.logger.debug('[' + testDoubleDefinition.name + ']' + '  response headers inside of postRequest(): ' + JSON.stringify(res.headers));
	    res.setEncoding('utf8');

	    var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {
		 
			if(res.statusCode !== 201)
			{
				reply(data);

				utils.logger.info('[' + testDoubleDefinition.name + '] ' + 'Could not create testdouble because of errors: ' + data);
				utils.logger.info('\n');
			}

			else
			{	
				data = JSON.parse(data);
			 	data.host = res.socket._host;

			  	utils.logger.info('[' + data.name + ']' + '  testdouble port for ' + '\'' + data.name + '\'' + ' is ' + data.port);
				var testDoubleName = data.name;
				data = JSON.stringify(data, null , 4);

				var object = 
				{
					"contents": data,
					"path": __dirname + '/../testdoubles/' + testDoubleName + '.json',
				};

				utils.save(object, 'file');
		
				reply(data);

				utils.logger.info('[' + testDoubleName + '] ' + 'End request successfully created testdouble');
				utils.logger.info('\n');
			}
	 	});

		//if response has errors, send a failure response, and delete testdouble definition file
	 	res.on('error', function(error) {
	 		utils.logger.error('could not create testdouble because of problems in post response: ' + error.message);
	 		utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
	 		utils.sendFailureReply(reply, "bad response", "could not create testdouble because of problems in post response: " + error.message);
	 	});
	});
	
	req.write(testDoubleDefString);
	req.end();

	//if request has errors, send a failure response, and delete testdouble definition file
	req.on('error', function(error) {
		utils.logger.error('could not create testdouble because of problems in post request:  ' + error.message);
		utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
		utils.sendFailureReply(reply, "bad request", "could not create testdouble because of problems in post request: " + error.message);
	});
}

/**
 * DELETEs the testdouble, and in the callback, recreates the testdouble.
 * @param {Object} testDoubleDefinition The testdouble's definition object consisting of the necessary information to delete the testdouble.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function deleteRequest(testDoubleDefinition, reply)
{
	utils.logger.debug('  port before deleting: ' + testDoubleDefinition.port);
	utils.logger.debug('  testDoubleDefinition before deleting: ' + JSON.stringify(testDoubleDefinition, null, 4));

	var deleteOptions = populateDeleteOptions(testDoubleDefinition);

	var deleteReq = http.request(deleteOptions, function(res) {

		res.setEncoding('utf8');
		var data = '';

		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			data = JSON.parse(data);

			if(Object.keys(data).length === 0)
			{
				utils.sendFailureReply(reply, "missing resource", "testdouble does not exist");
				utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
			}

			else
			{
				utils.logger.info('[' + testDoubleDefinition.name + ']' + '  deleted testdouble, recreating');
				postRequest(testDoubleDefinition, reply);
			}
		});

		//if request has errors, send a failure response, and delete testdouble definition file
		res.on('error', function(error) {
			utils.logger.error('could not create proxy because of problems in delete response:  ' + error.message);
			utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
			utils.sendFailureReply(reply, "bad response", "could not create proxy because of problems in delete response: " + error.message);
		});
	});
	
	deleteReq.end();

	//if request has errors, send a failure response, and delete testdouble definition file
	deleteReq.on('error', function(error) {
		utils.logger.error('could not create proxy because of problems in delete request:  ' + error.message);

		var object = 
		{
			"contents": JSON.stringify(testDoubleDefinition, null,4),
			"path": __dirname + '/../../testdoubles/' + testDoubleDefinition.name + '.json',
		};

		utils.save(object, 'file');
		utils.sendFailureReply(reply, "bad request", "could not create proxy because of problems in delete request: " + error.message);
	});
}

/**
 * DELETEs the testdouble and also the definition file.
 * @param {Object} testDoubleDefinition The definition of the testdouble.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function deleteTestDouble(testDoubleDefinition, reply)
{
	utils.logger.debug('  port before deleting testdouble: ' + testDoubleDefinition.port);

	var deleteOptions = populateDeleteOptions(testDoubleDefinition);

	var deleteRequest = http.request(deleteOptions, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {

			data = JSON.parse(data);

			//testdouble does not exist, also delete file
			if(Object.keys(data).length === 0)
			{
				utils.sendFailureReply(reply, "missing resource", "testdouble does not exist");
				utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
			}

			else
			{
				utils.logger.info('[' + testDoubleDefinition.name + ']' + '  deleted testdouble');

				var testDoublePath = __dirname + '/../testdoubles/' + data.name + '.json';
			
				utils.remove(testDoublePath, 'file');
				utils.logger.info('[' + testDoubleDefinition.name + ']' + '  removed definition file');
				utils.logger.info('[' + testDoubleDefinition.name + '] ' + 'End request successfully deleted testdouble');
				data.host = res.socket._host;
				reply(JSON.stringify(data, null, 4));
			}
		});

		//if request has errors, send a failure response, but keep everything as is
		res.on('error', function(error) {
			utils.logger.error('could not delete testdouble because of problems in delete testdouble response:  ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not delete testdouble because of problems in delete testdouble response: " + error.message);
		});
	});	

	deleteRequest.end();

	deleteRequest.on('error', function(error) {
		utils.logger.error('could not delete proxy because of problems in delete testdouble request:  ' + error.message);
		utils.sendFailureReply(reply, "bad request", "could not delete testdouble because of problems in delete testdouble request: " + error.message);
	});
}

/**
 * PUTs the definition of multiple testdoubles, and mass creates them.
 * @param {Object} testDoubleDefinition The definition of multiple testdoubles.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function putRequest(testDoubleDefinition, reply)
{
	utils.logger.debug('  entered putRequest() with definition: ' + JSON.stringify(testDoubleDefinition, null, 4));

	var portsList = [];

	for (var index = 0; index < testDoubleDefinition.imposters.length; index++) 
	{
		portsList.push(testDoubleDefinition.imposters[index].port);
	}

	var testDoubleDefString = JSON.stringify(testDoubleDefinition, null, 4);
	utils.logger.debug('  length of string before posting: ' + testDoubleDefString.length);
	utils.logger.debug('  buffer length before posting: ' + Buffer.byteLength(testDoubleDefString));

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters',
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	var req = http.request(options, function(res) {

		res.setEncoding('utf8');
	    var response = '';

		res.on('data', function(body) {
			response += body;
		});

		res.on('end', function() {

			if(res.statusCode !== 200)
			{
				reply(response);
				utils.logger.info('  Could not mass create testdoubles because of errors: ' + response);
			}

			else
			{
				var getOptions = {
					hostname: mbHost,
					port: mbPort,
					path: '/imposters?replayable=true',
					method: 'GET'
				};

				utils.logger.debug('  sending GET /imposters request to get a list of testdoubles');

				http.get(getOptions, function(res) {

					res.setEncoding('utf8');
					var data = '';

					res.on('data', function(body) {
						data += body;
					});

					res.on('end', function() {
						utils.logger.debug('  made GET /imposters?replayable=true request');
						data = JSON.parse(data);

						data.host = res.socket._host;

					 	var imposters = data.imposters;

					 	for(var counter = 0; counter < portsList.length; counter++)
					 	{
					 		for(var index = 0; index < imposters.length; index++) 
						 	{
						 		if(portsList[counter] === imposters[index].port)
						 		{
						 			var object = 
									{
										"contents": JSON.stringify(imposters[index], null,4),
										"path": __dirname + '/../testdoubles/' + imposters[index].name + '.json',
									};

									utils.save(object, 'file');
						 		}
						 	}
					 	}

						reply(response);

						utils.logger.info('End PUT request successfully created all testdoubles');
						utils.logger.info('\n');
					});
				});
			}
		});
	});

	req.on('error', function(e) {
		utils.logger.error('There was a problem with request: ' + e.message);
	});
	
	req.write(testDoubleDefString);
	req.end();
}

/**
 * DELETEs all testdoubles and all definition files.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function deleteAllTestDoubles(reply)
{
	utils.logger.debug('  entered deleteAllTestDoubles');

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters',
		method: 'DELETE',
		headers: {}
	};

	var deleteRequest = http.request(options, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {
			data = JSON.parse(data);

			for(var index = 0; index < data.imposters.length; index++)
			{
				utils.remove(__dirname + '/../testdoubles/' + data.imposters[index].name + '.json', 'file');
			}

			//no testdoubles exist
			if(data.imposters.length === 0)
			{
				utils.sendFailureReply(reply, "missing resource", "no testdoubles exist");
			}

			//there are some testdoubles
			else
			{
				reply(JSON.stringify(data, null, 4));
			}
		});

		//if request has errors, send a failure response, but keep everything as is
		res.on('error', function(error) {
			utils.logger.error('could not delete testdoubles because of problems in delete testdoubles response:  ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not delete testdouble because of problems in delete testdoubles response: " + error.message);
		});
	});

	deleteRequest.end();

	deleteRequest.on('error', function(error) {
		utils.logger.error('could not delete testdoubles because of problems in delete testdoubles request:  ' + error.message);
		utils.sendFailureReply(reply, "bad request", "could not delete testdoubles because of problems in delete testdoubles request: " + error.message);
	});
}

/**
 * GETs all testdoubles and all definition files.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getAllTestDoubles(reply)
{
	utils.logger.debug('  entered getAllTestDoubles');

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters' + '?replayable=true',
		method: 'GET',
		headers: {}
	};

	var getRequest = http.request(options, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {
			data = JSON.parse(data);

			//no testdoubles exist
			if(data.imposters.length === 0)
			{
				utils.removeAll(__dirname + '/../testdoubles/');
				utils.sendFailureReply(reply, "missing resource", "no testdoubles exist");
			}

			//there are some testdoubles that dont exist in mb from the filesystem
			else
			{
				var testDoubles = [];
				var localTestDoubles = utils.cleanFiles();

				for(var index = 0; index < data.imposters.length; index++)
				{
					testDoubles.push(data.imposters[index].name);
				}

				var toDelete = utils.arrayDiff(localTestDoubles, testDoubles);
 
				for(var key = 0; key < toDelete.length; key++)
				{
					utils.remove(__dirname + '/../testdoubles/' + toDelete[key] + '.json', 'file');
				}

				reply(JSON.stringify(data, null, 4));
			}
		});

		//if request has errors, send a failure response, but keep everything as is
		res.on('error', function(error) {
			utils.logger.error('could not get testdoubles because of problems in get testdoubles response:  ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not get testdouble because of problems in get testdoubles response: " + error.message);
		});
	});

	getRequest.end();

	getRequest.on('error', function(error) {
		utils.logger.error('could not get testdoubles because of problems in get testdoubles request:  ' + error.message);
		utils.sendFailureReply(reply, "bad request", "could not get testdoubles because of problems in get testdoubles request: " + error.message);
	});
}

/**
 * GETs a single testdouble.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getTestDouble(testDoubleDefinition, reply)
{
	utils.logger.debug('  entered getTestDouble');

	var options = {
		hostname: mbHost,
		port: mbPort,
		path: '/imposters/' + testDoubleDefinition.port,
		method: 'GET',
		headers: {}
	};

	var getRequest = http.request(options, function(res) {
		res.setEncoding('utf8');

		var data = '';
		res.on('data', function(body) {
			data += body;
		});

		res.on('end', function() {
			data = JSON.parse(data);

			//testdouble does not exist
			if(data.hasOwnProperty('errors'))
			{
				utils.sendFailureReply(reply, "missing resource",  "testdouble does not exist");
				utils.remove(__dirname + '/../testdoubles/' + testDoubleDefinition.name + '.json');
			}

			//testdouble does exist
			else
			{
				data.host = res.socket._host;

				var object = 
				{
					"contents": JSON.stringify(data, null, 4),
					"path": __dirname + '/../testdoubles/' + data.name + '.json',
				};

				utils.save(object, 'file');
		
				reply(JSON.stringify(data, null, 4));
			}
		});

		//if request has errors, send a failure response, but keep everything as is
		res.on('error', function(error) {
			utils.logger.error('could not get testdouble because of problems in get testdoubles response:  ' + error.message);
			utils.sendFailureReply(reply, "bad response", "could not get testdouble because of problems in get testdouble response: " + error.message);
		});
	});

	getRequest.end();

	getRequest.on('error', function(error) {
		utils.logger.error('could not get testdouble because of problems in get testdouble request:  ' + error.message);
		utils.sendFailureReply(reply, "bad request", "could not get testdouble because of problems in get testdouble request: " + error.message);
	});
}

module.exports = {
	postRequest: postRequest,
	deleteRequest: deleteRequest,
	deleteTestDouble: deleteTestDouble,
	getRequest: getRequest,
	putRequest: putRequest,
	deleteAllTestDoubles: deleteAllTestDoubles,
	getAllTestDoubles: getAllTestDoubles,
	getTestDouble: getTestDouble
};