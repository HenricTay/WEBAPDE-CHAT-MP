const mongoose = require("mongoose")
/*
var chatRoomSchema = mongoose.Schema({
    chatRoom: rooms,
    chatRoomName: String,
  })
*/
  
var CRooms = mongoose.model('Chatroom', 
{
    chatrooms: Object,
    chatRoomName: String,
})

module.exports = {
    CRooms
}