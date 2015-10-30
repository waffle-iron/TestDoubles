var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');
var utils = require('../src/utils.js');

var tdPort = process.env.TD_PORT || 5050;

//test suite for POST /testdoubles API
describe("POST /testdoubles", function() {

	var testDoubleName = "test";
	var mbtestDoublePort = 0;

	//execute after every test case is finished
	afterEach(function(done) {

		request({
				url: 'http://localhost:'+ tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE'
			}, function(error, response, body) {
				done();
		});
	});

	//execute once after all test cases are finished
	after(function(done) {

		try 
		{
			fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
		}

		catch(error){}
		
		done();
	});

	// // 1) create a testdouble with name
	it('should create a testdouble with name', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {	
				name: testDoubleName
			}
		}, function(error, response, body) {

			mbtestDoublePort = body.port;
			var file = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8'));
			
			assert.equal(body.port, file.port, 'ports are the same');
			fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
			done();
		});
	});

	// 2) given an entire testdouble definition that is mb compatible, check if testdouble is created
	it('should create a testdouble with the entire definition', function(done) {
		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				protocol: "http",
				port: 50000,
				name: testDoubleName,
				requests: [],
				stubs: [],
				_links: {
    			self: {
      				"href": "http://localhost:" + 2525 + "/imposters/50000"
   					}
  				}
			}
		}, function(error, response, body) {
			mbtestDoublePort = body.port;
			var file = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8'));

			assert.equal(body.port, file.port, 'ports are the same');
			fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
			done();
		});
	});


	// 3) testdouble should be created if it doesn't exist on mb, but exists on td. The local td should be deleted
	it('should create a testdouble if it does not exist, and delete local', function(done) {

		var object = 
		{
			protocol: "http",
			port: 5052,
			name: testDoubleName,
			requests: [],
			stubs: [],
			_links: {
			self: {
				"href": "http://localhost:" + 2525 + "/imposters/5052"
				}
			}
		}

		fs.writeFileSync(__dirname + '/../' + testDoubleName + '.json', JSON.stringify(object, null, 4));
		var testDouble = JSON.parse(fs.readFileSync(__dirname + '/../' + testDoubleName + '.json', 'utf8').toString());

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				"name": testDoubleName,
				"protocol": "http"
			}
		}, function(error, response, body) {

			mbtestDoublePort = body.port;

			request({
				url: 'http://localhost:'+ tdPort + '/testdoubles/' + testDoubleName,
				method: 'DELETE'
			}, function(error, response, body) {

				request({
					url: 'http://localhost:' + tdPort + '/testdoubles',
					method: 'POST',
					json: {
						"name": testDoubleName,
						"protocol": "http"
					}
				}, function(error, response, body) {

					mbtestDoublePort = body.port;
					var testDouble2 = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8').toString());
					assert.notEqual(testDouble2.port, testDouble.port, 'testdouble should be different from local');
					fs.unlinkSync(__dirname + '/../' + testDoubleName + '.json');
					done();
				});
			});
		});
	});

	// 4) should not create a testdouble without name
	it('should not create a testdouble without name', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				protocol: "http"
			}
		}, function(error, response, body) {

			assert.equal(body.errors[0].message, 'missing name', 'testdouble needs name');
			done();
		});
	});

	// 5) should not create a testdouble with an invalid port
	it('should not create a testdouble with an invalid port', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				name: testDoubleName,
				port: -1000
			}
		}, function(error, response, body) {

			assert.equal(body.errors[0].message, "invalid value for 'port'", 'port must be valid');
			done();
		});
	});

	// 6) should not create a testdouble with an invalid protocol
	it('should not create a testdouble with an invalid protocol', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				name: testDoubleName,
				protocol: "test",
				port: 25000
			}
		}, function(error, response, body) {
			assert.equal(body.errors[0].message, "the test protocol is not yet supported", 'protocol must be valid');
			done();
		});
	});

	// 7) testdouble should not be created twice, executed by first creating and then checking the response after recreating
	it('should not create a testdouble twice', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				"name": testDoubleName,
			}
		}, function(error, response, body) {

			mbtestDoublePort = body.port;

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'POST',
				json: {
					"name": testDoubleName
				}
			}, function(error, response, body) {

				assert.equal(body.errors[0].message, 'testdouble already exists', 'testdouble cannot be created twice');
				done();
			});
		});
	});

	// 8) testdouble should not be created if it exists on mb, but not on td. The local td file should be created.
	it('should not create testdouble if exists, but if local testdouble does not exist, create the file', function(done) {

		request({
			url: 'http://localhost:' + tdPort + '/testdoubles',
			method: 'POST',
			json: {
				"name": testDoubleName,
			}
		}, function(error, response, body) {

			mbtestDoublePort = body.port;
			var port = body.port;
			fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');

			request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'POST',
				json: {
					"name": testDoubleName
				}
			}, function(error, response, body) {

				var exists = utils.checkFileExists(__dirname + '/../testdoubles/' + testDoubleName + '.json');
				assert.equal(exists, true, 'file must be recreated locally if testdouble exists');
				done();
			});
		});
	});
});