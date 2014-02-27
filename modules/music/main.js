var Xi = require('../../xi.js');
var spawn = require('child_process').spawn;
var path = require('path');
var MUSIC_DIR = path.resolve(__dirname, 'downloads');

var vlcCommand;
if (os.platform() == 'darwin')
    vlcCommand = '/Applications/VLC.app/Contents/MacOS/VLC';
else
    vlcCommand = 'vlc';

var playing = false;
var vlc = spawn(VLC, ['-I', 'rc'], {
    cwd: MUSIC_DIR,
    env: process.env,
});

function add(filename) {
    vlc.stdin.write("add " + filename + "\n");
    playing = true;
}

function queue(filename) {
    vlc.stdin.write("queue " + filename + "\n");
}

function play() {
    vlc.stdin.write("play\n");
}

function pause() {
    if (!playing)
	return;
    vlc.stdin.write("pause\n");
    playing = false;
}

function stop() {
    if (!playing)
	return;
    vlc.stdin.write("stop\n");
    playing = false;
}

vlc.stderr.on('data', function(data) {
    Xi.logger.log('verbose', "VLC: " + data);
});


function downloadVideo(query) {
    var download = spawn('youtube-dl', [query, '-f', '140'], {
	cwd: MUSIC_DIR,
	env: process.env
    });
    Xi.logger.log('verbose', "Music: downloading...");
    Xi.speak("Playing '" + query + "'");
    var fileName = '';
    download.stdout.on('data', function (data) {
	var match = ('' + data).match(/Destination: (.*)/);
	var match2 = ('' + data).match(/\[download\] (.*) has already been downloaded/);
	if (match || match2) {
	    fileName = ((match && match[1]) || (match2 && match2[1]));
	    Xi.logger.log('verbose', "Filename: ", fileName);
	}
	match = ('' + data).match(/\d?\d\d\.\d%/);
	if (match)
	    Xi.logger.log('verbose', "Music: download: ", match[0]);
    });
    download.stderr.on('data', function (data) {
	Xi.logger.error("Music: error: " + data);
    });
    download.on('exit', function (code) {
	if (code === 0 && fileName !== '') {
	    Xi.logger.log('verbose', "Music: loaded");
	    add(fileName);
	    Xi.logger.log('verbose', "Music: playing...");
	}
	else {
	    Xi.logger.error("Music: something went wrong - unable to play");
	    Xi.speak("Sorry, I couldn't load your music.");
	}
    });
}

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {
    var match = message.text.match(/^play.*?(youtube)?(.*)/i);
    if (match) {
	if (match[2].length === 0) {
	    play();
	    return;
	}
	downloadVideo(match[2]);
	return;
    }
    match = message.text.match(/stop playing/i);
    if (match) {
	pause();
	Xi.logger.log('verbose', "Music: paused");	
	Xi.speak("Music stopped.");
	return;
    }
    if (message.text.match(/\pause\b/i)) {
	pause();
	Xi.logger.log('verbose', "Music: paused");
	return;
    }
});
