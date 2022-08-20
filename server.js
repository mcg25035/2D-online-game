 
var net = require("net")
var player_list = {}

class player_manager{
  constructor(socket_manager,id){
    this.online = false
    this.id = id
    this.x = 0
    this.y = 0
    this.hp = 20
    this.power = 100
    this.socket = socket_manager
  }
}

class socket_manager{
  constructor(socket){
    this.socket = socket
    this.player = null
    this.send = this.send
    this.close = this.close
    this.recv = this.recv
    //this.socket.on("data",this.recv)
  }
  send(data){
    this.socket.write(data+"\n")
  }
  close(){
    this.player.online = false
    this.status = false
    this.socket.destroy()
    var keys = Object.keys(player_list)
    for (var i=0;i<keys.length;i++){
      if (player_list[keys[i]].online){
        player_list[keys[i]].socket.send("remove_player;"+this.player.id)
      }
    }
    console.log("player disconnected | "+this.player.id.toString())
    
  }
  recv(data){
    if (data.toString() == "REGNEWID"){
      var id_for_this_client = Math.random().toString().slice(2,)
      while (player_list[id_for_this_client]){
        id_for_this_client = Math.random().toString().slice(2,)
      }
      this.player = new player_manager(this,id_for_this_client)
      player_list[id_for_this_client] = this.player
      this.send(id_for_this_client)
      console.log("player connected | "+id_for_this_client.toString())
    }
    else if(data.toString().split(";").length = 4){
        var keys = Object.keys(player_list)
        var send_data = {"x":this.player.x,"y":this.player.y,"id":this.player.id}
        if ((data.toString().split(";")[0] == "set_position")&&(player_list[data.toString().split(";")[1]])){
            player_list[data.toString().split(";")[1]].x = data.toString().split(";")[2]
            player_list[data.toString().split(";")[1]].y = data.toString().split(";")[3]

            if (!player_list[data.toString().split(";")[1]].online){      
                var keys = Object.keys(player_list)
                for (var i=0;i<keys.length;i++){
                    if (player_list[keys[i]].online){
                        player_list[keys[i]].socket.send("create_player;"+this.player.id)
                        this.send("create_player;"+player_list[keys[i]].id)
                    }
                }
                player_list[data.toString().split(";")[1]].online = true
            }

            for (var i=0;i<keys.length;i++){
                if (player_list[keys[i]].online){
                  player_list[keys[i]].socket.send("set_player_position;"+JSON.stringify(send_data))
                }
            }
        }
        if ((data.toString().split(";")[0] == "attack")&&(player_list[data.toString().split(";")[1]])){
          console.log("attack!")
            for (var i=0;i<keys.length;i++){
                if (player_list[keys[i]].online){
                    var target = player_list[keys[i]]
                    if (((this.player.x-target.x)**2+(this.player.y-target.y)**2)**0.5 <= 32 && target.id != this.player.id){
                        target.hp -= 4
                        target.socket.send("damage;"+this.player.x.toString()+";"+this.player.y.toString())
                    }
                }
            }
        }
        console.log(data.toString())

    }
  }
}

var on_new_connection = function(socket){
    console.log("a")
    //convert this pointer point to class socket manager
  var sockmgr = new socket_manager(socket)
  var class_bridge = function(data){
    sockmgr.recv(data)
  }
  var class_bridge2 = function(data){
    sockmgr.close(data)
  }
  //socket.on("end",class_bridge2)
  socket.on("error",class_bridge2)
  socket.on("data",class_bridge)
}
var server = net.createServer(on_new_connection)
server.listen(3008)

