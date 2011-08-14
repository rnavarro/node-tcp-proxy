### Features

* Reverse proxies incoming tcp streams
* Monitors backend hosts for availability, balances between them
* Minimal request overhead and latency
* Written entirely in Javascript
* Easy to use API

### When to use node-tcp-proxy

Let's suppose you were running multiple http application servers, and all of these app servers need to connect to some sort of database. Well unfortunately(fortunately?) you're lazy like me and don't want to throw up another haproxy instance. So instead you setup node-tcp-proxy on each of the app servers to proxy database requests to multiple HA configured backends. The app server connects to its locally hosted node-tcp-proxy which watches the backend servers for availability and brokers the connection to a randomly chosen, available backend.

### Installing npm (node package manager)

```curl http://npmjs.org/install.sh | sh```

### Installing node-tcp-proxy

```npm install tcp-proxy```

## Using node-tcp-proxy

There are several ways to use node-tcp-proxy; the library is designed to be flexible so that it can be used by itself, or in conjunction with other node.js libraries / tools.

See the [examples] for working sample code.

Invoke it like so:

```node-tcp-proxy --help```

## Using node-tcp-proxy from the command line
When you install this package with npm, a node-tcp-proxy binary will become available to you. Using this binary is easy with some simple options:

```node-tcp-proxy --help
usage: node-tcp-proxy <command> [options]
command one of : add,remote,list```

## Why doesn't node-tcp-proxy have more advanced features like x, y, or z?

If you have a suggestion for a feature currently not supported, feel free to open a [support issue][2]. node-tcp-proxy is designed to just proxy tcp requests from one server to another.

### License

(The MIT License)

Copyright (c) 2010 Charlie Robbins, Mikeal Rogers, Fedor Indutny, & Marak Squires

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

[1]: https://github.com/rnavarro/node-tcp-proxy/tree/master/examples
[2]: http://github.com/nodejitsu/node-http-proxy/issues
