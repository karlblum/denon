#! /usr/bin/env node

require('use-strict');

var telnet = require('telnet-client');
var express = require('express');
var path = require("path");
var config = require('./config');

var app = express();

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

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/volume', function(req, res) {
  execute('MV?', function(response) {
    if (response != undefined) {
      vol = response.substring(2, 4);
      res.json({
        volume: vol
      });
    } else {
      res.json({
        volume: -1
      });
    }
  })
});

app.get('/api/volume/:level', function(req, res) {
  vol = req.params.level;
  vol_str = "";
  if (vol > -1 & vol < 25) {
    if (vol < 10) {
      vol_str = "MV0" + vol;
    } else {
      vol_str = "MV" + vol;
    }
    execute(vol_str, function(response) {
      res.json({
        volume: response
      });
    })
  }
});

app.get('/api/alarm/on', function(req, res) {
  execute('TSEVERY 20740-20840 FA01 12 1', function(response) {
    res.json({
      alarm: response
    });
  })
});

app.get('/api/alarm/off', function(req, res) {
  execute('TSEVERY 20740-20840 FA01 12 0', function(response) {
    res.json({
      alarm: response
    });
  })
});

app.get('/api/alarm', function(req, res) {
  execute("TO?", function(response) {
    if (response) {
      alarmState = parseAlarmResponse(response);
    } else {
      alarmState = "unknown"
    }
    res.json({
      alarm: alarmState
    });
  })
});

app.get('/api/power/on', function(req, res) {
  execute("PWON", function(response) {
    res.json({
      power: response
    });
  })
});

app.get('/api/power/off', function(req, res) {
  execute("PWSTANDBY", function(response) {
    res.json({
      power: response
    });
  })
});

app.get('/api/favourite/:nr', function(req, res) {
  execute("FV 0" + req.params.nr, function(response) {
    res.json({
      favourite: response
    });
  })
});

app.get('/api/favourite/list', function(req, res) {
  execute("FV ?", function(response) {
    res.json({
      favourites: response
    });
  })
});

app.get('/api/power', function(req, res) {
  execute("PW?", function(response) {
    res.json({
      power: response
    });
  })
});

app.get('/api/input/tuner', function(req, res) {
  execute("SIIRADIO", function(response) {
    res.json({
      power: response
    });
  })
});

app.get('/api/input/aux', function(req, res) {
  execute("SIAUXB", function(response) {
    res.json({
      power: response
    });
  })
});

app.listen(config.webserver_port, function() {
  console.log('Denon remote app started!')
});

var execute = function(cmd, callback) {
  var connection = new telnet();
  var exec_response = ""
  var responseOK = true

  connection.on('connect', function() {
    connection.exec(cmd, function(err, response) {
      console.log("TELNET - Executing: " + cmd);
      console.log("TELNET - Response: " + response);
      exec_response = response;
      connection.end();
    });
  });

  connection.on('timeout', function() {
    console.log('TELNET - Socket timeout, closing connection.')
    connection.end();
  });

  connection.on('close', function() {
    console.log('TELNET - Connection closed.');
    if (responseOK) {
      callback(exec_response);
    }
  });

  connection.on('error', function(err) {
    console.log('TELNET - Something bad happened');
    console.log(err);
    responseOK = false;
    execute(cmd, callback);
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
