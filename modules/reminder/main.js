var Xi = require('../../xi.js');
var fs = require('fs');
var sugar = require('sugar');
var path = require('path');

var reminderFile = path.resolve(__dirname, 'reminders.json');
var reminders = require(reminderFile);
Xi.logger.log("Reminders: ", reminders);

function saveReminders() {
    fs.writeFile(reminderFile, JSON.stringify(reminders), function(err) {
	if (err)
	    Xi.logger.error("Reminder: ", err);
	else
	    Xi.logger.log("Reminder: saved");
    });
}

function createReminder(task, time) {
    var fiveMinuteFlag = false;
    if (time.isAfter(Date.create('five minutes from now')))
	fiveMinuteFlag = true;
    reminders.push({
	task: task,
	time: time,
	fiveMinuteFlag: fiveMinuteFlag
    });
    Xi.logger.log("Reminder: updated");
    saveReminders();
    var preposition = '';
    if (time.isAfter(Date.create('1 day from now')))
	preposition = ' on ';
    else
	preposition = ' in ';
    Xi.speak("Okay, I will remind you to " + task + preposition + time.relative());
}

function parseCommand(channel, msg) {
    var match = msg.text.match(/\bremind me to\b(.*)/i);
    if (match) {
	// try to use Date.create for time
	var t = match[1].match(/(.*?)(( in)? (\d+ (second|minute|hour|day)s?).*)/i)
	if (t) {
	    var time = Date.create(t[4] + ' from now');
	    createReminder(t[1], time);
	    return;
	}
	t = match[1].match(/(.*?) (at|on) (.*)/i)
	if (t) {
	    var time = Date.create(t[3]);
	    console.log('match: ', match[1]);
	    console.log('Time: ', t);
	    if (time) {
		createReminder(t[1], time);
		return;
	    }
	}
	Xi.speak("Sorry, I could not understand that.");
    }
}

function checkReminders() {
    for (var i = 0; i < reminders.length; ++i) {
	var time = Date.create(reminders[i].time);
	if (time.isBefore(Date.create('now'))) {
	    Xi.speak("You have to " + reminders[i].task + " now.");
	    reminders.splice(i, 1);
	    saveReminders();
	}
	else if (time.isBefore('five minutes from now') &&
		 reminders[i].fiveMinuteFlag) {
	    Xi.logger.info("Reminder: ", reminders[i].task);
	    Xi.speak("You have to " + reminders[i].task + " in " + time.relative().replace(/from now/i, ''));
	    reminders[i].fiveMinuteFlag = false;
	    saveReminders();
	}
    }
}

setInterval(checkReminders, 10000);

process.on('exit', function(code) {
    fs.writeFileSync(reminderFile, JSON.stringify(reminders));
    Xi.logger.log("Reminder: saved");
});

exports.subscriptions = {};
exports.subscriptions[Xi.channels.sensory.up] = parseCommand;




		
