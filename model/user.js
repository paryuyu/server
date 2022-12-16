const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userName:String,
    userId:{type:String, unique:true, trim:true},
    password:String,
    authed:Boolean,
    createdAt:Date,
    socketId:String
})

module.exports = mongoose.model("user", UserSchema)