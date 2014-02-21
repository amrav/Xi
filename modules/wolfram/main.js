var Xi = require('../../xi.js');
var nlpparser = require('speakeasy-nlp');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var request = require('request').defaults({
    proxy: 'http://10.3.100.212:8080/'
});
appid = "PX3TR4-P625JH239J";
query_url = "http://api.wolframalpha.com/v2/query?appid="+appid + "&input=";


function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}


function isQuestion(query){
    question_actions = ["how", "what" , "when" , "who" , "whom" ];
    return containsObject(nlpparser.classify(query).action,question_actions);
}


function analyzeXML( xml){
    var doc = new dom().parseFromString(xml);
    var nodes = xpath.select("//pod[@title='Result']/subpod/plaintext", doc);
    if(nodes.length != 0){
        var result = nodes[0].firstChild.data;
        answer = result;
        Xi.speak(answer);
    }
}

function query( q){
    request(query_url+q , function (error , response ,body) {
        analyzeXML(body);
    });
}

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {
    if( isQuestion(message.text))
    {
        query(message.text);
    }
    
});


