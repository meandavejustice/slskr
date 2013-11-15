var through = require('through')
var rusha = require('./rusha')
var ui = require('./ui')
var db = require('./client_db');

window.db = db;
var db = window.db

files(document.body)
  .pipe(dbPrep())
  .pipe(dbWrite(db))

$(document).on('new-file', function(ev, data) {
  var json = ui.getJSON(data)
  ui.newFile(json)
})

//onremove
// .pipe()

function dbPrep() {
  var stream = through(write)
  var sha = new rusha()
  return stream

  function write(files) {
    for(var i = 0; i < files.length; i++) {
      var file = files[i];
      readFile(file, stream, sha)
    }
  }
}

function readFile(file, stream, sha) {
  var reader = new FileReader()
  reader.onload = (function(file) {
    return function(buf) {
      buf = buf.target.result
      var hash = sha.digestFromArrayBuffer(buf)
      stream.queue({
        key: hash
        , value: new Uint8Array(buf)
      })
      stream.queue({
        key: hash + ':meta'
        , value: {name: file.name, size: file.size}
      })
    }
  })(file)
  reader.readAsArrayBuffer(file)
}

function files(el) {
  var stream = through()
  el.addEventListener('dragenter', ignore, false)
  el.addEventListener('dragover', ignore, false)
  el.addEventListener('drop', grab, false)

  return stream

  function grab(ev) {
    ignore(ev)
    if(!ev.dataTransfer || !ev.dataTransfer.files || !ev.dataTransfer.files.length) {
      return 0
    }

    stream.queue(ev.dataTransfer.files)
  }

  function ignore(ev) {
    ev.stopPropagation()
    ev.preventDefault()
  }
}

function getIndex(db, cb) {
  var stream = through()
  db.get('index', function(err, value) {
    if (value !== undefined) {
      for(var i = 0; i < value.length; i++) {
        stream.queue(value[i])
      }
      stream.queue(null)
    }
  })
  return stream
}

function updateIndex(db, kv) {
  var index = [];
  db.get('index', function(err, value) {
    if (value !== undefined) {
      index = value;
    }
    if (index.indexOf(kv.key) === -1) {
      index.push(kv.key)
      db.put('index', index, function(err, data) {
        if(err) console.error(err)
      })
    }
  })
}

function dbWrite(db) {
  var stream = through(write)
  
  return stream

  function write(kv) {
    db.put(kv.key, kv.value, function(err, data) {
      if(err) console.error(err)
    })
    if (kv.key.indexOf(':meta') === -1) {
      updateIndex(db, kv)
    } else {
      $(document).trigger('new-file', kv)
    }
  }
}

function getFileMeta(db) {
  var stream = through(write, end)
  var pending = 0
  var ended
  return stream
  function write(data) {
    ++pending
    db.get(data + ":meta", function(err, value) {
      if (value) {
        stream.queue(value)
      }
      --pending

      if (!pending && ended) {
        stream.queue(null)
      }
    })
  }

  function end() {
    ended = true
    if (!pending) {
      stream.queue(null)
    }
  }
}

function dbDelete(db) {
  var stream = through(remove)

  return stream

  function remove(key) {
    db.del(key, function(err, data) {
      if (err) console.error(err)
    })
    var index = [];
    db.get('index', function(err, value) {
      index = value
      var keyLocation = index.indexOf(key)
      if (keyLocation !== -1) {
        index.splice(i, 1)
        db.put('index', index, function(err, data) {
          if (err) console.error
        })
      }
    })
  }
}

(function bootstrap() {
  getIndex(db)
    .pipe(getFileMeta(db))
    .on('data', function(file) {
      $(document).trigger('new-file', file)
    })
})()

