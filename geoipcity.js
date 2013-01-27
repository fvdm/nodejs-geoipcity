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

var http = require('http'),
    app = {}


// settings
app.settings = {
	apihost:	'geoip3.maxmind.com',
	apiport:	80,
	license:	''
}

// do lookup
app.lookup = function( ip, callback ) {
	
	// check license
	if( typeof app.settings.license !== 'string' || app.settings.license === '' ) {
		callback( new Error('No license') )
		return
	}
	
	// check IP
	if( ! ip.match( /^[0-2]?[0-5]?[0-5]\.[0-2]?[0-5]?[0-5]\.[0-2]?[0-5]?[0-5]\.[0-2]?[0-5]?[0-5]$/ ) ) {
		callback( new Error('Invalid IP') )
		return
	}
	
	// build request
	var options = {
		host: app.settings.apihost,
		port: app.settings.apiport,
		path: '/f?l='+ app.settings.license +'&i='+ ip,
		method: 'GET'
	}
	
	var request = http.request( options )
	
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
				data = app.parseResult( ip +','+ data )
				if( !data ) {
					var err = new Error('Invalid response')
					err.httpCode = response.statusCode
					err.httpHeaders = response.headers
					err.request = options
					err.response = data
					callback( err )
				} else {
					callback( null, data )
				}
			}
		})
		
		response.on( 'close', function() {
			callback( new Error('Disconnected') )
		})
	})
	
	// complete request	
	request.end()
}

// parse csv data to object
app.parseResult = function( str ) {
	var result = {}
	var head = ['target', 'countryCode', 'regionCode', 'city', 'postalCode', 'latitude', 'longitude', 'metroCode', 'areaCode', 'isp', 'org', 'extra']
	var str = str.split(',')
	
	// check values
	if( str.length < 11 || str.length > 12 ) {
		return false
	}
	
	// process
	for( i=0; i<str.length; i++ ) {
		if( str[i].substr(0,1) == '"' && str[i].substr(-1,1) == '"' ) {
			str[i] = str[i].substr( 1, str[i].length -2 )
		}
		result[ head[i] ] = str[i]
	}
	
	// done
	return result
}

// ready
module.exports = app
