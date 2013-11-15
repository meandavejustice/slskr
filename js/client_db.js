var levelup = require('levelup')
var leveljs = require('leveljs')

var db = levelup('slsk', { db: leveljs })

module.exports = db
