
const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const $users = $('#users'); 


if (messageForm != null) {

  const name = prompt('What is your name?')
  appendMessage('You joined')
  socket.emit('new-user', roomName, name)

  var para = document.createElement('p');
  var element = document.getElementById("chatroom_name");

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}

function autoScroll(){
  let height = $("#message-container")[0].scrollHeight;
  $("#message-container").animate({scrollTop: height}, 400)
}

socket.on('room-created', room => {

  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('button')
  roomLink.action = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)

})

socket.on('load old msgs', function(docs){
  for(var i = docs.length-1; i>=0; i--)
    appendMessage(docs[i].username +":"+ docs[i].msg);
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
  autoScroll();
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}