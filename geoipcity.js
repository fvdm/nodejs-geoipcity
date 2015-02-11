/*
Name:         geoipcity
Description:  Lookup details for an IP using the Maxmind GeoIP City webservice.
Author:       Franklin van de Meent (https://frankl.in)
Source:       https://github.com/fvdm/nodejs-geoipcity
Feedback:     https://github.com/fvdm/nodejs-geoipcity/issues
License:      Unlicense / Public Domain
              see <https://github.com/fvdm/nodejs-geoipcity/raw/master/UNLICENSE>
*/

var net = require ('net');
var Iconv = require ('iconv').Iconv;
var iconv = new Iconv ('ISO-8859-1', 'UTF-8');
module.exports = {};

// settings
module.exports.settings = {
  apihost:  'geoip.maxmind.com',
  apiproto: 'http',
  license:  '',
  service:  'cityisporg'
};

// service fields
module.exports.serviceFields = function (service) {
  var res = {};
  switch (service) {
    case 'omni':
      res = {
        path: 'e',
        fields: [
          'target',
          'countryCode',
          'country',
          'regionCode',
          'region',
          'city',
          'latitude',
          'longitude',
          'metroCode',
          'areaCode',
          'timezone',
          'continentCode',
          'postalCode',
          'isp',
          'org',
          'domain',
          'asNumber',
          'netSpeed',
          'userType',
          'accuracyRadius',
          'countryConfidence',
          'cityConfidence',
          'regionConfidence',
          'postalConfidence',
          'extra'
        ]
      };
      break;
    case 'country':
      res = {
        path: 'a',
        fields: [
          'target',
          'country',
          'extra'
        ]
      };
      break;
    case 'city':
      res = {
        path: 'b',
        fields: [
          'target',
          'countryCode',
          'regionCode',
          'city',
          'latitude',
          'longitude',
          'extra'
        ]
      };
      break;
    case 'cityisporg':
      res = {
        path: 'f',
        fields: [
          'target',
          'countryCode',
          'regionCode',
          'city',
          'postalCode',
          'latitude',
          'longitude',
          'metroCode',
          'areaCode',
          'isp',
          'org',
          'extra'
        ]
      };
      break;
    default:
      res = false;
      break;
  }
  return res;
};


// parse csv data to object
module.exports.parseResult = function (str, head) {
  var result = {};
  var str = str.split (',');

  // check values
  if (str.length < head.length -1 || str.length > head.length) {
    return new Error ('Invalid response');
  }

  // API error
  var error = str [head.length -1] || false;
  if (typeof error === 'string' && error.match (/^[A-Z_]+$/)) {
    var err = new Error ('API error');
    err.details = error;
    return err;
  }

  // process
  for (i=0; i<str.length; i++) {
    if (str [i].match (/^".*"$/)) {
      str [i] = str [i].slice (1, -1);
    }
    result [head [i]] = str [i];
  }

  // done
  return result;
};


// do lookup
module.exports.lookup = function (ip, service, callback) {
  if (typeof service === 'function') {
    var callback = service;
    var service = module.exports.settings.service || 'cityisporg';
  }

  // check service
  var service = module.exports.serviceFields( service );
  if (!service) {
    callback (new Error ('Invalid service'));
    return;
  }

  // check license
  if (typeof module.exports.settings.license !== 'string' || module.exports.settings.license === '') {
    callback (new Error ('No license'));
    return;
  }

  // check IP
  if (net.isIP (ip) === 0) {
    callback (new Error ('Invalid IP'));
    return;
  }

  // build request
  var options = {
    host: module.exports.settings.apihost,
    path: '/'+ service.path +'?l='+ module.exports.settings.license +'&i='+ ip,
    method: 'GET'
  };

  if (module.exports.apiproto === 'https') {
    var request = require ('https').request (options);
  } else {
    var request = require ('http').request (options);
  }

  // request failed
  request.on ('error', function (error) {
    var err = new Error ('Request failed');
    err.request = options;
    err.details = error;
    callback (err);
  });

  // process response
  request.on ('response', function (response) {
    var data = [];
    var size = 0;

    response.on ('data', function (ch) {
      data.push (ch);
      size += ch.length;
    });

    response.on ('end', function () {
      var err = null;
      data = new Buffer.concat (data, size);
      data = iconv.convert (data).toString ('utf8').trim ();

      if (response.statusCode >= 300) {
        err = new Error ('HTTP error');
      } else if (data === '') {
        err = new Error ('No response');
      } else {
        data = module.exports.parseResult (ip +','+ data, service.fields);
        if (data instanceof Error) {
          err = data;
        }
      }

      if (err) {
        err.httpCode = response.statusCode;
        err.httpHeaders = response.headers;
        err.response = data;
        data = null;
      }

      callback (err, data);
      return;
    });

    response.on ('close', function () {
      callback (new Error ('Disconnected'));
      return;
    });
  });

  // complete request
  request.end();
};
