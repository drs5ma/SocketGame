
var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);

//server_positions = { {timestamp:, THREE.Vector3:}, {timestamp:, THREE.Vector3:} }
//this gets updated and is concurrent wiht the server ON client connect.
//do we need to update this after connect? idont think so i think just
//updating players will be sufficient
var server_positions = {};


var my_unique_id;
var my_start_position = new THREE.Vector3( 0, 1, 0 );


function send_server_move(displacement){
  var sendobj = {'msg':'client_move','content':{'timestamp':my_unique_id , 'displacement': displacement  }};
  ws.send(JSON.stringify( sendobj ));
}



ws.onopen = function(){
  my_unique_id =  Date.now();
  ws.send( JSON.stringify(  {'msg':'client_join', 
                             'content':{'timestamp':my_unique_id,
                                        'position':my_start_position,
                                        'color':my_color}}  ));
};


ws.onmessage = function (event) {
  var jsonobj = JSON.parse(event.data);
  var msg = jsonobj.msg;
  var content = jsonobj.content;

  if (msg == 'send_userlist'){
    server_positions = content.userlist;
    for (var i in server_positions){
      var timestamp = i;
      var position = server_positions[i];
      //add all users logged in except myself
      if(timestamp != my_unique_id){


        var params = { 
          position: position, 
          color: {r:1.0,g:0.0,b:0.0}
        };


        add_cube(timestamp, params);
      }
    }
  }
  else if(msg == 'broadcast_join'){

    // var params = { 
    //       position: conten.params.position, 
    //       color: {r:1.0,g:0.0,b:0.0}
    // };


    add_cube(content.timestamp, content);
  }
  else if(msg=='broadcast_move'){
    var new_position = move_cube(content.timestamp, content.displacement);
  }
  else if(msg == 'broadcast_leave'){
    remove_cube(content.timestamp);
  }
  else{
    //console.log("msg type unsupported")
    // var timestamp = parseInt(jsonobj.content);
    // var tone = (timestamp%1000)/(1000.0);
    // color = new THREE.Color( tone, tone, tone );;
  }
};


