/* Main entry point for Xi */

var Xi = require('./xi.js');

// Load dependencies

var _ = require('underscore');


// Load config - this should be in the same directory

var config = require('./config.json');

// Load modules

for (var i = 0; i < config.modules.length; ++i) {
    var curModule = require(config.modules[i].path);
    if (_.has(curModule, 'init') && _.isFunction(curModule.init))
	curModule.init()
    if (_.has(curModule, 'subscriptions'))
	for (var sub in curModule.subscriptions)
	    if (_.has(curModule.subscriptions, sub))
		Xi.channels.subscribe(sub, curModule.subscriptions[sub]);
    Xi.logger.info("Module loaded: '" + config.modules[i].name + "'");
}

 // Listen for SIGINT
process.on('SIGINT', function(code) {
    Xi.logger.info("Xi: Shutting down");
    Xi.logger.info("Xi: Waiting for modules...");    
    var moduleNum = 0;
    function exit() {
	if (moduleNum >= config.modules.length) {
	    Xi.logger.log("Xi: Shut down");	    
	    process.exit(0);
	}
	var curModule = require(config.modules[moduleNum].path);
	while (moduleNum < config.modules.length) {
	    curModule = require(config.modules[moduleNum].path);
	    if (_.has(curModule, 'exit')
		&& _.isFunction(curModule.exit))
		break;
	    ++moduleNum;
	}
	if (moduleNum == config.modules.length) {
	    Xi.logger.log("Xi: Shut down");
	    process.exit(0);
	}
	else {
	    ++moduleNum 
	    curModule.exit(exit)
	}
    }
    setTimeout(function() {
	Xi.logger.warn("Xi: Unable to shut down gracefully")
	Xi.logger.log("Xi: Shut down");
	process.exit(0);
    }, 20000);
    exit();
});

