MeteorDown
==========

Test runner for MeteorDown load testing framework. Install the `mdown` binary with `npm -g i meteor-down` and run load tests with `mdown script.js` command. You must have the `meteor-down` smart package installed before running tests. tests.

Example Script
--------------

    var mdown = new MeteorDown(function (error, client) {
      client.call('add', x, y, function (err, res) {
        console.log(x+' + '+y+' is '+res);
        client.kill();
      });
    });

    mdown.run({
      concurrency: 10,
      url: 'http://localhost:3000',
      key: 'YOUR_SUPER_SECRET_KEY',
      auth: {userId: ['JydhwL4cCRWvt3TiY', 'bg9MZZwFSf8EsFJM4']}
    });
