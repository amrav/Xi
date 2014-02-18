var Xi = require('../../xi.js');

var say = require('say');
var speaking = true;
var speakingQueue = [];

function speakMessageText(channel, msg) {
    var numWords = msg.text.split(/ |\.|,|:|\d/).length;
    speakingQueue.push({
	text: msg.text,
	time: (msg.text.length / 4.0 * 300) + (numWords * 4000 / msg.text.length),
	cb: msg.cb
    });
}

function speak () {
    if (!speaking) {
	speakingQueue = [];
	return;
    }
    if (speakingQueue.length === 0) {
	setTimeout(speak, 200);
	return;
    }
    else {
	Xi.logger.log('verbose', "Speak: ", speakingQueue[0].text);
	console.log("Speak: ", speakingQueue[0].text);
	say.speak('Vicki', speakingQueue[0].text);
	setTimeout(speak, speakingQueue[0].time);
	if (speakingQueue[0].cb)
	    setTimeout(speakingQueue[0].cb, speakingQueue[0].time * 0.95);
	speakingQueue.splice(0, 1);
    }
}

speak();

exports.subscriptions = {};
exports.subscriptions[Xi.channels.speak] = speakMessageText;

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {
    if (!speaking && message.text.match(/\bXi\b/i)) {
	speaking = true;
	console.log("Speaking started");
    }
    else if (speaking && message.text.match(/stop (talking|speaking)|shut up|be quiet/i)) {
	speaking = false;
	console.log("Stopped speaking");
    }
});

exports.init = function() {
    
}

exports.exit = function(cb) {
    speaking = false;

    
    
    
    
    
    
    
    
    
    cb();
}
