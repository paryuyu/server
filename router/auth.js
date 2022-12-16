const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');
const UserSchema = require('../model/user.js')
const dotenv = require('dotenv');
dotenv.config();

console.log(process.env.SECRET_KEY);
//미들웨어 => 인증못받으면 



// 경로: /auth/login
router.post('/login', async (req, res) => {
    try {

        let userId = req.body.userId;
        let userPassword = req.body.userPassword;
        //아이디 찾아서
        const findId = await UserSchema.findOne({ userId: userId }).lean();
        console.log(findId,'findId')
        if (!findId) {
            return res.status(500).json({ msg: '아이디를 확인해주세요.' })
        }
        //비밀번호 비교하고
        const comparePW = bcrypt.compareSync(userPassword, findId.password);

        //비밀번호가 틀리면
        if (!comparePW) {
            return res.status(500).json({ msg: '비밀번호를 확인해주세요.' })

            //id도 있고 그게 비번도 맞으면
        } else if (findId && comparePW) {
            let one = { name: findId.userName, email: findId.userId };
            //토큰 생성 -> email, name 던져주기
            console.log(one)

            let token = jwt.sign({ user: one }, process.env.SECRET_KEY, { expiresIn: '7d' })
            return res.status(200).json({ result: true, token: token, msg: '로그인에 성공하셨습니다.' })
        }

    } catch (err) {
        return res.status(404).json({ msg: '' })
    }
})


router.post('/register', async (req, res) => {

    let { password } = req.body;

    const hashingPW = bcrypt.hashSync(password, 12);

    let data = {
        userName: req.body.userName,
        userId: req.body.userId,
        password: hashingPW,
        authed: req.body.authed,
        createdAt: new Date()
    }

    try {

        const userCreate = await UserSchema.create(data);
        console.log(userCreate)


        if (userCreate) {
            return res.status(200).json({ result: true, msg: '회원가입에 성공하셨습니다.' })
        } else {
            return res.status(500).json({ result: false, msg: '회원가입에 실패하셨습니다.' })
        }

    } catch (err) {
        //아이디 유니크처리 하고 겹쳐서 몽구스 에러가 뜸
        console.log(err)
        return res.status(401).json({ result: false })
    }
})



//TODO: 토큰 유효성 검사 하나 만들기(서버)
router.post("/session", async (req, res) => {
    const authorization = req.get("authorization");
    if (!authorization) {
        return res.status(401).json({ msg: '인증 값이 존재하지 않습니다.' });
    }

    if (authorization.startsWith("Bearer")) {
        console.log(authorization)
        const token = authorization.split(/\s/)[1];
        try {
            const payload = jwt.verify(token, process.env.SECRET_KEY)
            console.log(payload, ":payload")
            return res.status(200).json(payload);
        } catch (e) {
            return res.status(401).json({ msg: '토큰값이 유효하지 않습니다.' });
        }


    } else {
        return res.status(401).json({ message: "지원되지 않는 밸류입니다." });
    }


})




module.exports = router;