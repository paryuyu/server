//웹소켓을 이용해서 복잡한 프로젝트를 만들면 쓰기 쉬운 라이브러리를 이용하는게 좋음.
//npm i socket.io

//몽구스 설정
const authRoutes = require('./router/auth.js');
const relationshipRoutes = require('./router/relationship.js')
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const UserSchema = require('./model/user.js')
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { dbName: "discord" });
//express 설정
const app = express();

//dotenv 설정
dotenv.config();

//cors 설정
app.use(cors());

//entype = 'application/json' 형태 파싱 처리
app.use(express.json())

//스태틱 설정
app.use("/static", express.static(path.join(__dirname, 'static')))

app.use('/auth', authRoutes)
app.use('/relationship', relationshipRoutes)


//websocket----------------------------------------------------
const httpServer = createServer(app);

//웹소켓 처리용 서버
const io = new Server(httpServer, {
    cors: {//클라이언트 서버 적어주면 됨.
        origin: 'http://localhost:3000'
    }
});

//커넥트 할 때 socketId를 업데이트 해주고, 디스커넥트할 때 null로 해서 온라인, 오프라인을 표시해주자.
io.on('connection',async (socket)=>{
    //console.log(socket.handshake.query,'handshake')
    //소켓의 주인
    const owner = socket.handshake.query.userId;
    let update = await UserSchema.updateOne({userId:owner},{socketId:socket.id});
    socket.on('disconnect',async ()=>{
        let disconnect = await UserSchema.updateOne({userId:owner},{socketId:null})
    })
});

//앱자체에 객체를 세팅하기
app.set("io",io) //-> 이걸 relationship에서 불러들일거임.


//socket tutorial
// io.on("connection", (socket) => {
//     //핵심코드 //연결을 시도했을 때 생기는 고유 아이디값 : socket.id
//     console.log('client 측으로부터 연결 발생', socket.id);

//     //연결이 끊길 때
//     socket.on('disconnect', (reason) => {
//         console.log('[socket-io]disconnected', socket.id, reason)
//     });

//     //welcome이라는 이벤트가 발생하면 보내주는 애.
//     //연결되어있는 특정 소켓에 emit
//     socket.emit("welcome", {
//         "message": "환영합니다."
//     });

//     //연결되어있는 모든 소켓에 emit
//     io.sockets.emit("newUser!", { message: '길동이가 들어옴.' })


//     //만약 특정 소켓의 아이디를 알고있다면 그 사용자에게만 프라이빗하게 보낼 수 있음.
//     //이건 발생시킨 사람한테 보내는거임.
    
//     io.sockets.to(socket.id).emit('private',{datas:[1,2,3,4]})

// });

httpServer.listen(8080)
//------------------------------------------------------------------
//app.listen(8080, ()=>{console.log('serverStart');})