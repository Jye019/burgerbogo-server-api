import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models';
import { verifyToken, pwValidation, sendEmail } from './middleware';

const router = express.Router();

router.post('/join', async (req, res) => {
    try {
        // 계정 유무 확인
        const exUser = await db.users.findOne({
            where : {
                email: req.body.email,
            }
        })
        if(exUser) {
            return res.status(409).json({
                code: 409,
                message: "username exists",
            })
        }

        // 비밀번호 validation 체크 
        // 분리 
        await pwValidation(req, res, async () => {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            const newUser = await db.users.create({
                email: req.body.email,
                password: hashedPassword, 
            })
        
            return res.status(200).json(newUser);
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500,
            message: err.stack, 
        });
    }    
});

router.post('/login', async (req, res) => {
    try {
        // 로그인 
        const userInfo = await db.users.findOne({
            attributes: ['id', 'password', 'nickname'],
            where : {
                email: req.body.email,
            }
        })
   
        if(userInfo) {
            const match = await bcrypt.compare(req.body.password, userInfo.password);
    
            // 세션 발급 
            if(match) { 
                const token = await jwt.sign(
                    {
                        id: userInfo.id,
                        nickname: userInfo.nickname,
                    }, 
                    (process.env.JWT_SECRET || 'xu5q!p1'),
                    {
                        expiresIn: '30m',
                        issuer: 'nsm',
                    }
                )
                // cookie에 저장
                res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30})
                return res.json({
                    code: 200,
                    message: 'session issuance',
                    token
                });
            } 
        } 
    
        return res.status(401).json({
            code: 401,
            message: "incorrect login info",
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
})

// jwt 확인
router.get('/verify', verifyToken, (req, res) => {
    res.json(req.decoded);
});

// 회원가입 후 인증 이메일 전송 
router.get('/email', sendEmail);

// 최초 로그인 시 추가 개인정보 등록 
router.get('/detail', () => {
    console.log(1);
});

// 로그아웃
// 쿠키 삭제 

// 이메일 전송 



export default router;