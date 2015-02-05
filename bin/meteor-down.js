#!/usr/bin/env node

// set a high number for the maxSockets
// we don't need pooling here
require('http').globalAgent.maxSockets = 999999;

var vm = require('vm');
var _ = require('underscore');
var fs = require('fs');
var util = require('util');
var MeteorDown = require('../');

var filePath = process.argv[2];
if(!filePath) {
  showHelp();
  process.exit(1);
}

var meteorDown = new MeteorDown();

// run the script
var content = fs.readFileSync(filePath).toString();
var context = {
  require: require,
  meteorDown: meteorDown
};
_.extend(context, global);
vm.runInNewContext(content, context);

/* ------------------------------------------------------------------------- */

setInterval(function () {
  printStats(meteorDown.stats.get());
  meteorDown.stats.reset();
}, 1000*5);

/* ------------------------------------------------------------------------- */

function showHelp () {
  // TODO improve help and CLI interface
  console.log(
    'USAGE:\n'+
    '  meteor-down <path-to-script>\n'
  );
}

function printStats (stats) {
  var duration = stats.end - stats.start;

  console.log('--------------------------------------------------')
  console.log('Time   : %s', stats.end.toLocaleString());

  if(stats.data['method-response-time']) {
    var methodSummary = stats.data['method-response-time'].summary;
    var methodBreakdown = stats.data['method-response-time'].breakdown;
    console.log('Method : average: %d/min %dms ',
      parseInt(methodSummary.count * 60000 / duration),
      parseInt(methodSummary.total / methodSummary.count));
    methodBreakdown.forEach(function (item) {
      console.log('         %s: %d/min %dms', item.name,
        parseInt(item.count * 60000 / duration),
        parseInt(item.total / item.count));
    });
  }

  if(stats.data['pubsub-response-time']) {
    var pubsubSummary = stats.data['pubsub-response-time'].summary;
    var pubsubBreakdown = stats.data['pubsub-response-time'].breakdown;
    console.log('PubSub : average: %d/min %dms ',
      parseInt(pubsubSummary.count * 60000 / duration),
      parseInt(pubsubSummary.total / pubsubSummary.count));
    pubsubBreakdown.forEach(function (item) {
      console.log('         %s: %d/min %dms', item.name,
        parseInt(item.count * 60000 / duration),
        parseInt(item.total / item.count));
    });
  }
}
