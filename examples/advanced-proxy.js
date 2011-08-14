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

var nodeproxy = require('../lib/tcp-proxy'),
	os = require('os');

//
// Advanced Mysql Proxy Server
//

var backends = [
{'host': 'host1.ca.example.com', 'port': 3306, 'weight': 0, 'monitor_port': 9200},
{'host': 'host2.ny.example.com', 'port': 3306, 'weight': 0, 'monitor_port': 9200}];

// Just some custom code to detect the closest server based on hostname
var hostname = os.hostname();
var splits = hostname.split('.');
var location = splits.reverse().slice(0,4).reverse();
if(location.length < 4) {
	location = 'ca.example.com';
} else {
	location = location.join('.');
}

var regex = new RegExp(location,'i');
for(var i in backends) {
	if(backends[i].host.search(regex) != -1) {
		backends[i].weight += 1;
	}
}

nodeproxy.addManyBackends(backends);
nodeproxy.createServer({
	'listen_address': '127.0.0.1',
	'listen_port': 3307,
	'log_file': '/var/log/tcp-proxy.log',
	'check_interval': 60000 // 1 minute
});
