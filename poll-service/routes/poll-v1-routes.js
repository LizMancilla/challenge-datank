/**
 * @name poll-v1-api
 * @description This module packages the Poll API.
 */
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = require('fwsp-server-response');

let serverResponse = new ServerResponse();
express.response.sendError = function (err) {
  serverResponse.sendServerError(this, { result: { error: err } });
};
express.response.sendOk = function (result) {
  serverResponse.sendOk(this, { result });
};

let api = express.Router();

api.get('/',
  (req, res) => {
    res.sendOk('Poll service!!');
  });

api.get('/addPoll', (req, res) => {
  const fs = require('fs');
  /* params */
  if (req.query.name == undefined || req.query.opts == undefined)
    res.sendError('PARAMETROS NECESARIOS: name(' + req.query.name + '),opts(' + req.query.opts + ')');
  /* params */

  var data = fs.readFileSync('poll.json');
  var json = JSON.parse(data);
  var id = json.length+1;
  var opts = req.query.opts;
  let newPoll = {
    id: id,
    name: req.query.name,
    options: opts
  };
  json.push(newPoll)

  fs.writeFileSync("poll.json", JSON.stringify(json));
  addVotes(id,opts.split(",").length);
  res.send('Poll added!!');
});

api.get('/getPoll', (req, res) => {
  const fs = require('fs');

  let rawdata = fs.readFileSync('poll.json');
  let poll = JSON.parse(rawdata);
  res.send({info:poll});
});

api.get('/verPoll', (req, res) => {
  const fs = require('fs');

  let rawdata = fs.readFileSync('poll.json');
  let poll = JSON.parse(rawdata);
  res.send(poll);
});

function addVotes(id,opts){
  let message = hydra.createUMFMessage({
    to: 'stats-service:[GET]/v1/stats/newVotes/'+id+'/'+opts,
    from: 'poll-service',
    body: {}
  })

  hydra.makeAPIRequest(message)
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = api;


