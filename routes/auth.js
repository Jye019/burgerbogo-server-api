import express from "express";
import bcrypt from 'bcrypt';
import db from '../models';

const router = express.Router();

router.post('/join', async (req, res) => {
    try {
        // 계정 유무 확인
        const exUser = await db.users.findOne({
            where : {
                email: req.body.email
            }
        })
        if(exUser) {
            return res.status(409).json({
                message: "username exists",
            })
        }

        // 비밀번호 validation 체크 
        const pwdRegExp = /^.*(?=.{8,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
        if (!pwdRegExp.test(req.body.password)) {
            return res.status(409).json({
                message: "invalid password",
            });
        } 
        
        // 계정 생성 
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const newUser = await db.users.create({
            email: req.body.email,
            password: hashedPassword, 
        })

        return res.status(200).json(newUser);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.stack });
    }    
});

export default router;