var utils = require('../utils.js');
var requests = require('../requests.js');

/**
 * Retrieves a list of all active testdoubles.
 * @param {Object} request The Hapi object that is used to extrcact parameters sent by the client.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function getAllHandler(request, reply) 
{
	utils.logger.debug('Entering get all handler, Begin request GET /testdoubles');
	utils.logger.debug('  entering getAllTestDoubles()');
	requests.getAllTestDoubles(reply);

}

module.exports = {
	getAllHandler: getAllHandler
};