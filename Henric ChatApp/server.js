const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')

const CONNECTION_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chat"
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


//const {CRooms} = require("./public/chatroom.js")
const {Chat} = require("./model/messages.js")


mongoose.connect(CONNECTION_URI, 
{
  useNewUrlParser:true
})

const PORT = process.env.PORT||3000;

var chatroomSchema = mongoose.Schema(
{
  /*  chatrooms: {
    chatroom1:{
        chatRoomName:String,
        users:{
          usernames:String
        }
     }
    },*/
    chatRoom: Object,
    //chatRoomName: String,
})


var CRooms = mongoose.model('Chatroom', chatroomSchema);

var rooms = { };
/*
CRooms.find({}, function(err,docs){
  if(err){
    console.log("Something went wrong in finding chatrooms")
    throw err
  }
  else{
     
  }
})
*/

app.get("/", (req, res) =>{
  res.render("landingPage.ejs", {
    rooms: rooms, 
  })

})

app.get("/exit", (req, res) => {
  res.render('Lobby.ejs', {
    rooms: rooms,
  })
})

app.get('/link-chatrooms', (req, res) => {

  // {_id:"5d5ece956030e0427020dbe4"}, 
 CRooms.find({},function(err,docs){
    if(err){
      console.log("Something went wrong in finding chatrooms")
      throw err
    } else {
                }
    })
    res.render('index', {
      rooms: rooms, 
      
    })
  
    var newRoom = new CRooms({chatRoom:rooms})
      newRoom.save(function(err){
          if(err)
            throw err;
            console.log(JSON.stringify(newRoom) + " 1 ")
            console.log(JSON.stringify(rooms) + " 2 ") 
    }) 
})


app.post('/room', (req, res) => {

  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  
  rooms[req.body.room] = { 
    users: {} 
  }
  res.redirect(req.body.room)
  // Send message that new room was created
  io.emit('room-created', req.body.room)
/*{ chatrooms:{chatroom1:rooms[req.body.room], users:{username:rooms[req.body.room].users}}*/
  /*var newRoom = new CRooms({chatRoomName:req.body.room,username:rooms[req.body.room]})
  newRoom.save(function(err){
    if(err)
      throw err;
  
  }) */
  console.log(JSON.stringify(rooms))
  console.log(JSON.stringify(rooms[req.body.room]))
  
})


app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { 
    roomName: req.params.room, 
    roomUsers : req.params.users
  })
})

/*
      server.listen(PORT, "172.168.16.3", function(){
        console.log('Server running...');
      })
*/

server.listen(PORT,function(){
  console.log('Server running...');
})


io.on('connection', socket => {

  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).broadcast.emit('user-connected', name)
    var query = Chat.find({});
    query.sort('-created').limit(8).exec(function(err, docs){
      console.log("Send old messages")
      socket.emit('load old msgs', docs);
  })
  })
  
  socket.on('send-chat-message', (room, message) => {
    //socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    var newMsg = new Chat({ msg: message, username: rooms[room].users[socket.id] })
    newMsg.save(function(err){
      if(err)
        throw err;
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
    })
  })

  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}