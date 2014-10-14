MeteorShower
============

Load testing for Meteor

Installation
------------

  - Install the meteor-shower smart package `meteorhacks:meteor-shower`
  - Initialize meteor shower with `MeteorShower.init('SECRET_RANDOM_ID')` (server side)
  - Use the npm module `meteor-shower` when writing tests

Example
-------

    var MeteorShower = require('meteor-shower');
    new MeteorShower(function (error, client) {
      client.call('add', x, y, function (err, res) {
        console.log(x+' + '+y+' is '+res);
        client.kill();
      });
    }).run({
      concurrency: 10,
      url: 'http://localhost:3000',
      key: 'SECRET_RANDOM_ID',
      auth: {userId: ['JydhwL4cCRWvt3TiY', 'bg9MZZwFSf8EsFJM4']}
    });

Note
----

  - Authentication details given to MeteorShower must exist.
