/*
	This module is COPYLEFT meaning you can do anything you want,
	except copyrighting it.
	
	For future reference, please include the source URL:
	http://github.com/fvdm/nodejs-geoipcity
*/

var http = require('http');
var EventEmitter = require('events').EventEmitter;

var app = new EventEmitter();

// settings
app.settings = {
	apihost:	'geoip3.maxmind.com',
	apiport:	80,
	license:	''
}

// do lookup
app.lookup = function( ip, callback ) {
	http.get(
		{
			host: app.settings.apihost,
			port: app.settings.apiport,
			path: '/f?l='+ app.settings.license +'&i='+ ip
		},
		function( result ) {
			result.setEncoding('utf8');
			result.on('data', function( data ) {
				var data = ip +','+ data.trim();
				callback( app.parseResult( data ) );
			});
		}
	);
}

// parse csv data to object
app.parseResult = function( str ) {
	var result = {};
	var head = ['target', 'countryCode', 'regionCode', 'city', 'postalCode', 'latitude', 'longitude', 'metroCode', 'areaCode', 'isp', 'org', 'extra'];
	var str = str.split(',');
	for( i=0; i<str.length; i++ ) {
		if( str[i].substr(0,1) == '"' && str[i].substr(-1,1) == '"' ) {
			str[i] = str[i].substr( 1, str[i].length -2 );
		}
		result[ head[i] ] = str[i];
	}
	return result;
}

// ready
module.exports = app;
