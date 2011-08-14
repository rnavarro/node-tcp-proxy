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
	winston = require('winston'),
	settings = require('./settings');
	
var backends = [],
	started = false;

// This is our primary backend loop, it checks all the backends every 'check_interval'
var startChecks = exports.startChecks = function() {
	for(var i in backends) {
		isAvailable(i);
	}
	started = true;
	setTimeout(startChecks,settings.check_interval);
}

var addBackend = exports.addBackend = function(host, port, weight, monitor_port) {
	backends.push({
		'host': host,
		'port': port,
		'status': 0,
		'weight': weight || 0,
		'monitor_port': monitor_port || port
	});
	if(started) {
		winston.log('info','['+new Date()+'] Added Backend - '+host+':'+port);
	}
}

exports.addManyBackends = function(data) {	
	for (var i in data) {
		addBackend(data[i].host, data[i].port, data[i].weight, data[i].monitor_port)
	}
}

exports.removeBackend = function(id) {
	var b = backends[id];
	backends.splice(id);
	if(started) {
		winston.log('info','['+new Date()+'] Removed Backend - '+b.host+':'+b.port);
	}
}

// This just returns our entire backends object
exports.getBackends = function() {
	return backends;
}

// This returns a singular, random, highly weighted backend
var getWeightedBackend = exports.getWeightedBackend = function() {
	var weightedBackends = [];
	var maxWeight = 0;
	
	// Figure out what our heaviest server weight is
	for(var i in backends) {
		if(backends[i].weight > maxWeight) {
			maxWeight = backends[i].weight;
		}
	}
	
	// Separate our highest weighted backends	
	while((weightedBackends.length == 0) && (maxWeight > -1)) {
		for(var i in backends) {
			if(backends[i].weight == maxWeight && backends[i].status == 1) {
				weightedBackends.push(backends[i]);
			}
		}
		maxWeight -= 1;
	}

	// Randomly choose a separated, highly weighted backend
	var rand = Math.floor(Math.random() * weightedBackends.length);
	return weightedBackends[rand];
}

// This checks to see if a particular backend is available
function isAvailable(id) {
	var backend = backends[id];
	var options = {
		host: backend.host,
		port: backend.monitor_port,
		path: '/',
	};
	
	// This creates our actual http request
	var req = http.get(options);
	
	// This is our request timeout, as of 0.4.10 nodejs hardcodes this to 2m
	// We set our timeout to 80% of the check interval to prevent socket hang up errors
	var tID = setTimeout(function() {req.emit("timeout");}, settings.check_interval*.8);
	
	req.on('response', function(res) {
		clearTimeout(tID);
		
		if(res.statusCode == 200) {
			if(backend.status == 0) {
				winston.log('info','['+new Date()+'] Backend has recovered! - '+backend.host+':'+backend.monitor_port);
			}
			backend.status = 1;
		} else {
			if(backend.status == 1) {
				winston.log('warn','['+new Date()+'] Warning! Backend has failed! - '+backend.host+':'+backend.monitor_port);
			}
			backend.status = 0;
		}
	});
	
	req.on('timeout', function() {
		clearTimeout(tID); // I don't think this is required since we abort below...but lets just be safe
		
		// Abort this request so we don't have a huge queue of outgoing requests
		req.abort();
		if(backend.status == 1) {
			winston.log('warn','['+new Date()+'] Warning! Backend has failed! - '+backend.host+':'+backend.monitor_port);
		}
		backend.status = 0;
	});
	
	req.on('error', function(socketException){
		if (socketException.errno === 61 /*ECONNREFUSED*/) {
		    winston.log('warn','ECONNREFUSED: connection refused to '
		        +req.socket.host
		        +':'
		        +req.socket.port);
		} else {
		    winston.log(socketException);
		}
	});
	/* Debug Crap
	req.on('error', function(res) {
		console.log('error');
		console.log(res);
		console.log(req);
	});
	
	req.on('close', function(res) {
		console.log('close');
		console.log(res);
		console.log(req.agent.options);
	});
	
	req.on('end', function(res) {
		console.log('end');
		console.log(res);
		console.log(req.agent.options);
	});*/
}
