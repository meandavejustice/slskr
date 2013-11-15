var db = require('./server_db')
  , now = Math.floor(Date.now()/1000)
  , browsers = ['chrome', 'firefox']

for (var i = 0; i < 10000; i++) {
  data = {
    'last_seen': (now-(i*5))
  , 'browser': browsers[Math.floor(Math.random() * 2)]
  }
  db.put('User' + i, data, function(err){
    if (err) {
      console.error('ohshit: ' + err)
    }
  })
  console.log(i + ': ' + JSON.stringify(data))
}
