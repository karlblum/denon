#! /usr/bin/env node

require('use-strict');

var telnet = require('telnet-client');
var express = require('express');
var axios = require('axios')
var path = require("path");
var xml = require('xml');
var config = require('./config');
var moment = require('./moment');
var parseString = require('xml2js').parseString;

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
  if (vol > -1 & vol < 11) { //TODO: volume limit 5
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

app.get('/api/status', function (req, res) {

  var xmlBody = `
  <?xml version="1.0" encoding="utf-8"?>
  <tx>
   <cmd id="1">GetAllZonePowerStatus</cmd>
   <cmd id="1">GetVolumeLevel</cmd>
   <cmd id="1">GetNetAudioStatus</cmd>
  </tx>`;

  var config = {
    headers: { 'Content-Type': 'text/xml' }
  };

  axios.post('http://192.168.1.168/goform/AppCommand.xml', xmlBody, config)
    .then(response => {
      parseString(response.data, function (err, result) {
        res.json({
          power: result.rx.cmd[0].zone1[0],
          volume: result.rx.cmd[1].dispvalue[0],
          track: result.rx.cmd[2].text[4]._,
          artist: result.rx.cmd[2].text[5]._,
        });
      });

    })
    .catch(error => {
      console.error(error)
      res.status(500).send(error);
    })
});

app.get('/api/power/off', function (req, res) {
  axios.get('http://192.168.1.168/goform/formiPhoneAppPower.xml?1+PowerStandby').then(response => {
    res.json({
      power: false
    })
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  })
});

app.get('/api/power/on', function (req, res) {
  axios.get('http://192.168.1.168/goform/formiPhoneAppPower.xml?1+PowerOn').then(response => {
    res.json({
      power: true
    })
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
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

app.get('/api/power', function (req, res) {
  execute("PW?", function (response, error) {
    if (error != undefined & error != "") {
      res.status(500).send(error)
    } else {
      res.json({
        power: response.includes("PWON")
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
  var connection = new telnet();
  var requestID = Math.floor(Math.random() * 10000);
  var exec_response = ""
  var exec_error = ""

  connection.on('connect', function () {
    connection.exec(cmd, function (err, response) {
      if (response != undefined) {
        exec_response = response.replace(/(\r\n|\n|\r)/gm, "");
      }
      if (err != undefined) {
        exec_error = err;
      }
      console.log(requestID + " Telnet response: " + exec_response + " Error: " + exec_error);
      connection.end();
    });
  });

  connection.on('timeout', function () {
    console.log(requestID + " Socket timeout, closing connection")
    connection.end();
  });

  connection.on('close', function () {
    console.log(requestID + " Telnet connection closed");

    setTimeout(function () { //we need cooldown period before next connection
      denonConnectionAvailable = true;
    }, 100);

    callback(exec_response, exec_error);
  });

  connection.on('error', function (err) {
    console.log(requestID + " Telnet error");
    console.log(err);
    connection.end();
    //execute(cmd, callback);
  });

  console.log(requestID + " New command requested: " + cmd);
  waitConnection(100, 0, requestID, function () {
    console.log(requestID + " Telnet ready to connect...");
    denonConnectionAvailable = false;
    connection.connect(params);
  });
}

//https://stackoverflow.com/questions/7193238/wait-until-a-condition-is-true


function waitConnection(msec, count, rid, callback) {
  // Check if condition met. If not, re-check later (msec).
  while (!denonConnectionAvailable) {
    console.log(rid + " Telnet connection busy... waiting " + msec + "ms")
    count++;
    setTimeout(function () {
      waitConnection(msec, count, rid, callback);
    }, msec);
    return;
  }
  callback();
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