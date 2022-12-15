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

const uri = process.env.MONGODB_URI;
mongoose.connect(uri,{dbName:"discord"});
//express 설정
const app = express();

//dotenv 설정
dotenv.config();

//cors 설정
app.use(cors());

//entype = 'application/json' 형태 파싱 처리
app.use(express.json())

//스태틱 설정
app.use("/static",express.static(path.join(__dirname,'static')))

app.use('/auth',authRoutes)
app.use('/relationship',relationshipRoutes)
app.listen(8080, ()=>{console.log('serverStart');})