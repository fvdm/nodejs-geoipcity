/*
Name:         geoipcity
Description:  Lookup details for an IP using the Maxmind GeoIP City webservice.
Source:       https://github.com/fvdm/nodejs-geoipcity
Feedback:     https://github.com/fvdm/nodejs-geoipcity/issues
License:      Unlicense / Public Domain

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
*/

var net = require('net'),
    app = {}


// settings
app.settings = {
	apihost:	'geoip.maxmind.com',
	apiproto:	'http',
	license:	''
}

// service fields
app.serviceFields = function( service ) {
	switch( service ) {
		case 'omni':
			return [
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
		break
		case 'country':
			return [
				'target',
				'country',
				'extra'
			]
		break
		case 'city':
			return [
				'target',
				'countryCode',
				'regionCode',
				'city',
				'latitude',
				'longitude',
				'extra'
			]
		break
		case 'cityisporg':
			return [
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
		break
		default:
			return false
		break
	}
}

// do lookup
app.lookup = function( ip, service, callback ) {
	
	if( typeof service === 'function' ) {
		var callback = service
		var service = 'cityisporg'
	}
	
	// check service
	var serviceHead = app.serviceFields( service )
	if( ! serviceHead ) {
		callback( new Error('Invalid service') )
		return
	}
	
	// check license
	if( typeof app.settings.license !== 'string' || app.settings.license === '' ) {
		callback( new Error('No license') )
		return
	}
	
	// check IP
	if( net.isIP( ip ) == 0 ) {
		callback( new Error('Invalid IP') )
		return
	}
	
	// build request
	var options = {
		host: app.settings.apihost,
		path: '/f?l='+ app.settings.license +'&i='+ ip,
		method: 'GET'
	}
	
	if( app.apiproto === 'https' ) {
		var request = require('https').request( options )
	} else {
		var request = require('http').request( options )
	}
	
	// request failed
	request.on( 'error', function( error ) {
		var err = new Error('Request failed')
		err.request = options
		err.details = error
		callback( err )
	})
	
	// process response
	request.on( 'response', function( response ) {
		var data = ''
		
		response.on( 'data', function( ch ) { data += ch })
		
		response.on( 'end', function() {
			data = data.toString('utf8').trim()
			
			if( response.statusCode >= 300 ) {
				var err = new Error('HTTP error')
				err.httpCode = response.statusCode
				err.httpHeaders = response.headers
				err.request = options
				err.response = data
				callback( err )
			} else if( data === '' ) {
				var err = new Error('No response')
				err.httpCode = response.statusCode
				err.httpHeaders = response.headers
				callback( err )
			} else {
				data = app.parseResult( ip +','+ data, serviceHead )
				if( data instanceof Error ) {
					data.httpCode = response.statusCode
					data.httpHeaders = response.headers
					data.request = options
					callback( data )
				} else {
					callback( null, data )
				}
			}
			
			return
		})
		
		response.on( 'close', function() {
			callback( new Error('Disconnected') )
			return
		})
	})
	
	// complete request	
	request.end()
}

// parse csv data to object
app.parseResult = function( str, head ) {
	var result = {}
	var str = str.split(',')
	
	// check values
	if( str.length < head.length -1 || str.length > head.length ) {
		return new Error('Invalid response')
	}
	
	// API error
	var error = str[ head.length -1 ] || false
	if( typeof error === 'string' && error.match( /^[A-Z_]+$/ ) ) {
		var err = new Error('API error')
		err.details = error
		return err
	}
	
	// process
	for( i=0; i<str.length; i++ ) {
		if( str[i].match( /^".*"$/ ) ) {
			str[i] = str[i].slice(1, -1)
		}
		result[ head[i] ] = str[i]
	}
	
	// done
	return result
}

// ready
module.exports = app
