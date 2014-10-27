var _ = require('underscore');
var util = require('util');
var events = require('events');
var Client = require('./lib/client.js');

function MeteorDown(action) {
  this.action = action;
}

MeteorDown.prototype.run = function(options) {
  for(var i=0; i<options.concurrency; ++i) {
    this.dispatch(options);
  }
};

MeteorDown.prototype.dispatch = function(options) {
  var self = this;
  // TODO pass whole 'options' object to Client and pick userId there
  var clientOptions = {
    url: options.url,
    key: options.key,
    stats: Stats
  };

  if(options.auth && options.auth.userId && options.auth.userId.length) {
    clientOptions.auth = {userId: pickRandom(options.auth.userId)}
  }

  var client = new Client(clientOptions);

  client.on('disconnected', function () {
    self.dispatch(options);
  });

  client.on('socket-error', function(error) {
    self.dispatch(options);
  });

  client.init(function (error) {
    self.action(error, client);
  });
};

function pickRandom (array) {
  return array[_.random(array.length-1)];
}

module.exports = MeteorDown;
MeteorDown.Client = Client;
