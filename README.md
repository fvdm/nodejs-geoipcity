geoipcity
=========

Lookup details for an IP address using the legacy [Maxmind GeoIP City](http://www.maxmind.com/en/web_services) webservice.
A license key with webservice access is required.

This module is compatible with the following Maxmind GeoIP 1 services:

* Country
* City
* City/ISP/Org
* Omni

You can configure a service to use for all lookups or decide per lookup which service you'd like to use.
This allows you to use less expensive calls depending on the level of detail required.
See [Configuration](#configuration) and [.lookup](#lookup) below for more information.


> New: [geoip2ws](https://www.npmjs.com/package/geoip2ws) package for the Maxmind GeoIP2 web services.


Example
-------

```js
var geoip = require ('geoipcity');
geoip.settings.license = 'licenseKey';

geoip.lookup ('8.8.8.8', function (err, data) {
  if (!err) {
    console.log (data.city);
    console.log (data.latitude +', '+ data.longitude;
  } else {
    console.log (err);
  }
});
```


### Output for service `cityisporg`

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


Installation
------------

Stable: `npm install geoipcity`

Develop: `npm install fvdm/nodejs-geoipcity#develop`


Configuration
-------------

You can change a few parameters with the `settings` object:

name     | type   | required | description
---------|--------|----------|-------------------------------------------------------
license  | string | yes      | Your MaxMind license key
service  | string | no       | API service: omni, country, city, cityisporg (default)
apihost  | string | no       | API hostname: default `geoip.maxmind.com`
apiproto | string | no       | Protocol: https or http (default)


### Example

```js
geoip.settings.license = 'myLicenseKey';
geoip.settings.apiproto = 'https';
```


.lookup ( ip, [service], callback )
-----------------------------------

Retrieve geolocation and related information about an IP-address from the Maxmind API.


param    | type     | required | description
---------|----------------------------
ip       | string   | yes      | IPv4 or IPv6 address to lookup
service  | string   | no       | Override for `settings.service`, see above
callback | function | yes      | Function to process response


The `callback` function takes these two parameters: `err` and `data`.
In case of a problem `err` is an _instanceof Error_ with all related information.
When everything is good, `err` is _null_ and `data` contains the _object_ with geo data.


Error handling
--------------

The `err` parameter in the callback function can return these errors. Some have additional properties.

### Errors

message          | description
-----------------|-----------------------------------------
No license       | You did not specify your license key.
Invalid IP       | The provided IP address is invalid.
Invalid service  | The provided service name is invalid.
Request failed   | The request can't be made.
HTTP error       | The API returned a HTTP error.
No response      | The API did not return data.
Invalid response | The API returned invalid data.
Disconnected     | The API closed the connection too early.
API error        | The API returned an error.


### Additional properties

property     | type    | description
-------------|---------|-----------------------------
.details     | mixed   | ie. IP_NOT_FOUND
.httpCode    | integer | ie. 404
.httpHeaders | object  | Response headers
.request     | object  | Request details
.response    | string  | Response body


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>


Author
------

Franklin van de Meent
| [Website](https://frankl.in)
| [Github](https://github.com/fvdm)
