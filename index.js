#! /usr/bin/env node

require('use-strict');

var telnet = require('telnet-client');
var express = require('express');
var path = require("path");
var config = require('./config');
var moment = require('./moment');

var app = express();

var denonConnectionAvailable = true;

var params = {
  host: config.telnet_host,
  port: config.telnet_port,
  shellPrompt: '',
  timeout: config.telnet_timeout,
  irs: '\r',
  ors: '\r',
  echoLines: 0,
  negotiationMandatory: false
};

app.use(express.static('public'));

app.get('/old', function (req, res) {
  res.sendFile(path.join(__dirname + '/index_old.html'));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/volume', function (req, res) {
  execute('MV?', function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      vol = response.substring(2, 4);
      res.json({
        volume: vol
      });
    }
  })
});

app.get('/api/volume/:level', function (req, res) {
  vol = req.params.level;
  vol_str = "";
  if (vol > -1 & vol < 5) { //TODO: volume limit 5
    if (vol < 10) {
      vol_str = "MV0" + vol;
    } else {
      vol_str = "MV" + vol;
    }
    execute(vol_str, function (response) {
      res.json({
        volume: response
      });
    })
  }
});


app.get('/api/power/on', function (req, res) {
  execute("PWON", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        power: response
      });
    }
  })
});

app.get('/api/power/off', function (req, res) {
  execute("PWSTANDBY", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        power: response
      });
    }
  })
});

app.get('/api/favourite/:nr', function (req, res) {
  ch = req.params.nr;
  ch_str = "";
  if (ch < 10) {
    ch_str = "FV 0" + ch;
  } else {
    ch_str = "FV " + ch;
  }
  execute(ch_str, function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        favourite: response
      });
    }
  })
});

app.get('/api/favourite/list', function (req, res) {
  execute("FV ?", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        favourites: response
      });
    }
  })
});

app.get('/api/power', function (req, res) {
  execute("PW?", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      powerOn = false
      if (response === "PWON") {
        powerOn = true;
      }
      res.json({
        power: powerOn
      });
    }
  })
});

app.get('/api/input/tuner', function (req, res) {
  execute("SIIRADIO", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        power: response
      });
    }
  })
});

app.get('/api/input/aux', function (req, res) {
  execute("SIAUXD", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        power: response
      });
    }
  })
});


app.listen(config.webserver_port, function () {
  console.log('Denon remote app started!')
});

var execute = function (cmd, callback) {
  while (!denonConnectionAvailable) {
    //waiting for free connection
  }
  denonConnectionAvailable = false

  var connection = new telnet();
  var requestID = Date.now().toString().substr(7, 7)
  var exec_response = ""
  var exec_error = ""
  var responseOK = true
  //TODO add error log levels (debug/live)
  connection.on('connect', function () {
    connection.exec(cmd, function (err, response) {


      if (response != undefined) {
        exec_response = response.replace(/(\r\n|\n|\r)/gm, "");
      }
      if (err != undefined) {
        exec_error = err;
      }
      console.log("TELNET RequestID: " + requestID + " - Command: " + cmd + " Response: " + exec_response + " Error: " + exec_error);
      connection.end();
    });
  });

  connection.on('timeout', function () {
    console.log("TELNET RequestID: " + requestID + " - Socket timeout, closing connection")
    connection.end();
  });

  connection.on('close', function () {
    console.log("TELNET RequestID: " + requestID + " - Connection closed, responseOK=" + responseOK);
    denonConnectionAvailable = true;
    callback(exec_response, exec_error);
  });

  connection.on('error', function (err) {
    console.log("TELNET RequestID: " + requestID + " - Something bad happened");
    console.log(err);
    responseOK = false;
    //execute(cmd, callback);
  });

  connection.connect(params);
}

function parseAlarmResponse(response) {
  //Example response: "TOON OFF"
  return {
    "daily": (response.match("TOON") ? true : false),
    "once": (response.match("ON$") ? true : false)
  };
}

console.logCopy = console.log.bind(console);

console.log = function (data) {
  var timestamp = '[' + moment().format("YYYY-MM-DD H:m:s.SSS") + '] ';
  this.logCopy(timestamp, data);
};