/**
 * @name stats-v1-api
 * @description This module packages the Stats API.
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
    res.send({
      msg: 'stats-service!!!!'
    });
  });

api.get('/statPoll', (req, res) => {
  var statusPoll = [];
  const fs = require('fs');

  let rawdata = fs.readFileSync('votes.json');
  var votes = JSON.parse(rawdata);

  let message = hydra.createUMFMessage({
    to: 'poll-service:[GET]/v1/poll/getPoll',
    from: 'stats-service',
    body: {}
  })

  hydra.makeAPIRequest(message)
    .then((data) => {
      var poll = data.info;
      for (let i in poll) {
        if (poll[i].id == votes[i].id) {
          statusPoll.push({
            id: poll[i].id,
            name: poll[i].name,
            options: poll[i].options,
            votes: votes[i].votes
          });
        }
      }
      res.send(statusPoll);
    })
    .catch((error) => {
      console.log('error: ' + error);
    });
});

api.get('/vote', (req, res) => {
  /* params */
  if (req.query.opt == undefined || req.query.id == undefined)
    res.sendError('PARAMETROS NECESARIOS: opt(' + req.query.opt + '),id(' + req.query.id + ')');
  var opt = req.query.opt;
  var id = req.query.id;
  /* params */
  const fs = require('fs');

  var data = fs.readFileSync('votes.json');
  var votesJson = JSON.parse(data);

  let message = hydra.createUMFMessage({
    to: 'poll-service:[GET]/v1/poll/getPoll',
    from: 'stats-service',
    body: {}
  })

  hydra.makeAPIRequest(message)
    .then((rs) => {
      var data = rs.info
      for (let i in data) {
        if (data[i].id == id) {
          var opts = data[i].options.split(",");
          for (let idOpt in opts) {
            if (opt == opts[idOpt]) {

              for (let v in votesJson) {
                if (votesJson[v].id == id) {
                  var votes = votesJson[v].votes.split(",");
                  var tVote = parseInt(votes[idOpt]) + 1;
                  votes[idOpt] = tVote;
                  var nwVotes = '';
                  for (let vt in votes) {
                    if (nwVotes != '')
                      nwVotes += ',';
                    nwVotes += votes[vt];
                  }
                  votesJson[v].votes = nwVotes;
                }
              }
              fs.writeFileSync("votes.json", JSON.stringify(votesJson));
              res.send([{id:id,name:data[i].name,options:opt,votes:tVote}]);
              break;
            }
          }
          break;
        }
      }
    })
    .catch((error) => {
      console.log('error: ' + error);
    });
});

function votePoll(id, idOpt) {
  const fs = require('fs');

  var data = fs.readFileSync('votes.json');
  var json = JSON.parse(data)

  for (let i in json) {
    if (json[i].id == id) {
      var votes = json[i].votes.split(",");
      votes[idOpt] = parseInt(votes[idOpt]) + 1;
      var nwVotes = '';
      for (let i in votes) {
        if (nwVotes != '')
          nwVotes += ',';
        nwVotes += votes[i];
      }
      json[i].votes = nwVotes;
    }
  }

  fs.writeFileSync("votes.json", JSON.stringify(json))

  return 'Vote OK!!';
}

api.get('/getVotes', (req, res) => {
  const fs = require('fs');

  let rawdata = fs.readFileSync('votes.json');
  let votes = JSON.parse(rawdata);
  res.send(votes);
});

api.get('/newVotes/:id/:opts', (req, res) => {
  const fs = require('fs');
  /* params */
  var options = req.params.opts;
  var id = req.params.id;
  /* params */

  var opts = options.split(",");
  var nwVotes = '';
  for (var i = 0; i < opts; i++) {
    if (nwVotes != '')
      nwVotes += ',';
    nwVotes += '0';
  }
  let newVote = {
    id: parseInt(id),
    votes: nwVotes
  };

  var data = fs.readFileSync('votes.json');
  var json = JSON.parse(data)
  json.push(newVote)

  fs.writeFileSync("votes.json", JSON.stringify(json))

  res.send('Votes added!!');
});

module.exports = api;
