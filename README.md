[![Build Status](https://secure.travis-ci.org/fvdm/nodejs-geoipcity.png?branch=master)](http://travis-ci.org/fvdm/nodejs-geoipcity)

### geoipcity for node.js

Lookup details for an IP using the Maxmind GeoIP City webservice.
This requires a license key with webservice access.

#### Install

```
npm install geoipcity
```

#### Example

```js
var geoip = require('geoipcity');
geoip.lookup( 'licenceKey', '8.8.8.8', function(data) {
  console.log( data.city );
  console.log( data.latitude +', '+ data.longitude );
});
```

```js
[ target:      '8.8.8.8',
  countryCode: 'US',
  regionCode:  'CA',
  city:        'Mountain View',
  postalCode:  '94043',
  latitude:    '37.419201',
  longitude:   '-122.057404',
  metroCode:   '807',
  areaCode:    '650',
  isp:         'Level 3 Communications',
  org:         'Google Incorporated' ]
```