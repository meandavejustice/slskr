var through = require('through')
  , offline = (Math.floor(Date.now()/1000))-300

module.exports = {
  last_seen_filter: last_seen_filter
, online_filter: online_filter
, browser_filter: browser_filter
}

function last_seen_filter(since) {
  since = since || offline

  return through(write, end)

  function write(data) {
    if (data.value.last_seen > since) {
      this.queue(data)
    }
      
  }
  function end() {
    this.queue(null)
  }
}

function online_filter() {
  var added = []
    , removed = []

  return through(write, end)

  function write(data) {
    if (data.value.last_seen > offline) {
      added.push(data.key)
    } else {
      removed.push(data.key)
    }
  }
  function end() {
    this.queue({added: added, removed: removed})
    this.queue(null)
  }
}

function browser_filter(browser) {
  return through(write)

  function write(data) {
    if (data.value.browser === browser) {
      this.queue(data)
    }
  }
}

function self_filter(id) {
  return through(write)

  function write(data) {
    if (id !== data.key) {
      this.queue(data)
    }
  }
}