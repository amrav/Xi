var Xi = require('../../xi.js');
var parser = require('libxml-to-js');
var nlpparser = require('speakeasy-nlp');
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
    if ( containsObject(nlpparser.classify(query).action,question_actions)){
        return true;
    }
    else
    {
        return false;
    }
}


function analyzeXML( xml){

    parser(xml, function (error, result) {
        if (error) {
            console.error(error);
        } else {
            answer = result.pod[1].subpod.plaintext;
            console.log("The answer is :");
            console.log(answer);
            Xi.speak(answer);

        }
    });

    
}
function query( q){
    request(query_url+q , function (error , response ,body) {
        console.log('verbose', "wolfram: Querying " , q);
        console.log(q);
        analyzeXML(body);
    });
}




//analyzeXML(barackxml);

Xi.channels.subscribe(Xi.channels.sensory.up, function (channel, message) {

    if( isQuestion(message.text))
    {
        query(message.text);
    }
    
});


