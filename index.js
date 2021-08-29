#! /usr/bin/env node

require('use-strict');

var express = require('express');
var axios = require('axios')
var path = require("path");
var config = require('./config');
var parseString = require('xml2js').parseString;

var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
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
    axios.get(config.denon_api + 'formiPhoneAppDirect.xml?' + vol_str).then(response => {
      res.sendStatus(200);
    }).catch(error => {
      console.error(error);
      res.status(500).send(error);
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

  var header = {
    headers: { 'Content-Type': 'text/xml' }
  };

  axios.post(config.denon_api + 'AppCommand.xml', xmlBody, header)
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
  axios.get(config.denon_api + 'formiPhoneAppPower.xml?1+PowerStandby').then(response => {
    res.json({
      power: false
    })
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  })
});

app.get('/api/power/on', function (req, res) {
  axios.get(config.denon_api + 'formiPhoneAppPower.xml?1+PowerOn').then(response => {
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
  if (ch < 10) {
    ch = "0" + ch;
  }

  axios.get(config.denon_api + 'formiPhoneAppFavorite_Call.xml?' + ch).then(response => {
    res.status(200);
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  })
});


app.listen(config.webserver_port, function () {
  console.log('Denon remote app started!')
});