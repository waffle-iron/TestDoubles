var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');

var tdPort = process.env.TD_PORT || 5050;

//test suite for POST /testdoubles/{testDoubleName}/proxy API
describe('POST /testdoubles/{testDoubleName}/proxy', function() {

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

	// 1) create a proxy when a service is given in the payload, but first create td
	it('should create a proxy for the service', function(done) {

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
			}, function(error, response, body) {

				mbtestDoublePort = body.port;
				var file = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8'));

				assert.deepEqual(body, file, 'proxy should be created');
				assert.equal(body.stubs[0].responses[0].proxy.to, file.stubs[0].responses[0].proxy.to, 'service host should be the same');

				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	
				done();
			});
		});
	});

	// 2) create a proxy even if the local testdouble does not exist
	it('should create a proxy for the service even if a local testdouble is present', function(done) {

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
			}, function(error, response, body) {

				mbtestDoublePort = body.port;
				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
				var port = body.port;

			    request({
					url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
					method: 'POST',
					json: {	
						serviceHost: serviceHost
					}
				}, function(error, response, body) {

					var file = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8'));

					assert.deepEqual(body, file, 'proxy should be created');
					assert.equal(body.stubs[0].responses[0].proxy.to, file.stubs[0].responses[0].proxy.to, 'service host should be the same');
					assert.equal(body.port, port, 'ports should be the same');
					fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	
					done();
				});
			});
		});
	});

	// 3) don't create a proxy when a service is not given
	it('should not create a proxy for the service if service host is undefined', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function(error, response, body) {

			mbtestDoublePort = body.port;

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
				method: 'POST',
				json: {}
			}, function(error, response, body) {

				assert.equal(body.errors[0].message, 'service host is required', 'service host should be passed when creating proxy');
				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');	

				done();
			});
		});
	});

	// 4) don't create a proxy if the testdouble doesn't exist
	it('should not create a proxy if the testdouble does not exist', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles/' + testDoubleName + '/proxy',
			method: 'POST',
			json: {
				serviceHost: serviceHost
			}
		}, function(error, response, body) {

			assert.equal(body.errors[0].message, 'testdouble does not exist', 'testdouble should exist before creating proxy');
			done();
		});
	});
});