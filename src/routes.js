//import controllers
var getAllTestDoubles = require('./controllers/GetAllTestDoubles.js');
var createTestDouble = require('./controllers/CreateTestDouble.js');
var getTestDoubleDefinition = require('./controllers/GetTestDoubleDefinition.js');

var createRecordProxy = require('./controllers/CreateRecordProxy.js');
var deleteRecordProxy = require('./controllers/DeleteRecordProxy.js');

var deleteAll = require('./controllers/DeleteAllTestDoubles.js');
var deleteTestDouble = require('./controllers/DeleteTestDouble.js');
var recreateTestDouble = require('./controllers/RecreateTestDouble.js');

var packageFile = require('../package.json');

module.exports = function() {

	return [
		{
			method: "GET",
			path: "/site/{fileName*}",
			handler: {
				directory: {
					path: './site',
					listing: false,
					index: true
				}
			}
		},

		{
			method: "GET",
			path: "/{fileName*}",
			handler: function(request, reply) {

				var userAgent = request.headers['user-agent'];

				//request is coming from curl
				if(userAgent.substring(0,4) === 'curl')
				{
					//if file is specified, return that file
					if(request.params.hasOwnProperty('fileName'))
					{
						reply.file(request.params.fileName);
					}

					//otherwise return the readme file
					else
					{
						var server = require('../bin/tdctl');
						
						var string = '\n' + 
						'TestDoubles ' + packageFile.version + ' running at ' + server.info.uri  + 
						'\n' + 
						'\n' +
						'Running with process id: ' + process.pid + 
						'\n' + 
						'\n' +
						'TestDoubles is a "Test Double" framework that mimics a service by acting as an intermediate agent between a client and the actual service. It can also act as a proxy and record the interactions between the client and the service. Once these interactions are recorded, they can be replayed to mimic the behavior of the actual service. Each service that is made by the tester or client is considered to be a testdouble. TestDoubles is intended to treat the middleware integration platforms such as MuleSoft, Oracle, Boomi, Informatica, JitterBit, snapLogic and others as the "System Under Test", bringing the concept of Continuous Testing to the EAI world.' + 
						'\n' + 
						'\n' + 
						'Getting started with TestDoubles: ' + 
						'\n' + 
						'\n' + 
						'Execute the following command to install the TestDoubles CLI' + 
						'\n' + 
						'$  curl -s http://localhost:5050/install.sh | TD_HOST="http://localhost:5050" sh' +
						'\n' + 
						'Refer to documentation at ' + server.info.uri + 
						'\n' + 
						'\n';

						reply(string);
					}
				}

				//request is not coming from curl
				else
				{
					reply.redirect('/site');
				}
			}
		},

		{
			method: "GET",
			path: "/testdoubles",
			handler: getAllTestDoubles.getAllHandler
		},

		{
			method: "GET",
			path: "/testdoubles/{testDoubleName}",
			handler: getTestDoubleDefinition.getTestDoubleHandler
		},

		{
			method: "POST",
			path: "/testdoubles",
			handler: createTestDouble.createHandler
		},

		{
			method: "POST",
			path: "/testdoubles/{testDoubleName}/proxy",
			handler: createRecordProxy.createProxyHandler
		},
		
		{
			method: "DELETE",
			path: "/testdoubles/{testDoubleName}/proxy",
			handler: deleteRecordProxy.deleteRecordHandler
		},
		
		{
			method: "DELETE",
			path: "/testdoubles",
			handler: deleteAll.deleteAllHandler
		},
		
		{
			method: "DELETE",
			path: "/testdoubles/{testDoubleName}",
			handler: deleteTestDouble.deleteTestDoubleHandler
		},
		
		{
			method: "PUT",
			path: "/testdoubles",
			handler: recreateTestDouble.recreateHandler
		}
	];
}();