var Xi = require('../../xi.js');

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {
    if (message.text.match(/\b(okay|yeah|fine|sure|yes|yep|tell|say)\b/i)) {
	Xi.channels.publish(Xi.channels.sentiment, {
	    sentiment: 'yes',
	    audience: 'all',
	    publisher: 'ack'
	});
    }
    else if (message.text.match(/\b(no|nope|not|don't)\b/i)) {
	Xi.channels.publish(Xi.channels.sentiment, {
	    sentiment: 'no',
	    audience: 'all',
	    publisher: 'ack'
	});
    }
});

