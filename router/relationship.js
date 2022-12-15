const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserSchema = require('../model/user.js')
const RelationShipSchema = require('../model/relationship.js')



router.post("/", async(req,res)=>{

    //요청 받는 사람을 찾아주기
    const {RequestedBy} = req.body; //요청받는사람

    //현재 서버 주인을 받아오면 이렇게 해주자.
    //const owner = req.data.user.email;    //현재 서버 주인

    //요청 받는 사람이 현재 서버 주인이랑 같으면 X 
    // if(RequestedBy == owner){
    //     return res.status(400).json({msg:'자기 자신에게는 친구 요청을 보낼 수 없습니다.'})
    // }

    const found = await UserSchema.findOne({RequestedBy});

    //요청받는 사람이 존재하지 않는 유저면 400 보내주기.
    if(!found){
        return res.status(400).json({msg:'친구 요청을 보낼 상대방이 존재하지 않습니다.'})
    }
    
    //1. 서로 수락한 상태 3. 받은 요청 4. 보낸요청
    const data = {
        RequestSender:req.body.RequestSender, //요청 보낸 사람
        RequestedBy :req.body.RequestedBy,   //요청 받는 사람
        reqDate : new Date()
    }

    const create = await RelationShipSchema.create(data);

    if(create){
        res.status(200).json({msg:'친구요청에 성공하셨습니다.'})
    }

})


//수락했을 때 디비에 AcceptedDate 추가 //AccDate로 추가- update해주면 될 듯


//해당 서버 주인의 친구목록 리스트
router.get("/",async (req,res)=>{

    //owner를 찾아와야함.
    let owner;

    //owner가 요청 받은거, owner가 요청 보낸거, 서로 친구추가가 되어있는 상태
    let found = await RelationShipSchema.find({owner}).lean();

    //찾아서 새로운 데이터를 클라이언트로 날려주자.
    //새로운 데이터 구축

})



module.exports = router;