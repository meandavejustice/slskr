var peer = require('peer')
var conn;

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id)
})


peer.on('connection', function(conn) {
  console.log('conn')
  conn = conn;
})

conn.on('open', function() {
  // Receive messages
  conn.on('data', function(data) {
    console.log('Received', data);
  });

  // Send messages
  conn.send('Hello!');
});

// conn.send({
//   strings: 'hi!',
//   numbers: 150,
//   arrays: [1,2,3],
//   evenBinary: new Blob([1,2,3]),
//   andMore: {bool: true}
// }); 

