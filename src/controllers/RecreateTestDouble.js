var utils = require('../utils.js');
var requests = require('../requests.js');

/**
 * Imports a list of testdoubles and mass creates with a single definition.
 * @param {Object} request The request object that is passed by Hapi.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function recreateHandler(request, reply)
{
	utils.logger.debug('Entering import handler, Begin request PUT /testdoubles');

	var testDoubleDefinition = request.payload;

	if(!testDoubleDefinition.hasOwnProperty('imposters'))
	{
		utils.sendFailureReply(reply, "bad data", "must provide a list of testdoubles");
		utils.logger.debug('  No list of testdoubles provided, exiting from create handler');
		return;
	}

	else
	{
		var imposters = testDoubleDefinition.imposters;
		var index = 0;
		var noName = false;
		
		while(index < imposters.length && noName === false)
		{
			if(!imposters[index].hasOwnProperty('name'))
			{
				noName = true;
			}

			index++;
		}
		
		utils.logger.debug('  noName: ' + noName);

		if(noName)
		{
			utils.sendFailureReply(reply, "bad data", "all testdoubles must have a name");
			utils.logger.debug('  exiting import handler, because there is atleast 1 nameless testdouble');
			return;
		}

		else
		{
			utils.logger.debug('  mountebank input for multiple testdoubles is: ' + JSON.stringify(testDoubleDefinition, null, 4));
			requests.putRequest(testDoubleDefinition, reply);
		}
	}
}

module.exports = {
	recreateHandler : recreateHandler
};