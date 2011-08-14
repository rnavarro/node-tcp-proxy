/*
  tcp-proxy: A node.js TCP proxy [for mysql]

  Copyright (c) 2011 Robert Navarro <crshman@gmail.com>

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
var net = require('net'),
	winston = require('winston'),
	backends = require('./tcp-proxy/backends'),
	proxy = require('./tcp-proxy/proxy'),
	control = require('./tcp-proxy/control')
	util = require('./tcp-proxy/util'),
	settings = require('./tcp-proxy/settings');
	

var settings = exports.settings = {
	'log_file': '/var/log/node-tcp-proxy.log'
}

exports.createServer = function() {
	var args = Array.prototype.slice.call(arguments);
	
	args.forEach(function (arg) {
		switch (typeof arg) {
			case 'string': settings.listen_address = arg; break;
			case 'number': settings.listen_port = arg; break;
			case 'object':
				settings = util.merge_objects(arg, settings);
				break;
		}
	});
	
	// Setup our log file location
	winston.add(winston.transports.File, {filename: settings.log_file});
	
	winston.log('info','['+new Date()+'] nodeSQL proxy server started on '+settings.listen_address+' port '+settings.listen_port);
	
	backends.startChecks(); // First check all the specified backends to see who is up and not
	
	// This fires up our listener
	var server = net.createServer(function (proxySocket) {
		var backend = backends.getWeightedBackend();
		if(backend) {
			proxy.new(proxySocket, backend);
		} else { // If we can't find a working backend error and close
			common.winston.log('warn','['+new Date()+'] Error! Could not find an available backend!');
			proxySocket.end();
		}
	}).listen(settings.listen_port, settings.listen_address);
};

exports.addManyBackends = backends.addManyBackends;
