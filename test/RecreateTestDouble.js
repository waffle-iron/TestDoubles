var assert = require('chai').assert;
var fs = require('fs');
var request = require('request');
var utils = require('../src/utils.js');

var tdPort = process.env.TD_PORT || 5050;

//test suite for PUT /testdoubles API
describe('PUT /imposters', function() {

	var testDoubleName = "test";

	afterEach(function(done) {

		request({
				url: 'http://localhost:'+ tdPort + '/testDoubles',
				method: 'DELETE'
			}, function(error, response, body) {
				done();
		});
	});

	// 1) mass create testdoubles
	it('should mass-create testdoubles', function(done) {

		var data = 
		{
			"imposters": [
		    {
		      "protocol": "http",
		      "port": 5051,
		      "name": testDoubleName + "1",
		      "requests": [],
		      "stubs": [],
		      "_links": {
		        "self": {
		          "href": "http://localhost:" + 2525 + "/imposters/51277"
		        }
		      },
		      "host": "localhost"
		    },
		    {
		      "protocol": "http",
		      "port": 5052,
		      "name": testDoubleName,
		      "requests": [],
		      "stubs": [],
		      "_links": {
		        "self": {
		          "href": "http://localhost:" + 2525 + "/imposters/51279"
		        }
		      },
		      "host": "localhost"
		    }
	  	]};

	  	var ports = [];
	  	ports.push(5051);
	  	ports.push(5052);

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'PUT',
				json: data
			}, function(error, response, body) {

				assert.equal(body.imposters.length, ports.length, 'number of testdoubles should be the same as created');
				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '.json');
				fs.unlinkSync(__dirname + '/../testdoubles/' + testDoubleName + '1' + '.json');		
				done();
		});
	});

	// 2) if atleast one testdouble does not have a name, reject the whole thing
	it('should not mass-create testdoubles if one is missing a name' , function(done) {

		var data = 
		{
			"imposters": [
		    {
		      "protocol": "http",
		      "port": 5051,
		      "requests": [],
		      "stubs": [],
		      "_links": {
		        "self": {
		          "href": "http://localhost:" + 2525 + "/imposters/51277"
		        }
		      },
		      "host": "localhost"
		    },
		    {
		      "protocol": "http",
		      "port": 5052,
		      "requests": [],
		      "stubs": [],
		      "_links": {
		        "self": {
		          "href": "http://localhost:" + 2525 + "/imposters/51279"
		        }
		      },
		      "host": "localhost"
		    }
	  	]};

  		var ports = [];
	  	ports.push(5051);
	  	ports.push(5052);

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'PUT',
				json: data
			}, function(error, response, body) {

				assert.equal(body.errors[0].message, 'all testdoubles must have a name', 'cannot mass-create if any testdouble is missing a name');
				done();
		});
	});

	// 3) If the imposters key is not present in the data, reject the whole thing
	it('should not mass-create testdoubles if imposters key is not present', function(done) {
		var data = {};

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'PUT',
				json: data
			}, function(error, response, body) {

				assert.equal(body.errors[0].message, 'must provide a list of testdoubles', 'cannot mass-create if any testdouble is missing a name');
				done();
		});
	});

	// 4) If imposters is an empty array, check that the input equals the output
	it('should not create any testdoubles if input is empty' , function(done) {

		var data = 
		{
			"imposters": []
		};

		request({
				url: 'http://localhost:' + tdPort + '/testdoubles',
				method: 'PUT',
				json: data
			}, function(error, response, body) {

				assert.equal(utils.getTestDoubleDefinition(""), undefined, 'testdouble should not exist');
				assert.deepEqual(body, data, 'empty inputs should equal empty outputs');
				done();
		});
	});
});