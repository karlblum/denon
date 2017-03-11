#! /usr/bin/env node

require('use-strict');
var telnet = require('telnet-client');
var express = require('express');
var path = require("path");
var config = require('./config');


var app = express();




var params = {
  host: config.host,
  port: config.port,
  shellPrompt: '',
  timeout: config.timeout,
  irs: '\r',
  ors: '\r',
  echoLines: 0,
  negotiationMandatory: false
};


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/api/volume', function (req, res) {
	execute('MV?', function(response){
		res.json({volume:response});
	})
});

app.get('/api/volume/:level', function (req, res) {
	execute('MV 0'+req.params.nr, function(response){
		res.json({volume:response});
	})
});

app.get('/api/alarm/on', function (req, res) {
	execute('TSEVERY 20740-20840 FA01 12 1', function(response){
		res.json({alarm:response});
	})
});

app.get('/api/alarm/off', function (req, res) {
	execute('TSEVERY 20740-20840 FA01 12 0', function(response){
		res.json({alarm:response});
	})
});

app.get('/api/alarm', function (req, res) {
	execute("TO?", function(response){
    if(response) {
      alarmState = parseAlarmResponse(response);
    } else {
      alarmState = "unknown"
    }
    res.json({alarm:alarmState});
	})
});

app.get('/api/power/on', function (req, res) {
	execute("PWON", function(response){
		res.json({power:response});
	})
});

app.get('/api/power/off', function (req, res) {
	execute("PWSTANDBY", function(response){
		res.json({power:response});
	})
});

app.get('/api/favourite/:nr', function (req, res) {
	execute("FV 0"+req.params.nr, function(response){
		res.json({favourite:response});
	})
});

app.get('/api/favourite/list', function (req, res) {
  	execute("FV ?", function(response){
		res.json({favourites:response});
	})
});

app.get('/api/power', function (req, res) {
	execute("PW?", function(response){
		res.json({power:response});
	})
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});



var execute = function(cmd, callback) {
    var connection = new telnet();
    console.log('TELNET - New client created');

  	connection.on('connect', function() {
  		console.log('TELNET - Connected');

  		connection.exec(cmd, function(err, response) {
        console.log("TELNET - Executing: "+ cmd);
        connection.end();
  			console.log("TELNET - Response: " + response);
  			callback(response);
  		});
  	});

  	connection.on('timeout', function() {
  	  console.log('TELNET - Socket timeout, closing connection.')
  	  connection.end();
  	});

  	connection.on('close', function() {
  	  console.log('TELNET - Connection closed.');
  	});

  	connection.on('error', function(err) {
  	  console.log('TELNET - Something bad happened');
      console.log(err);
  	});

  	connection.connect(params);
}

function parseAlarmResponse(response) {
  //Example response: "TOON OFF"
  return {"daily": (response.match("TOON") ? true : false),
          "once": (response.match("ON$") ? true : false)};
}
