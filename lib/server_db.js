var level_up = require('levelup')
  , through = require('through')
  , db = level_up('./mydb', {valueEncoding: 'json'})

module.exports = db
