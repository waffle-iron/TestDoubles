var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');
var utils = require('../src/utils.js');

var tdPort = process.env.TD_PORT || 5050;

//test suite for DELETE /testdoubles/{testDoubleName} API
describe('DELETE /testdoubles/{testDoubleName}', function() {

	var testDoubleName = "test";

	// 1) delete a testdouble with a given name
	it('should delete a testdouble with given a name', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function() {

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE',
				json: {}
			}, function() {

				assert.equal(utils.getTestDoubleDefinition(testDoubleName), undefined, 'testdouble should be undefined');

				try
				{
					fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	
				}

				catch(error)
				{
					assert.equal(error.code, 'ENOENT', 'testdouble must not exist');
				}

				done();
			});
		});
	});	

	// 2) do not delete a td that doesn't exist
	it('should not delete when the name doesnt match', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function() {

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + 'abcxyz',
				method: 'DELETE',
				json: {}
			}, function(error, response, body) {
				assert.equal(body.errors[0].message, 'testdouble does not exist', 'testdouble should not be deleted if it does not exist');
				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	
				done();
			});
		});
	});

	// 3) do not delete a td twice
	it('should not delete a testdouble twice', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function() {

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE',
				json: {}
			}, function() {
				
				request({
					url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName,
					method: 'DELETE',
					json: {}
				}, function(error, response, body) {
					assert.equal(body.errors[0].message, 'testdouble does not exist', 'testdouble should not be deleted if it does not exist');
					done();
				});
			});
		});
	});
});