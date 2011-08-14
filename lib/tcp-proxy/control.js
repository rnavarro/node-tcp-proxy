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
var http = require('http'),
	net = require('net'),
	settings = require('./settings'),
	backends = require('./backends');

var oldUmask = process.umask(0000);
net.createServer(function(socket) {
	socket.setEncoding('utf8');
	socket.on('data', function(data) {
		data = JSON.parse(data);
		
		switch(data[0]) {
			case 'list':
				sendResponse({
					'success': true,
					data: backends.getBackends()
				});
				break;
			case 'add':
				for (var i in data.host) {
					backends.addBackend(data.host[i], data.port, data.weight, data.monitor_port)
				}
				sendResponse({'success':true});
				break;
			case 'remove':
				for (var i in data.id) {
					backends.removeBackend(data.id[i]);
				}
				sendResponse({'success':true});
				break;
			default:
				sendResponse({'success':false});
				socket.end();
				break;
		}
	});
	
	function sendResponse(data) {
		data = JSON.stringify(data);
		socket.write(data);
		socket.end();
	}
}).listen('/var/run/nodeSQL-proxy/nodeSQL-proxy.sock', function() {
	process.umask(oldUmask);
});
