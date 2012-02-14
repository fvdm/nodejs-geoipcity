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

#### Callback

The callback function returns an object with these elements:

```
target
countryCode
regionCode
city
postalCode
latitude
longitude
metroCode
areaCode
isp
org
extra
```