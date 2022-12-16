const mongoose = require('mongoose');
// 친구요청 : statusType -> 
const RelationShipSchema = new mongoose.Schema({
    requestSender:String, //요청 보낸 사람
    requestedBy :String,   //요청 받는 사람
    reqDate : Date,
    accDate : Date
})

module.exports = mongoose.model("relationship", RelationShipSchema)