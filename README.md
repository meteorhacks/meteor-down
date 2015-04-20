MeteorDown [![Build Status](https://travis-ci.org/meteorhacks/meteor-down.svg?branch=master)](https://travis-ci.org/meteorhacks/meteor-down)
==========

MeteorDown is a load testing tool for Meteor server side components. It uses the DDP protocol to communicate with the Meteor application. You can write your load test in JavaScript and let MeteorDown to invoke it.

Installation
------------

~~~shell
npm i -g meteor-down
~~~

Then create a file called `my_load_test.js` with the following content:

~~~js
meteorDown.init(function (Meteor) {
  Meteor.call('example-method', function (error, result) {
    Meteor.kill();
  });
});

meteorDown.run({
  concurrency: 10,
  url: "http://localhost:3000"
});
~~~

Then invoke the load test with:

~~~shell
meteor-down my_load_test.js
~~~


Client API
----------

With the MeteorDown script, you can call methods and invoke subscriptions. The function given to `meteorDown.init` will receive the ddp client as the first argument.

This ddp client is based on [node-ddp-client](https://github.com/oortcloud/node-ddp-client) but with some changes to make it more Meteor like. Let's look at APIs:

###Meteor.call

~~~js
Meteor.call('name'[, args*], callback)
~~~

Call a Meteor method. Just like the browser client, the callback will receive 2 arguments Error and the Result.

###Meteor.subscribe

~~~js
Meteor.subscribe('name'[, args*], callback)
~~~

The callback function will be called when the subscription is ready and all initial data is loaded to the client.

###Meteor.kill

~~~js
Meteor.kill()
~~~

Disconnect the current client from the server. As soon as this is called, another client will connect to the server and run load test code.

###Meteor.collections

~~~js
var Collection = Meteor.collections['name']
~~~

A dictionary of all client side collections. Data received from subscriptions will be available here.

Authentication
--------------

Normally, most of the Meteor methods and subscriptions are only available for  loggedIn users. So, we can't directly invoke those methods and subscriptions. MeteorDown has a solution for that.

First you need to install the following package:

~~~js
meteor add meteorhacks:meteor-down
~~~

Then you need to start your Meteor app with a key. That could be anything you like. But it's better to have a hard to guess key.

~~~js
export METEOR_DOWN_KEY='YOUR_SUPER_SECRET_KEY'
meteor
~~~

Now, add that key to your MeteorDown script and tell which users you need to authenticated against the load test. This is how you can do it.

~~~js
meteorDown.run({
  concurrency: 10,
  url: "http://localhost:3000",
  key: 'YOUR_SUPER_SECRET_KEY',
  auth: {userIds: ['JydhwL4cCRWvt3TiY', 'bg9MZZwFSf8EsFJM4']}
})
~~~

Then all your method calls and subscriptions will be authenticated for one of the user mentioned above.

You can also get the loggedIn user's userId by invoking `Meteor.userId()` as shown below:

~~~js
meteorDown.init(function (Meteor) {
  console.log("userId is:", Meteor.userId());
})
~~~

Options
-------

All test options are optional therefor it's perfectly okay to call `mdown.run` without any arguments. All available arguments and their default values are given below.

~~~js
meteorDown.run({
  concurrency: 10,
  url: 'http://localhost:3000',
  key: undefined,
  auth: undefined
});
~~~

#### concurrency

The maximum number of clients connects to the application at any given time. The real number of concurrent connections can be lower than this number.

#### url

Meteor application url.
**NOTE: This should only have the domain and the port (example: localhost:3000). Meteor-down does not support routes at the moment.**

#### key

The secret key to use for MeteorDown authentication.

#### auth

Authentication information. Currently MeteorDown only supports login by userId.

Using Custom Node Modules
--------
Currently, there is no direct support for that. But you could do it very easily. Let's say you've installed couple npm modules on the current directory. Then, you'll have a node_modules directory in the current directory.

Invoke MeteorDown like this and you'll access those npm modules by requiring them inside the MeteorDown script.

~~~shell
NODE_PATH=./node_modules meteor-down myMeteorDownScript.js
~~~

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
meteorDown.init(function (Meteor) {
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
meteorDown.init(function (Meteor) {
  Meteor.subscribe('allitems', function () {
    console.log('Subscription is ready');
    console.log(Meteor.collections.items);
    Meteor.kill();
  });
})
~~~
