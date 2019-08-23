const mongoose = require("mongoose")

var Chat = mongoose.model('Message',
{username: String,
    msg: String,
    created: {type: Date, default: Date.now}
})

module.exports = {
    Chat
}