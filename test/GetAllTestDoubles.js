var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');

var tdPort = process.env.TD_PORT || 5050;

//test suite for GET /testdoubles API
describe('GET /testdoubles', function() {

	var testDoubleName = "test";
	var ports = [];
	
	afterEach(function(done) {

		request({
				url: 'http://localhost:'+ tdPort + '/testdoubles',
				method: 'DELETE'
			}, function(error, response, body) {
				ports = [];
				done();
		});
	});

	// 1) retrieve all the testdoubles that exist
	it('should get all testdoubles', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function(error, response, body) {

			ports.push(body.port);

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'POST',
				json: {	
					name: testDoubleName + '1'
				}
			}, function(error, response, body) {

				ports.push(body.port);

				request({
					url: 'http://localhost:' + tdPort + '/testdoubles',
					method: 'GET',
					json: {}
				}, function(error, response, body) {

					assert.equal(body.imposters.length, ports.length, 'number of testdoubles should be the same as created');
					fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
					fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '1' + '.json');		
					done();
				});
			});
		});
	});


	//2) retrieve an empty array if no testdoubles exist
	it('should get nothing if no testdoubles exist', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'GET',
			json: {}
		}, function(error, response, body) {
				assert.equal(body.errors[0].message, 'no testdoubles exist', 'testdouble should not be deleted if it does not exist');
				done();		
		});
	});
});