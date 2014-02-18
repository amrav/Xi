/* XI - eXtensible Intelligence :P */

// load dependencies

var PubSub = require('pubsub-js');
var sugar = require('sugar');
var path = require('path');

// Initialize logger
var winston = require('winston');
var logfile = path.resolve(__dirname, 'logs/',
			   Date.create().format('{yyyy}-{MM}-{dd}')
			   + '.log');
winston.add(winston.transports.File,
	    {
		filename: logfile,
		maxsize: 10000000,
		maxFiles: 10000,
		level: 'verbose'
	    });
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console,
	    {
		colorize: true,
	    });
exports.logger = winston;

// Define standard communication channels, and functions
// to subscribe/publish to a channel

exports.channels = {
    sensory: {
	up: "_SENSORY_UP",
	down: "_SENSORY_DOWN"
    },
    sentiment: "_SENTIMENT",
    speak: "_SPEAK",
    subscribe: function (channelName, callback) {
	// TODO: process channel_name in some way?
	return PubSub.subscribe(channelName, callback);
    },
    publish: function (channelName, data) {
	// TODO: process data in some way?
	PubSub.publish(channelName, data);
    }
};

exports.speak = function(text, cb) {
    exports.channels.publish(exports.channels.speak, {text:text, cb:cb});
};
