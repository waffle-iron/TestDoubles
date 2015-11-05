var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');

var tdPort = process.env.TD_PORT || 5050;

//test suite for DELETE /testdoubles/{testDoubleName}/proxy API
describe('DELETE /testdoubles/{testDoubleName}/proxy', function() {

	var testDoubleName = "test";
	var serviceHost = "http://maps.googleapis.com";
	var mbtestDoublePort = 0;

	afterEach(function(done) {

		request({
				url: 'http://localhost:'+ tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE'
			}, function() {
				done();
		});
	});

	// 1) remove the proxy 
	it('should remove proxy if testdouble exists', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function() {

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
				method: 'POST',
				json: {	
					serviceHost: serviceHost
				}
			}, function() {

				request({
					url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
					method: 'DELETE',
					json: {}
				}, function(error, response, body) {

					mbtestDoublePort = body.port;
					var file = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8'));
					assert.deepEqual(body, file, 'proxy should not be present');
					assert.deepEqual(body.stubs, file.stubs, 'stubs should be empty');

					fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	
					done();
				});
			});
		});
	});

	// 2) don't remove the proxy if testdouble doesn't exist 
	it('should not remove if testdouble does not exist', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
			method: 'DELETE',
			json: {}
		}, function(error, response, body) {

			assert.equal(body.errors[0].message, 'testdouble does not exist', 'cannot remove proxy since testdouble does not exist');
			done();
		});
	
	});
});