var levelup = require('levelup')
var leveljs = require('leveljs')

window.db = levelup('slsk', { db: leveljs })

