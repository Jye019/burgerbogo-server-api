import express from "express";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db, { sequelize, Sequelize } from '../models';
import middleware from './middleware';

const router = express.Router();

router.post('/join', async (req, res) => {
    try {
        // 이메일 validation 체크
        const emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if(!emailRegExp.test(req.body.email)) {
            return res.status(409).json({
                code: 409, 
                message: "invalid email",
            });
        }

        // 비밀번호 validation 체크
        const pwdRegExp = /^.*(?=.{8,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
        if (!pwdRegExp.test(req.body.password)) {
            return res.status(409).json({
                code: 409, 
                message: "invalid password",
            });
        } 
           
        // 계정 유무 확인
        const exUser = await db.users.findOne({
            where : {
                email: req.body.email,
            }
        });
        if(exUser) {
            return res.status(409).json({
                code: 409,
                message: "account exists",
            })
        } 

        // 계정 생성 및 이메일 인증
        const key1 = crypto.randomBytes(256).toString('hex').substring(100, 91);
        const key2 = crypto.randomBytes(256).toString('base64').substring(50, 59);
        const verifyKey = key1 + key2; 

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newUser = await db.users.create({
            email: req.body.email,
            password: hashedPassword, 
            verify_key : verifyKey,
        })
      
        // 이메일 발송
        const verifyLink = `http://${req.get('host')}/auth/confirmEmail?key=${verifyKey}`;
        req.body.verifyLink = verifyLink;
        const success = await middleware.sendEmail(req, res);
        
        if (success) {
            return res.status(200).json({ 
                code: 200,
                message: success, 
                data : newUser,
            });
        } 

        return res.status(500).json({
            code: 500,
            message: 'send email fail',
        })
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

// 이메일 인증 확인
router.get('/confirmEmail', async (req, res) => {
    try {
        const user = await db.users.findOne({
            where : {
                [Sequelize.Op.and] : [
                    sequelize.where(
                        sequelize.fn('datediff', sequelize.fn('NOW'), sequelize.col('create_at')),
                        { [Sequelize.Op.lt] : 1 }
                    ),
                    {verify_key : req.query.key}
                ]
            }
        });
    
        if(user) {
            await db.users.update({verified: 1}, {
                where: {
                    verify_key : req.query.key,
                }
            });
    
            return res.status(200).json({
                code: 200,
                message: "email check success",
            });
        } 
        
        return res.status(401).json({
            code: 401,
            message: "expired email key",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
    
})

// 최초 로그인 시 추가 개인정보 등록 
router.get('/detail', () => {
    console.log(1);
});

// jwt 확인
router.get('/verify', middleware.verifyToken, (req, res) => {
    res.json(req.decoded);
});

// 로그아웃
// 쿠키 삭제 np

// 이메일 전송 



export default router;