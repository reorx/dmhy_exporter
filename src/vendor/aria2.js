/*
polygoat
https://github.com/sonnyp/polygoat

ISC License

Copyright (c) 2016, Sonny Piers sonny@fastmail.net

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

;(function (global) {
  'use strict'

  function polygoat (fn, cb, Promise) {
    if (typeof cb === 'function') {
      fn(cb)
    } else {
      var P = Promise || global.Promise
      return new P(function (resolve, reject) {
        fn(function (err, res) {
          if (err !== null && err !== undefined) {
            reject(err)
          } else {
            resolve(res)
          }
        })
      })
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = polygoat
  } else {
    window.polygoat = polygoat
  }
}(typeof global !== 'undefined' ? global : this))


/*
aria2.js
https://github.com/sonnyp/aria2.js

ISC License
Copyright (c) 2015, Sonny Piers sonny@fastmail.net

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

;(function (global) {
  'use strict'

  var WebSocket = global.WebSocket
  var fetch = global.fetch
  var pg = global.polygoat

  var Aria2 = function (opts) {
    /*
     opts:
      - url: http://<host>:<port>/<path>
      - ws_url: ws://<host>:<port>/<path>
      - secret
     */
    this.callbacks = Object.create(null)
    this.lastId = 0

    for (var i in Aria2.options) {
      this[i] = typeof opts === 'object' && i in opts ? opts[i] : Aria2.options[i]
    }
  }

  Aria2.prototype.http = function (m, fn) {
    var that = this
    var content = {
      method: m.method,
      id: m.id
    }

    if (Array.isArray(m.params) && m.params.length > 0) {
      content.params = m.params
    }

    var url = this.url;
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(content),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }})
      .then(function (res) {
        return res.json()
      })
      .then(function (msg) {
        that._onmessage(msg)
      })
      .catch(fn)
  }

  Aria2.prototype.send = function (method /* [,param] [,param] [,...] [, fn] */) {
    var params = Array.prototype.slice.call(arguments, 1)
    var cb = typeof params[params.length - 1] === 'function' ? params.pop() : null
    return this.exec(method, params, cb)
  }

  Aria2.prototype.exec = function (method, parameters, cb) {
    if (typeof method !== 'string') {
      throw new TypeError(method + ' is not a string')
    }

    if (method.indexOf('system.') !== 0 && method.indexOf('aria2.') !== 0) {
      method = 'aria2.' + method
    }

    var m = {
      'method': method,
      'json-rpc': '2.0',
      'id': this.lastId++
    }

    var params = this.secret ? ['token:' + this.secret] : []
    if (Array.isArray(parameters)) {
      params = params.concat(parameters)
    }

    if (params.length > 0) m.params = params

    this.onsend(m)

    var that = this

    // send via websocket
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(m))
    // send via http
    } else {
      this.http(m, function (err) {
        that.callbacks[m.id](err)
        delete that.callbacks[m.id]
      })
    }

    return pg(function (done) {
      that.callbacks[m.id] = done
    }, cb)
  }

  Aria2.prototype._onmessage = function (m) {
    this.onmessage(m)

    if (m.id !== undefined) {
      var callback = this.callbacks[m.id]
      if (callback) {
        if (m.error) {
          callback(m.error)
        } else {
          callback(null, m.result)
        }
        delete this.callbacks[m.id]
      }
    } else if (m.method) {
      var n = m.method.split('aria2.')[1]
      if (n.indexOf('on') === 0 && typeof this[n] === 'function' && Aria2.notifications.indexOf(n) > -1) {
        this[n].apply(this, m.params)
      }
    }
  }

  Aria2.prototype.open = function (fn) {
    var url = this.ws_url;
    var socket = this.socket = new WebSocket(url)
    var that = this
    var called = false

    socket.onclose = function () {
      that.onclose()
    }
    socket.onmessage = function (event) {
      that._onmessage(JSON.parse(event.data))
    }

    return pg(function (done) {
      socket.onopen = function () {
        if (!called) {
          done()
          called = true
        }
        that.onopen()
      }
      socket.onerror = function (err) {
        if (!called) {
          done(err)
          called = true
        }
      }
    }, fn)
  }

  Aria2.prototype.close = function (fn) {
    var socket = this.socket
    return pg(function (done) {
      if (!socket) {
        done()
      } else {
        socket.addEventListener('close', function () {
          done()
        })
        socket.close()
      }
    }, fn)
  }

  // https://aria2.github.io/manual/en/html/aria2c.html#methods
  Aria2.methods = [
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.addUri
    'addUri',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.addTorrent
    'addTorrent',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.addMetalink
    'addMetalink',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.remove
    'remove',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.forceRemove
    'forceRemove',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.pause
    'pause',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.pauseAll
    'pauseAll',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.forcePause
    'forcePause',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.forcePauseAll
    'forcePauseAll',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpause
    'unpause',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.unpauseAll
    'unpauseAll',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStatus
    'tellStatus',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getUris
    'getUris',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getFiles
    'getFiles',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getPeers
    'getPeers',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getServers
    'getServers',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellActive
    'tellActive',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellWaiting
    'tellWaiting',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.tellStopped
    'tellStopped',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.changePosition
    'changePosition',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeUri
    'changeUri',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getOption
    'getOption',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeOption
    'changeOption',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getGlobalOption
    'getGlobalOption',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.changeGlobalOption
    'changeGlobalOption',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getGlobalStat
    'getGlobalStat',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.purgeDownloadResult
    'purgeDownloadResult',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.removeDownloadResult
    'removeDownloadResult',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getVersion
    'getVersion',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.getSessionInfo
    'getSessionInfo',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.shutdown
    'shutdown',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.forceShutdown
    'forceShutdown',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.saveSession
    'saveSession',
    // https://aria2.github.io/manual/en/html/aria2c.html#system.multicall
    'system.multicall',
    // https://aria2.github.io/manual/en/html/aria2c.html#system.listMethods
    'system.listMethods',
    // https://aria2.github.io/manual/en/html/aria2c.html#system.listNotifications
    'system.listNotifications'
  ]

  // https://aria2.github.io/manual/en/html/aria2c.html#notifications
  Aria2.notifications = [
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadStart
    'onDownloadStart',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadPause
    'onDownloadPause',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadStop
    'onDownloadStop',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadComplete
    'onDownloadComplete',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onDownloadError
    'onDownloadError',
    // https://aria2.github.io/manual/en/html/aria2c.html#aria2.onBtDownloadComplete
    'onBtDownloadComplete'
  ]

  Aria2.events = [
    'onopen',
    'onclose',
    'onsend',
    'onmessage'
  ]

  Aria2.options = {
    'url': 'http://localhost:6800/jsonrpc',
    'ws_url': 'http://localhost:6800/jsonrpc',
    'secret': '',
  }

  Aria2.methods.forEach(function (method) {
    var sufix = method.indexOf('.') > -1 ? method.split('.')[1] : method
    Aria2.prototype[sufix] = function (/* [param] [,param] [,...] */) {
      return this.send.apply(this, [method].concat(Array.prototype.slice.call(arguments)))
    }
  })

  Aria2.notifications.forEach(function (notification) {
    Aria2.prototype[notification] = function () {}
  })

  Aria2.events.forEach(function (event) {
    Aria2.prototype[event] = function () {}
  })

  global.Aria2 = Aria2
}(this))
