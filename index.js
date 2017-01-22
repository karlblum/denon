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
  echoLines: 0
};


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/api/volume', function (req, res) {
	execute('MV?', function(response){
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
		res.json({alarm:response});
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

app.get('/api/favourite/1', function (req, res) {
	execute("FV 01", function(response){
		res.json({favourite:response});
	})
});

app.get('/api/favourite/3', function (req, res) {
  	execute("FV 03", function(response){
		res.json({favourite:response});
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

	connection.on('connect', function() {
		console.log('Connected');
		connection.exec(cmd, function(err, response) {
			console.log("response: " + response);
			callback(response);
		});
	});
	
	connection.on('timeout', function() {
	  console.log('Socket timeout, closing connection.')
	  connection.end();
	});
	 
	connection.on('close', function() {
	  console.log('Connection closed.');
	});
	
	connection.on('error', function() {
	  console.log('Something bad happened');
	});
	
	connection.connect(params);	
}




