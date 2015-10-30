var assert = require('chai').assert;
var request = require('request');
var fs = require('fs');
var tdPort = process.env.TD_PORT || 5050;
var exec = require('child_process').exec;

var testDoubleName = "test";
var serviceHost = "http://maps.googleapis.com";
var mbPort = 0;

/**
 * Runs the scalability tests by calling the scale.sh script to send requests to the API (Google Maps).
 * The loop runs from -180 to 180, inclusive, but with the specified incrementor.
 * Creates the necessary setup such as creating a testdouble, creating proxy, recording, removing proxy, and deleting the testdouble.
 * @param {Integer} incrementor The incrementor by which the scalability tests will run.
 * @param {Function} done The asynchronous function that is called once the tests are finished.
 */
function runScalabilityTests(incrementor, done)
{
	request({
		url: 'http://localhost:' + tdPort + '/testdoubles',
		method: 'POST',
		json: {	
			name: testDoubleName
		}
	}, function(error, response, body) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
			method: 'POST',
			json: {	
				serviceHost: serviceHost
			}
		}, function(error, response, body) {

			mbPort = body.port;

			//to print the contents of the exec statement, write console.log(stdout) after the if
			exec('./scale.sh ' + mbPort + ' ' + incrementor, function(error, stdout, stderr) {
				
				if(error !== null) {
					console.log("error is: " + error);
				}

				request({
					url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
					method: 'DELETE',
					json: {}					
				}, function(error, response, body) {

					request({
						url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
						method: 'DELETE',
						json: {}					
					}, function(error, response, body) {

						var expectedOutcome = body;
						expectedOutcome.requests = [];
						fs.writeFileSync(__dirname + '/../test.json', JSON.stringify(expectedOutcome, null, 4));

						request({
							url: 'http://localhost:' + tdPort + '/testdoubles',
							method: 'POST',
							json: expectedOutcome
						}, function(error, response, body) {

							assert.deepEqual(body, expectedOutcome, 'the whole testdouble should be created');
							done();
						});
					});	
				});
			});
		});
	});
}	

//test suite for scaling the API to simulate the actual recording process
describe('Scalability test', function() {

	//sets default timeout to 0, which means that mocha will not wait for the default time of 2 seconds, but instead
	//wait until the entire operation is finished
	this.timeout(0);

	afterEach(function(done) {

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE'
			}, function(error, response, body) {
				done();
		});
	});

	// 1) scalablity test of 37 records, incrementor is 10 between -180 and 180
	it('scaling to a range of 37', function(done) {
		runScalabilityTests(10, done);
	});
});
