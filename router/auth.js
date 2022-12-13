const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');
dotenv.config();

console.log(process.env.SECRET_KEY);
//미들웨어 => 인증못받으면 



// 경로: /auth/login
router.post('/login', async (req, res) => {
    try {


        //아이디 찾아서
        const findId = await accountSchema.findOne({ id: req.body.id }).lean();

        //비밀번호 비교하고
        const comparePW = bcrypt.compareSync(req.body.password, findId.password);

        //비밀번호가 틀리면
        if (!comparePW) {
            return res.status(500).json({ msg: '비밀번호가 틀렸습니다.' })
        }

        //비밀번호가 맞으면 토큰 생성
        let token = jwt.sign(one, 'secret', { expiresIn: '7d' })
        
        return res.status(200).json({ msg: '로그인에 성공하셨습니다.' })



    } catch (err) {
        return res.status(404).json({ msg: '' })
    }
})


router.post('/register', (req, res) => {

    let { password } = req.body;
    const hashingPW = bcrypt.hashSync(password, 12);
    console.log(hashingPW)


})




module.exports = router;