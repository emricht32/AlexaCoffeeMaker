/**
	Code adopted from https://github.com/rlisle/alexaParticleBridge
*/

/**
 * Update skillName and invocationName to match the values
 * that you specify in the Alexa Skill Kit.
 * These are only used in responses from Alexa.
 */
var skillName = "CoffeeMaker";
var invocationName = "CoffeeMaker";

var APP_ID = undefined; //alexa skill key goes here;

var http = require('https');
var AlexaSkill = require('./AlexaSkill');
var CoffeeMaker = function () {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
CoffeeMaker.prototype = Object.create(AlexaSkill.prototype);
CoffeeMaker.prototype.constructor = CoffeeMaker;

CoffeeMaker.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log(invocationName + "onSessionStarted requestId: " + sessionStartedRequest.requestId
         + ", sessionId: " + session.sessionId);
     // any initialization logic goes here
};

CoffeeMaker.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log(invocationName + " onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var speechOutput = "Welcome to " + skillName + ", you can tell me to turn on or off";
  var repromptText = "You can tell me to turn on or off";
  response.ask(speechOutput, repromptText);
};

CoffeeMaker.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log(skillName + " onSessionEnded requestId: " + sessionEndedRequest.requestId
           + ", sessionId: " + session.sessionId);
  // any cleanup logic goes here
};

CoffeeMaker.prototype.intentHandlers = {
  // Register custom intent handlers.
  // This simple skill only uses one, but more can be added.
  "CoffeeMakerIntent": function (intent, session, response) {
    var requestURI = "/coffee";

 		var commandSlot = intent.slots.command;
 		var command = commandSlot ? intent.slots.command.name : "";
 		var speakText = "";
 		

 		// Verify that a command was specified.
    	// We can extend this to prompt the user,
    	// but let's keep this simple for now.
 		if(command.length > 0){

      		var postData = "args=" + command;
      		console.log("Post data = " + postData);

 			makeCoffeeMakerRequest(requestURI, postData, function(resp){
 		    	var json = JSON.parse(resp);
 		    	console.log(command + ": " + json.return_value);
 		    	response.tellWithCard(skillName, invocationName, "Thing is " + command );
 	    	});
 		} else {
 			response.tell("I don't know whether to turn thing on or off.");
 		}
  }, // CoffeeMakerIntent

  "AMAZON.HelpIntent": function (intent, session, response) {
    response.ask("You can tell " + invocationName + " to turn on or off.");
  } // HelpIntent
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
  var coffeeMakerSkill = new CoffeeMaker();
  coffeeMakerSkill.execute(event, context);
};

function makeCoffeeMakerRequest(requestURI, postData, callback){
 	var options = {
 		hostname: 'def5fe6d.ngrok.io',
 //		port: 80,
 		path: requestURI,
 		method: 'POST'
 //		headers: {
 //			'Content-Type': 'application/x-www-form-urlencoded',
 //     		'Authorization': 'Bearer ' + accessToken,
 //			'Accept': '*.*'
 //		}
 	};

 	var req = http.request(options, function(res) {
 		console.log('STATUS: ' + res.statusCode);
 		console.log('options: ' + JSON.stringify(options));

 		var body = "";

 		res.setEncoding('utf8');
 		res.on('data', function (chunk) {
 			console.log('BODY: ' + chunk);
 			body += chunk;
 		});

 		res.on('end', function () {
       	callback(body);
    });
 	});

 	req.on('error', function(e) {
 		console.log('problem with request: ' + e.message);
 		callback('error')
 	});

 	// write data to request body
 	req.write(postData.toString());
 	req.end();
}
