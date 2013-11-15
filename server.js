var http = require('http')
  , url_lib = require('url')
  , fs = require('fs')
  , PeerServer = require('peer').PeerServer
  , ecstatic = require('ecstatic')
  , api_handler = require('./lib/api')

function start() {
  var peer_server = new PeerServer({ port: 9000 })
    , listeners = peer_server._app.server.listeners('request')
    , is_production = (process.env.NODE_ENV === 'production')
    , port = (is_production ? 80 : 8000)

  peer_server.removeAllListeners('request')

  var server = http.createServer(function (req, res) {
    var url = url_lib.parse(req.url, true)
    if (/^\/$/.test(url.path)) {
      // index.html
      fs.createReadStream(__dirname + '/index.html').pipe(res)
    } else if (/^\/api\/v1\/clients$/.test(url.path)) {
      // API
      api_handler(req, res, url)
    } else if (/^\/public/.test(url.path)) {
      // Static files
      ecstatic({
        root: __dirname + '/public'
      , baseDir: 'public'
      , showDir: true
      , handleError: true
      })(req, res)
    } else {
      // This is PeerServer
      for(var i = 0, len = listeners.length; i < len; ++i) {
        listeners[i].call(this, req, res)
      }
    }
  }).listen(port, function(err) {
    if (err) {
      console.error(err)
      process.exit(-1)
    }

    // if run as root, downgrade to the owner of this file
    if (process.getuid() === 0) {
      require('fs').stat(__filename, function(err, stats) {
        if (err) { return console.error(err) }
        process.setuid(stats.uid)
      })
    }

    console.log('Server running at http://0.0.0.0:' + port + '/')
  })

  return server
}

if (require.main === module) {
  start()
}
