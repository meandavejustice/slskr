var through = require('through')
var rusha = require('../public/js/lib/git-object-hash/vendor/rusha') // grab this from github.com/chrisdickinson/git-object-hash

files(document.body)
  .pipe(dbPrep())
  .pipe(dbWrite(db))

function dbPrep() {
  var stream = through(write)
  var sha = new rusha()
  return stream

  function write(files) {
    files.forEach(function(file) {
      var reader = new FileReader
      reader.onload = function(buf) {
        var hash = sha.digestFromArrayBuffer(buf)
        stream.queue({
           key: hash
         , value: buf
        })
        stream.queue({
           key: hash + ':meta'
         , value: {name: file.name, size: file.size}
        })
      }
    })
  }
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

function dbWrite(db) {
  var stream = through(write)

  return stream

  function write(kv) {
    db.put(kv.key, kv.value, function(err, data) {
      if(err) console.error(err)
    })
  }
}
