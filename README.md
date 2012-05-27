geoipcity for node.js
=====================

Lookup details for an IP using the [Maxmind GeoIP City](http://www.maxmind.com/app/web_services) webservice. This requires a license key with webservice access.

[![Build Status](https://secure.travis-ci.org/fvdm/nodejs-geoipcity.png?branch=master)](http://travis-ci.org/fvdm/nodejs-geoipcity)

## Install

### With NPM

**npm install geoipcity**

```js
var geoip = require('geoipcity');
```

### From source:

```js
var geoip = require('./geoipcity.js');
```

## Example

```js
var geoip = require('geoipcity');

geoip.settings.license = 'licenseKey';

geoip.lookup( '8.8.8.8', function(data) {
  console.log( data.city );
  console.log( data.latitude +', '+ data.longitude );
});
```

```js
{ target:      '8.8.8.8',
  countryCode: 'US',
  regionCode:  'CA',
  city:        'Mountain View',
  postalCode:  '94043',
  latitude:    '37.419201',
  longitude:   '-122.057404',
  metroCode:   '807',
  areaCode:    '650',
  isp:         'Level 3 Communications',
  org:         'Google Incorporated' }
```

## License

This module is **COPYLEFT** meaning you can do anything you want, except copyrighting it.

If you can, please include the source URL in the code for future reference: https://github.com/fvdm/nodejs-geoipcity/
