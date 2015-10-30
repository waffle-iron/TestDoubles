var assert = require('chai').assert;
var request = require('request');

var tdPort = process.env.TD_PORT || 5050;

//test suite for GET /testdoubles/{testDoubleName} API
describe('GET /testdoubles/{testDoubleName}', function() {

	var testDoubleName = "test";

	afterEach(function(done) {

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE'
			}, function(error, response, body) {
				done();
		});
	});

	// 1) creates and gets a testdouble
	it('should get a testdouble', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function(error, response, body) {

			var data = body;

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
				method: 'GET',
				json: {}
			}, function(error, response, body) {

				assert.deepEqual(body, data, 'testdouble should exist');
				done();
			});
		});
	});

	// 2) tries to get a testdouble that does not exist
	it('should not get a testdouble if it does not exist', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
			method: 'GET',
			json: {}
		}, function(error, response, body) {

			assert.equal(body.errors[0].message, 'testdouble does not exist', 'testdouble should not exist');
			done();
		});
	});
});	