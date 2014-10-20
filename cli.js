#!/usr/bin/env node

var MeteorDown = require('./');
var fs = require('fs');

var filePath = process.argv[2];
if(!filePath) {
  showHelp();
  process.exit(1);
}

var content = fs.readFileSync(filePath).toString();
var scriptFn = new Function('MeteorDown', 'require', content);
scriptFn(MeteorDown, require);

/* ------------------------------------------------------------------------- */

function showHelp () {
  console.log(
    'USAGE:\n'+
    '  mdown <path-to-script>\n'
  );
}
