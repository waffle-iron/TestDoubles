var assert = require('chai').assert;
var request = require('request');
var utils = require('../src/utils.js');

var tdPort = process.env.TD_PORT || 5050;

//test suite for DELETE /testdoubles API
describe('DELETE /testdoubles', function() {
	
	var testDoubleName = "test";

	//delete everything
	it('should delete all testdoubles', function(done) {
		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function() {

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'POST',
				json: {	
					name: testDoubleName + "1"
				}
			}, function() {

				request({
					url: 'http://localhost:' + tdPort + '/testdoubles',
					method: 'DELETE',
					json: {}
				}, function() {

					var testDoubles = utils.getAllTestDoubles();
					assert.deepEqual(testDoubles.imposters, [], 'no testdoubles should exist');
					done();
				});
			});
		});
	});

	//do not delete if nothing is present
	it('should not delete if testdoubles do not exist', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'DELETE',
			json: {}
		}, function(error, response, body) {

			var testDoubles = utils.getAllTestDoubles();
			assert.deepEqual(testDoubles.imposters, [], 'no testdoubles should exist');
			assert.equal(body.errors[0].message, 'no testdoubles exist', 'testdoubles should not be deleted');
			done();
		});
	});
});