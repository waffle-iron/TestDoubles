var log4js = require('log4js');
var env = process.env.NODE_ENV || 'development';

log4js.configure({
appenders: [
		{
			type: 'console',
			category: 'console'
		},
		{
			type: 'file',
			filename: __dirname + '/../logs/td.log',
			category: 'testdouble'
		}
	],
	"levels": {
		'testdouble': env === 'development' ? 'DEBUG' : 'INFO'
	}	
});

var logger = log4js.getLogger('testdouble');

module.exports = logger;