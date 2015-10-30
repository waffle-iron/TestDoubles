var utils = require('../utils.js');
var requests = require('../requests.js');

/**
 * Deletes all testdoubles.
 * @param {Object} request The request object that is passed by Hapi.
 * @param {Object} reply The Hapi object consisting of a JSON response to be sent to the client.
 */
function deleteAllHandler(request, reply) 
{
	utils.logger.debug('Entering delete all handler, Begin request DELETE /testdoubles');
	utils.logger.debug('  entering deleteAllTestDoubles()');
	requests.deleteAllTestDoubles(reply);
}

module.exports = {
	deleteAllHandler: deleteAllHandler
};