const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))


//const {CRooms} = require("./public/chatroom.js")



mongoose.connect("mongodb://localhost:27017/chat", 
{
  useNewUrlParser:true
})

var chatSchema = mongoose.Schema({
  username: String,
  msg: String,
})

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

var Chat = mongoose.model('Message', chatSchema);
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
app.get("/exit", (req, res) => {
  res.redirect('/link-chatrooms')
})

app.get("/", (req, res) =>{
  res.sendFile(__dirname + '/views/login.html');
})

app.get('/link-logout', (req,res) =>{
  res.sendFile(__dirname + '/views/login.html');

})


app.post('/login', (req, res) => {
  res.render('profile', { 
    username: req.body.username,
    password: req.body.password 
  })
})

app.get('/link-profile', (req, res) => {
  res.render('profile', { 
    username: req.body.username,
    password: req.body.password 
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

app.get('/link-settings', (req,res) =>{
  res.render('settings',{

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
  
  })
  console.log(JSON.stringify(rooms[req.body.room]) + " : " + newRoom)
  */
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



server.listen(3000)
console.log('Server running...');

io.on('connection', socket => {

  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    Chat.find({}, function(err, docs){
      console.log("Send old messages")
      socket.emit('load old msgs', docs);
  })
    socket.to(room).broadcast.emit('user-connected', name)
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