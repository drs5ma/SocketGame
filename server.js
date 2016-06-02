var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var router = express.Router();
var path = require('path');

var Clients = {};//= {timestamp:position, timestamp:position}



//routing
app.use(express.static(__dirname + "/"))
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/client.html'));
});

//start server
var server = http.createServer(app)
server.listen(port)
console.log("http server listening on %d", port)


//create web socket
var wss = new WebSocketServer({server: server})
console.log("websocket server created")


wss.broadcast = function(data) {
	for (var i in this.clients){
		this.clients[i].send(data);
	}
};




wss.on("connection", function(ws) {

	console.log("websocket connection open")

	ws.on('message', function incoming(message){

		var jsonobj = JSON.parse(message);
		var msg = jsonobj.msg;
		var content = jsonobj.content;

		if(msg == 'client_join'){
			//console.log('server received client_join from %s', content.timestamp);
			ws.send(JSON.stringify(  {'msg':'send_userlist',  'content':{'userlist': Clients}    }));
			Clients[content.timestamp] = content.position;
			//content = { timestamp: , position: }
			wss.broadcast(JSON.stringify(  {'msg':'broadcast_join',  'content':content}   ));
			//send the client a full list of online clients and thier positions
			//on a client join, save its unique timestamp it created;
			ws.timestamp = content.timestamp;
			//broadcast to to every client that this client A has joined  (client A willl also get this)
			//add the client info to central server object: client
		}
		else if(msg == 'client_move'){

			//console.log('server received client_move from %s', content.timestamp);
			//content = { timestamp: , position: }
			//send to every client that this client has moved to position 
			wss.broadcast(JSON.stringify(  {'msg':'broadcast_move',  'content':content}   ));
			//record in the central server the new position of this client
			Clients[content.timestamp].x += content.displacement.x;
			Clients[content.timestamp].y += content.displacement.y;
			Clients[content.timestamp].z += content.displacement.z;

		}
		else{
			console.log('message type not supported');
		}
	});

	var id = setInterval(function() {
		ws.send(JSON.stringify( {'msg':'server_time', 'content':{'thetime':Date.now()}  }));
		//wss.broadcast(JSON.stringify(  {'msg':'','content':{'':}}} ));
	}, 100);

  	ws.on("close", function() {
    	console.log("websocket connection close");
    	//broadvast to all that this timestamp is leaving the game
    	wss.broadcast(JSON.stringify( {'msg':'broadcast_leave',  'content':{'timestamp':ws.timestamp}}  ));
    	//remove this timestamp from the central server clients object
    	//stop the useless interval broadcast that i might use later
    	delete Clients[ws.timestamp];
    	clearInterval(id);
 	});


})
