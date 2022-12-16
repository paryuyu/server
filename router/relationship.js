const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserSchema = require('../model/user.js')
const RelationShipSchema = require('../model/relationship.js');
const { application } = require('express');

/*
경로 : 
/relationship (post) 친구 요청 보내기.
/relationship (get) 친구 리스트 요청.
*/


//미들웨어
router.use((req, res, next) => {
    const authorization = req.get("authorization");
    console.log(authorization, 'authorization-middle')
    if (!authorization) {
        return res.status(401).json({ message: "인증 값이 존재하지 않습니다." });
    }

    if (authorization.startsWith("Bearer")) {
        const token = authorization.split(/\s/)[1];
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.data = payload;
        next();
    } else {
        return res.status(401).json({ msg: '지원되지 않는 밸류입니다.' })
    }
})



//친구 추가 요청 처리 
router.post("/", async (req, res) => {
    //서버의 주인 -> 미들웨어(토큰 페이로드로)
    const owner = req.data.user.email;
    
    //요청 받는 사람을 찾아주기
    const { requestedBy } = req.body; //요청받는 사람(상대방의 이메일)

    //요청 받는 사람이 현재 서버 주인이랑 같으면 msg 보내기.
    if (requestedBy == owner) {
        return res.status(400).json({ msg: '자기 자신에게는 친구 요청을 보낼 수 없습니다.' })
    }

    //요청받는 사람을 유저에서 찾아주기
    const found = await UserSchema.findOne({ userId: requestedBy });

    //요청받는 사람이 서버에 존재하지 않는 유저면 400 보내주기.
    if (!found) {
        return res.status(400).json({ msg: '친구 요청을 보낼 상대방이 존재하지 않습니다.' })
    }

    const chk = await RelationShipSchema.findOne({ $or: [{ requestSender: owner, requestedBy: requestedBy }, { requestSender: requestedBy, requestedBy: owner }] })
    //이미 요청이 발생한 상태 -> 
    if (chk) {
        return res.status(401).json({ msg: '이미 요청이 발생한 친구입니다.' })
    }

    const data = {
        requestSender: owner, //요청 보낸 사람
        requestedBy: requestedBy, //요청 받는 사람
        reqDate: new Date()
    }

    const create = await RelationShipSchema.create(data);
    //웹소켓에서 친구요청 알림을 바로 띄워줄거임.
    //디비에서 찾아놓은 유저의 데이터에서 socketId
    if(found.socketId){
        //app에서 set 설정해준 값 -> webSocket Server임
        const io = req.app.get('io')

        //to()
        io.to(found.socketId).emit('add-friend-request',{
            //데이터를 하나 만들어서 client로 emit 해줄거임
            ...data, type:4
        })
    }

    return res.status(201).json({ msg: `${requestedBy}에게 성공적으로 친구 요청을 전송하였습니다.` })

})





//수락했을 때 디비에 AcceptedDate 추가 //AccDate로 추가- update해주면 될 듯


//해당 서버 주인의 친구목록 리스트
router.get("/", async (req, res) => {

    //requester는 서버의 주인 => 미들웨어에서 데려와야함.
    const requester = req.data.user.email;

    //owner가 요청 받은거, owner가 요청 보낸거, 서로 친구추가가 되어있는 상태
    const found = await RelationShipSchema.find({ $or: [{ requestSender: requester }, { requestedBy: requester }] }).sort('reqDate');

    const cvtDatas = found.map((one) => {

        let user = requester === one.requestSender ? one.requestedBy : one.requestSender;
        let type;

        //1. 서로 수락한 상태 3. 받은 요청 4. 보낸요청
        if (one.accDate) {
            type = 1;
        } else {
            //친구 요청을 보냈는데 수락 X : 3
            //친구 요청을 받았는데 수락 X : 4
            type = requester === one.requestSender ? 3 : 4
        }
        return { createdAt: one.reqDate, user: user, type: type };

    })

    //새로운 데이터를 날려주기.
    return res.status(200).json(cvtDatas);


})



module.exports = router;