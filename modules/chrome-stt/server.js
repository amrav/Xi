var express = require('express');
var app = express();

var Xi = require('../../xi.js');

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.use(express.json());
app.use(express.urlencoded());

app.get('/', function(req, res) {
    var message = {};
    message['publisher'] = 'chrome-stt';
    message['audience'] = 'all';
    message['priority'] = 1.0;
    message['text'] = req.query['stt'];
    res.send("STT Okay");
    message['text'] = message['text'].replace(/\bp m\b/ig, 'pm');
    message['text'] = message['text'].replace(/\ba m\b/ig, 'am');
    message['text'] = message['text'].replace(/\bbm\b/ig, 'pm');    
    message['text'] = message['text'].replace(/\b(\d\d)(\d\d) (am|pm)\b/, "$1:$2 $3");
    Xi.logger.log('verbose', 'chrome-stt', message);
    Xi.channels.publish(Xi.channels.sensory.up, message);
});
	
app.listen(9876);
Xi.logger.log('Chrome-STT Server: Listening on port 9876');


