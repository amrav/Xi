var Xi = require('../../xi.js');
var request = require('request').defaults({
    proxy: 'http://10.3.100.212:8080/'
});
var FeedParser = require('feedparser');
var fs = require('fs');
var path = require('path');

var sources = require('./sources.json');
var history = require('./history.json');
var news = [];
var autoUpdate = false;
var autoUpdateInterval = 120000;
var query = false;
var queryUri = "http://news.google.co.in/news?output=rss&q=";
var queryUpdates = [];

function processHeadline(headline) {
    if (!query) {
	for (var i = history.length - 1; i >= 0; --i) {
	    if (headline === history[i])
		return;
	}
    }
    news.push(headline);
    history.push(headline);
    saveHistory();
    Xi.logger.log('verbose', "News: updated");
}

function saveHistory () {
    fs.writeFile(path.resolve(__dirname, 'history.json'),
		 JSON.stringify(history), function(err) {
		     if (err)
			 Xi.logger.error("News: ", err);
		     else
			 Xi.logger.log('verbose', "News: history saved");
		 });
}

function getNews(sourceUri) {
    Xi.logger.log('verbose', "News: Getting news from " + sourceUri);
    var r = request(sourceUri);

    var feedparser = new FeedParser();

    feedparser.on('error', function(error) {
	Xi.logger.error("News: feedparser: ", error);
    });

    feedparser.on('readable', function() {
	var stream = this
	var item = null;
	while (item = stream.read()) {
	    processHeadline(item.title);
	}
	if (query) {
	    setTimeout(function() {
		speakNews()
		query = false;
	    }, 1000);
	}
    });

    r.on('error',function(error) {
	Xi.logger.error("News: ", error);
    });
    r.on('response', function(res) {
	if (res.statusCode === 200) {
	    this.pipe(feedparser);
	}
	else
	    Xi.logger.warn("News: bad response code from ",
			sourceUri, " : ", res.statusCode);
    });
}

function updateNews (auto) {
    for (var i = 0; i < queryUpdates.length; ++i) {
	getNews(queryUpdates[i]);
    }
    if (auto && !autoUpdate)
	return;
    for (var i = 0; i < sources.length; ++i) {
	getNews(sources[i].uri);
    }
}

function speakNews () {
    if (news.length > 0) {
	(function (news) {
	    Xi.speak(news.length + " news update" + ((news.length > 1)? "s":"") + " available.", function () {
		runOnAck (function () {
		    Xi.logger.log('verbose', "News: ", news);
		    for (var i = 0; i < news.length; ++i)
			Xi.speak(news[i]);
		});
	    });
	})(news);
	news = [];
    }
    else if (query) {
	Xi.speak("I can't find any news at this time.");
	query = false;
    }
}

var waitingForAck = false;
var ackFunc;

function runOnAck (cb) {
    waitingForAck = true;
    ackFunc = cb;
    console.log("News: Waiting for ack");
    setTimeout(function () {
	if (!waitingForAck)
	    return;
	waitingForAck = false;
	Xi.logger.info("News: Stopped waiting for ack");
    }, 10000);
}

setInterval(function() { updateNews(true) }, autoUpdateInterval);
setInterval(speakNews, 10000);

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {
    if (message.text.match(/\bstop news updates\b/i)) {
	autoUpdate = false;
	Xi.speak("News updates stopped.");
	return;
    }
    var match = message.text.match(/\bstart news updates( every (\d+) minutes?)\b/i);
    if (match) {
	if (autoUpdate) {
	    Xi.speak("I am already giving you news updates.");
	    return;
	}
	Xi.speak("Okay, I will update you with the latest news.");
	autoUpdate = true;
	if (match[2])
	    autoUpdateInterval = parseInt(match[2]) * 60 * 1000;
	return;
    }
    var update = message.text.match(/(show |tell |give )(me )?news( updates)?( about)? (.*)/i);
    if (update) {
	Xi.speak("Finding the latest news about " + update[5]);
	getNews(queryUri + encodeURI(update[5]));
	query = true;
	return;
    }
    update = message.text.match(/keep((( me)? updated)|( giving( me)?( updates| news))|( updating( me)?))( about| for) (.*)/i);
    if (update) {
	Xi.speak("Okay, I will keep you updated with the latest news about " + update[10]);
	queryUpdates.push(queryUri + encodeURI(update[10]));
	updateNews(true);
	return;
    }
});

Xi.channels.subscribe(Xi.channels.sentiment, function (channel, message) {
    if (waitingForAck && message.publisher === 'ack') {
	if (message.sentiment === 'yes') {
	    Xi.logger.log('verbose', "News: got yes");
	    waitingForAck = false;
	    ackFunc();
	}
	else if (message.sentiment === 'no') {
	    Xi.logger.log('verbose', "News: got no");
	    Xi.speak("Okay");
	}
    }
});
	
	
