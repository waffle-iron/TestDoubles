var fs = require('fs');
var logger = require(__dirname + '/./logger.js');

/**
 * Generic failure method used to send error messages to the client.
 * @param {Object} reply The Hapi reply object.
 * @param {String} message The error message to be sent inside the reply object.
 */
function sendFailureReply(reply, code, message)
{
	reply(JSON.stringify(
	{
		"errors": [
			{
				"code": code,
				"message": message
			}
		]
	}, null, 4));
}

/**
 * Retrieves the definition for a given testdouble.
 * @param {String} testDoubleName The name of the testdouble.
 * @return {Object} testDoubleDefinition The testdouble object.
 */
function getTestDoubleDefinition(testDoubleName)
{
	logger.debug('  entering getTestDoubleDefinition() with name: ' + testDoubleName);
	var testDoubleDefinition = {};

	if(!checkFileExists(__dirname + '/../testdoubles/' + testDoubleName + '.json'))
	{
		testDoubleDefinition = undefined;
		logger.debug('  testdouble is undefined');
	}

	else
	{
		testDoubleDefinition = JSON.parse(fs.readFileSync(__dirname + '/../testdoubles/' + testDoubleName + '.json', 'utf8').toString());
	}

	logger.debug('returning from getTestDoubleDefinition() with value: ' + JSON.stringify(testDoubleDefinition, null, 4));
	return testDoubleDefinition;
}

/**
 * Reads all the files inside a particular directory.
 * @param {String} folder The directory to read files from.
 * @return {Object} files An array of all files residing in the directory.
 */
function getFiles(folder)
{
	var files = fs.readdirSync(folder);
	return files;
}

/**
 * Copy file names that end with .json to a separate array.
 * @return {Object} files An array of files where each element contains a testdouble's name.
 */
function cleanFiles()
{
	var files = getFiles(__dirname + '/../testdoubles/');
	var jsonFiles = [];

	for(var index = 0; index < files.length; index++)
	{
		var length = files[index].length;

		if(files[index].substring(length - 5, length) === '.json')
		{
			files[index] = files[index].substring(0, length - 5);
			jsonFiles.push(files[index]);
		}
	}

	return jsonFiles;
}

/**
 * Retrieves the definition of all testdoubles.
 * @return {Object} testdoubles A single object consisting of all testdoubles.
 */
function getAllTestDoubles()
{
	logger.debug('  entering getAllTestDoubles() with no parameters');

	var testDoublesList = cleanFiles();
	var testDoubles = {};
	testDoubles.imposters = [];

	for (var index = 0; index < testDoublesList.length; index++) 
	{
		testDoubles.imposters.push(getTestDoubleDefinition(testDoublesList[index]));
	}

	logger.debug('  exiting getAllTestDoubles() with list: ' + JSON.stringify(testDoubles, null, 4));
	return testDoubles;
}

/**
 * Checks if a file exists.
 * @param {string} fileName The path to the filename.
 * @return {boolean} A boolean value of whether the file exists or not.
 */
function checkFileExists(fileName)
{
	logger.debug('  entering checkFileExists() with fileName: ' + fileName);

	try
	{
		fs.statSync(fileName);
		logger.debug('  returning from checkFileExists() with value: ' + 'true');
		return true;
	}
	
	catch(error)
	{
		logger.debug('  returning from checkFileExists() with value: ' + 'false');
		return false;
	}
}

/**
 * Persists the object into a storage medium such as a file system or database.
 * @param {Object} object The object containing the contents to be saved.
 * @param {string} medium The storage medium, which is either a file or database.
 */
function save(object, medium)
{
	logger.debug('  entering save() with object: ' + JSON.stringify(object, null, 4) + ' and medium: ' + medium);

	//try catch here in future, and also add return value
	if(medium === 'database')
	{
		//connect to db and save.
	}

	//file
	else
	{
		fs.writeFileSync(object.path, object.contents);
	}
}

/**
 * Removes an object from the given medium.
 * @param {Object} object To be removed from the medium.
 * @param {String} medium A medium for storing data such as a filesystem or database.
 */
function remove(testDouble, medium)
{
	//try catch here in future, and also add return value
	logger.debug('  entering remove() with testDouble: ' + testDouble + ' and medium: ' + medium);

	if(medium === 'database')
	{
		//connect to db and save.
	}

	//file
	else
	{
		logger.debug(' testDouble inside of name path: ' + JSON.stringify(testDouble, null, 4));

		if(checkFileExists(testDouble))
		{
			fs.unlinkSync(testDouble);
		}
	}
}

/**
 * Removes all files that end with .json for the given directory.
 * @param{String} folder The path to the directory
 */
function removeAll(folder)
{
	var files = fs.readdirSync(folder);

	for(var index = 0; index < files.length; index++)
	{
		var fileName = folder + files[index];

		var length = fileName.length;

		if(fileName.substring(length - 5, length) === '.json')
		{
			fs.unlinkSync(fileName);
		}
	}
}

/**
 * Returns all the elements that are in the first array but not in the second array.
 * @param {Array} first The first array.
 * @param {Array} second The second array.
 * @return {Array} The array of files to be deleted.
 */
function arrayDiff(first, second)
{
	function getHash(array)
	{
		var hash = {};

		for(var index = 0; index < array.length; index++)
		{
			hash[array[index]] = true;
		}

		return hash;
	}

	var hash =  getHash(second);
	var toDelete = [];

	for(var index = 0; index < first.length; index++)
	{
		var value =  first[index];

		if(!hash[value])
		{
			toDelete.push(value);
		}
	}	

	return toDelete;
}

module.exports = {
	sendFailureReply: sendFailureReply,
	getTestDoubleDefinition: getTestDoubleDefinition,
	getAllTestDoubles: getAllTestDoubles,
	save: save,
	logger: logger,
	remove:remove,
	checkFileExists: checkFileExists,
	removeAll: removeAll,
	arrayDiff: arrayDiff,
	cleanFiles: cleanFiles
};