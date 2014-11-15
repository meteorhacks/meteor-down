MeteorDown
==========

MeteorDown is a load testing framework for Meteor server side components. It uses the DDP protocol to communicate with the Meteor application but provides much familiar interface for developers.

Installation
------------

    npm -g i meteor-down

Install MeteorDown globally to make the `mdown` command available. It's easier to run tests this way because you don't have to install the npm module everywhere. If you use the `mdown` command, it will also log useful performance statistics every 5 seconds.

The following mdown script will call an `example-method` with default options. Checkout the [writing tests](#writing-tests) section below and [examples](#examples) to learn how to write tests.

~~~js
mdown.init(function (Meteor) {
  Meteor.call('example-method', function (error, result) {
    Meteor.kill();
  });
});

mdown.run();
~~~

Client API
----------

Writing tests is made similar to writing Meteor client side code. It's still limited to method calls and subscriptions but more features will be added soon. The function given to `mdown.init` will receive the ddp client as the first argument. This ddp client is based on [node-ddp-client](https://github.com/oortcloud/node-ddp-client) but with some changes to make it more Meteor like. This client will be already connected to the Meteor application (and authenticated if necessary options are given). Let's name the ddp client Meteor.

###Meteor.call

    Meteor.call ('name'[, args*], callback)

Call a Meteor method. Just like the browser client, the callback will receive 2 arguments Error and the Result.

###Meteor.subscribe

    Meteor.subscribe ('name'[, args*], callback)

The callback function will be called when the subscription is ready and all initial data is loaded to the client.

###Meteor.kill

    Meteor.kill()

Disconnect from the server. As soon as this is called, another client will connect to the server and run load test code.

###Meteor.collections

    var Collection = Meteor.collections['name']

A dictionary of all client side collections. Data received from subscriptions will be available here.

Authentication
--------------

You can use login using Meteor `login` method with valid crednentials or you can let MeteorDown handle it for you. Simply install the `meteorhacks:meteordown` smart package on your application and start it with `METEOR_DOWN_KEY` environment variable set to a random secret string.

    meteor add meteorhacks:meteor-down
    export METEOR_DOWN_KEY='YOUR_SUPER_SECRET_KEY'
    meteor

When running the test, give that random key and a list of userIds with options. When connecting each client, MeteorDown will randomly use available userIds and log into the application before running code given by user.

~~~js
mdown.run({
  key: 'YOUR_SUPER_SECRET_KEY',
  auth: {userId: ['JydhwL4cCRWvt3TiY', 'bg9MZZwFSf8EsFJM4']}
})
~~~

The smart package allows users to login with their userId and the MeteorDown key so make sure the key is never available to the public. Or install the smart package only when you're running a load test.

Options
-------

All test options are optional therefor it's perfectly okay to call `mdown.run` without any arguments. All available arguments and their default values are given below.

~~~js
mdown.run({
  concurrency: 10,
  url: 'http://localhost:3000',
  key: undefined,
  auth: undefined
});
~~~

###concurrency

The maximum number of clients connects to the application at any given time. The real number of concurrent connections can be lower than this number.

###url

Meteor application url.

###key

The secret key to use for MeteorDown authentication.

###auth

Authentication information. Currently MeteorDown only supports login by userId.

Examples
--------

### Calling a Method

~~~js
// Meteor Application
Meteor.methods({
  add: function (x, y) {return x + y }
})
~~~

~~~js
// MeteorDown Script
mdown.init(function (Meteor) {
  Meteor.call('add', 5, 6, function (err, res) {
    console.log('5 + 6 is ' + res);
    Meteor.kill();
  });
})
~~~

### Subscribing

~~~js
// Meteor Application
Items = new Meteor.Collection('items');
Meteor.publish({
  allitems: function () { return Items.find() }
})
~~~

~~~js
// MeteorDown Script
mdown.init(function (Meteor) {
  Meteor.subscribe('allitems', function () {
    console.log('Subscription is ready');
    console.log(Meteor.collections.items);
    Meteor.kill();
  });
})
~~~
