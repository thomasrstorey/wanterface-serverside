//client.js

var net = require('net');

var HOST = '192.168.56.1';
var PORT = 8124;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    var lnlt = "29.6,-82.3"
    var buffer = new Buffer(lnlt, encoding='utf8');
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write(buffer);

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
    console.log('DATA: ' + data);
    // Close the client socket completely
    client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});