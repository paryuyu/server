const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 경로: /auth/login
router.post('/login',(req,res)=>{



    return res.status(200).json({})
})




module.exports = router;