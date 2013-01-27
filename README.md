geoipcity for node.js
=====================

Lookup details for an IP using the [Maxmind GeoIP City](http://www.maxmind.com/en/web_services) webservice. This requires a license key with webservice access.


Installation
------------

### With NPM

This is always the most recent *stable* version.

	npm install geoipcity


### From Github:

This is the most recent code, but may be *untested*.

	git clone https://github.com/fvdm/nodejs-geoipcity
	npm install ./nodejs-geoipcity


Configuration
-------------

You can change a few parameters with the `settings` object:

	license    Your MaxMind license key.
	apihost    Default set to 'geoip.maxmind.com'.
	apiproto   Default set to 'http', set to 'https' for more security.


### Example

```js
geoip.settings.license = 'myLicenseKey'
geoip.settings.apiproto = 'https'
```


.lookup ( ip, callback )
------------------------

First set the license key, then the lookup(s). The `lookup` function takes two parameters: `ip` (the IPv4 or IPv6 address) and `callback`.

The `callback` function takes these two parameters: first `err` then `data`. In case of a problem `err` is an `instanceof Error` with all related information. When everything is good, `err` is *null* and `data` contains the *object* with geo data.


```js
var geoip = require('geoipcity')

geoip.settings.license = 'licenseKey'

geoip.lookup( '8.8.8.8', function( err, data ) {
	if( !err ) {
		console.log( data.city )
		console.log( data.latitude +', '+ data.longitude )
	} else {
		console.log( err )
		console.log( err.stack )
	}
})
```


### Example

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


Error handling
--------------

The `err` parameter in the callback function can return these errors. Some have additional properties.

### Errors

	Error: No license         You did not specify your license key.
	Error: Invalid IP         The provided IP address is invalid.
	Error: Request failed     The request can't be made.
	Error: HTTP error         The API return a HTTP error.
	Error: No response        The API did not return data.
	Error: Invalid response   The API returned invalid data.
	Error: Disconnected       The API closed the connection too early.
	Error: API error          The API return an error.

### Additional properties

	.details       ie. IP_NOT_FOUND
	.httpCode      ie. 404
	.httpHeaders   Object with response headers
	.request       Object with request details
	.response      Response body


## Unlicense

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
