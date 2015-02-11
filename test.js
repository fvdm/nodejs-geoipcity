/*
Name:         geoipcity
Description:  Test script for geoipcity.js
Author:       Franklin van de Meent (https://frankl.in)
Source:       https://github.com/fvdm/nodejs-geoipcity
Feedback:     https://github.com/fvdm/nodejs-geoipcity/issues
License:      Public Domain / Unlicense (see UNLICENSE file)
*/

var util = require ('util');

// Setup
var app = require ('./');
app.settings.license = process.env.GEOIPCITY_LICENSE || null;
app.settings.service = process.env.GEOIPCITY_SERVICE || 'cityisporg';
app.settings.apihost = process.env.GEOIPCITY_APIHOST || 'geoip.maxmind.com';
app.settings.apiproto = process.env.GEOIPCITY_APIPROTO || 'http';
var license = app.settings.license;

// handle exits
var errors = 0;
process.on ('exit', function () {
  if (errors === 0) {
    console.log ('\n\033[1mDONE, no errors.\033[0m\n');
    process.exit (0);
  } else {
    console.log ('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m\n');
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log ();
  console.error (err.stack);
  console.trace ();
  console.log ();
  errors++;
});

// Queue to prevent flooding
var queue = [];
var next = 0;

function doNext () {
  next++;
  if (queue[next]) {
    queue[next] ();
  }
}

// doTest( passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ])
function doTest (err, label, tests) {
  if (err instanceof Error) {
    console.error (label +': \033[1m\033[31mERROR\033[0m\n');
    console.error (util.inspect (err, {depth: 10, colors: true}));
    console.log ();
    console.error (err.stack);
    console.log ();
    errors++;
  } else {
    var testErrors = [];
    tests.forEach (function (test) {
      if (test[1] !== true) {
        testErrors.push (test[0]);
        errors++;
      }
    });

    if (testErrors.length === 0) {
      console.log (label +': \033[1m\033[32mok\033[0m');
    } else {
      console.error (label +': \033[1m\033[31mfailed\033[0m ('+ testErrors.join (', ') +')');
    }
  }

  doNext ();
}


function testError (err, message) {
  doTest (null, 'Error: '+ message, [
    ['type', err instanceof Error],
    ['message', err.message === message]
  ]);
}

// ! serviceFields
queue.push (function () {
  var res = app.serviceFields (app.settings.service);
  doTest (null, 'serviceFields', [
    ['type', res instanceof Object],
    ['path', res && res.path === 'f'],
    ['fields', res && res.fields instanceof Array],
    ['item', res && res.fields && res.fields[1] === 'countryCode']
  ]);
});


// ! Error: Invalid service
queue.push (function () {
  app.lookup ('x', null, function (err) {
    testError (err, 'Invalid service');
  });
});


// ! Error: No license
queue.push (function () {
  app.settings.license = null;
  app.lookup ('x', function (err) {
    testError (err, 'No license');
  });
});


// ! Error: Invalid IP
queue.push (function () {
  app.settings.license = license;
  app.lookup ('x', function (err) {
    testError (err, 'Invalid IP');
  });
});


// ! Error: API error
queue.push (function () {
  app.settings.license = license;
  app.lookup ('0.0.0.0', function (err) {
    doTest (null, 'Error: API error', [
      ['type', err instanceof Error],
      ['message', err.message === 'API error'],
      ['details', err.details === 'IP_NOT_FOUND']
    ]);
  });
});


// ! lookup
queue.push (function () {
  app.settings.license = license;
  app.lookup ('8.8.8.8', function (err, data) {
    doTest (err, 'lookup', [
      ['type', data instanceof Object],
      ['ip', data.target === '8.8.8.8'],
      ['countryCOde', data.countryCode === 'US']
    ]);
  });
});


// Start the tests
console.log ('Running tests...\n');
queue[0] ();
