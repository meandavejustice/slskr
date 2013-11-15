module.exports = api_handler

var concat = require('concat-stream')
  , through = require('through')
  , filters = require('./filters')
  , db = require('./server_db')


function concator() {
  return concat(function (data){
    return data.toString()
  })
}

function api_handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.write('This endpoint is POST only.')
    res.end()
  }

  req.pipe(concator())
    .pipe(through(function write(data) {
      data = JSON.parse(data)
      db.put(data.id, {
        last_seen: Date.now()
      , browser: data.browser
      }, function(err) {
        if (err) {
          console.error('ohshit: ' + err)
        }
      })
      db.readStream()
        .pipe(filters.last_seen_filter(data.since))
        .pipe(filters.browser_filter(data.browser))
        .pipe(filters.self_filter(data.id))
        .pipe(filters.online_filter())
        .pipe(through(function write(data) {
          this.queue(JSON.stringify({
            update_by: 300000
          , current_time: Date.now() 
          , added: {
              count: data.added.length
            , clients: data.added
            }
          , removed: {
              count: data.removed.length
            , clients: data.removed
            }
          }))
        }))
        .pipe(res)
  }))
    
}