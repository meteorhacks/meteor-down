var _ = require('underscore');
var util = require('util');
var events = require('events');
var DDPClient = require('ddp');
var ddpUtils = require('./ddp_utils');
var ClientApi = require('./client_api');
var Client = require('./client.js');
var Stats = require('./stats.js');

function MeteorDown() {
  this.action = Function.prototype;
  this.stats = new Stats();
}

MeteorDown.prototype.init = function(action) {
  this.action = action;
};

MeteorDown.prototype.run = function(options) {
  options = _.extend(this._defaultOptions(), options);
  for(var i=0; i<options.concurrency; ++i) {
    this._dispatch(options);
  }
};

MeteorDown.prototype._defaultOptions = function () {
  return {
    concurrency: 10,
    url: 'http://localhost:3000'
  };
};

MeteorDown.prototype._dispatch = function(options) {
  var self = this;
  if(options.useSockJs === undefined) {
    options.useSockJs = true;
  }

  var ddpOptions = ddpUtils.urlToDDPOptions(options.url);
  ddpOptions.useSockJs = options.useSockJs;

  var ddpClient = new DDPClient(ddpOptions);
  var clientApi = new ClientApi(ddpClient, options);

  clientApi.on('disconnected', function () {
    self._dispatch(options);
  });

  clientApi.on('stats', function(type, name, value) {
    self.stats.track(type, name, value);
  });

  clientApi.init(function (error) {
    if(error) throw error;
    self.action(clientApi);
  });
};

module.exports = MeteorDown;