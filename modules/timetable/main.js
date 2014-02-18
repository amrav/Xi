/* Module to provide information about a timetable */

var Xi = require('../../xi.js');
var chrono = require('chrono-node');

var timetable = require('./timetable.json');

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function listClassesOnDay(msg) {
    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
		"Saturday", "Sunday"];
    msg.text = msg.text.replace(/\bdo\b|\bdid\b|\bI\b/g, '');
    var date = chrono.parseDate(msg.text);
    if (date === null) {
	Xi.logger.info("timetable: date not recognized");
	Xi.speak("Sorry, I didn't understand that.");
	return;
    }
    var day = date.getDay();
    if (day === 6 || day === 7) {
	Xi.speak("You don't have any classes on " + days[day-1]);
	return;
    }
    Xi.logger.log('verbose', "Timetable: " + JSON.stringify(timetable[days[day-1]]));
    Xi.speak("On " + days[day - 1] + ", you have " + JSON.stringify(timetable[days[day - 1]]));    
}

function processCommand(channel, msg) {
    if (msg.text.match(/(list|what|which).*?(subjects?|class(es)?|time table)/i) !== null)
	return listClassesOnDay(msg);
}

// Set subscriptions
exports.subscriptions = {};
exports.subscriptions[Xi.channels.sensory.up] = processCommand;

exports.init = function() {
    
}
