var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var router = express.Router();
var path = require('path');


app.use(express.static(__dirname + "/"))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/client.html'));
});


var server = http.createServer(app)
server.listen(port)
console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")



wss.on("connection", function(ws) {


  var id = setInterval(function() {
		    ws.send(JSON.stringify(Date.now()), function() {  })
		  }, 100);


  console.log("websocket connection open")
  
  ws.on('message', function incoming(message){
	console.log('received: %s', message);
  });




  ws.on("close", function() {
    console.log("websocket connection close")
    clearInterval(id)
  });


})
