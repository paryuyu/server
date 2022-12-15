const mongoose = require('mongoose');
// 친구요청 : statusType -> 
const RelationShipSchema = new mongoose.Schema({
    RequestSender:String, //요청 보낸 사람
    RequestedBy :String,   //요청 받는 사람
    reqDate : Date,
    AccDate : Date
})

module.exports = mongoose.model("relationship", RelationShipSchema)