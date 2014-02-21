var Xi = require('../../xi.js');
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('> ');
rl.prompt();

rl.on('line', function (answer) {

    var message = {};
    message['publisher'] = 'repl';
    message['audience'] = 'all';
    message['priority'] = 1.0;
    message['text'] = answer;
    Xi.channels.publish(Xi.channels.sensory.up, message);
    rl.prompt();
});






