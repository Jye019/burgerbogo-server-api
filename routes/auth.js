import express from "express";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import sequelize from "sequelize";
import { Email, User } from '../models';
import middleware from './middleware';

const router = express.Router();

// 비밀번호 validation 
const passwordValidation = (req) => {
    const pwdRegExp = /^.*(?=.{8,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if (!pwdRegExp.test(req.body.password)) {
        return false;
    }
    
    return true;
}

// 이메일 발송 
const sendEmail = async (req) => {
    try {
        const key1 = crypto.randomBytes(256).toString('hex').substring(100, 51);
        const key2 = crypto.randomBytes(256).toString('base64').substring(50, 99);
        const verifyKey = encodeURIComponent(key1 + key2); 
        const verifyLink = `http://${req.get('host')}/auth/confirmEmail?key=${verifyKey}`;
       
        await User.update({verify_key: verifyKey}, {
            where: {
                email : req.body.email,
            }
        });

        const email = await Email.findOne({
            attributes: ['id', 'subject', 'contents'],
            where : {
                id : req.body.email_id,
            }
        })
        
        const template = handlebars.compile(email.contents);
        let contents = template();
        if(email.id===1) {
            contents = template({verifyLink});
        }
        
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.NSM_EMAIL,
                pass: process.env.NSM_EMAIL_PW,
            }
        });
        
        transporter.sendMail({
            from: `버거보고 <${process.env.NSM_EMAIL}>`,
            to: req.body.email,
            subject: email.subject,
            html: contents,
        });
           
        return true;
    } catch (err) {  
        return false;
    }
}


router.post('/join', async (req, res) => {
    try {
        // 이메일 validation 체크
        const emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if(!emailRegExp.test(req.body.email)) {
            return res.status(409).json({
                code: 409, 
                message: "REGEXP_FAIL_EMAIL",
            });
        }

        // 비밀번호 validation 체크
        const success = passwordValidation(req);
        if(!success) {
            return res.status(409).json({
                code: 409,
                message: "REGEXP_FAIL_PASSWORD",
            })
        }
           
        // 계정 유무 확인
        const exUser = await User.findOne({
            where : {
                email: req.body.email,
            }
        });
        if(exUser) {
            return res.status(409).json({
                code: 409,
                message: "DUPLICATED_EMAIL",
            })
        } 

        // 계정 생성
        const hashedPassword = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(10));
        await User.create({
            email: req.body.email,
            password: hashedPassword, 
        });

        // 이메일 전송
        const result = await sendEmail(req);
        if(result) {
            return res.status(200).json({
                code: 200,
                message: "EXTSERV_MAIL_SUCCESS"
            })
        }
        return res.status(409).json({
            code: 500,
            message: "EXTSERV_MAIL_FAIL"
        })
       
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500,
            message: "ERROR", 
            error: err.stack
        });
    }    
});

// 이메일 인증 확인
router.get('/confirmEmail', async (req, res) => {
    try {
        const key = encodeURIComponent(req.query.key);
        const userInfo = await User.findOne(
            { attributes: {exclude: ['password']}},
            { where: {
                [sequelize.Op.and] : [
                    sequelize.where(
                        sequelize.fn('datediff', sequelize.fn('NOW'), sequelize.col('created_at')),
                        { [sequelize.Op.lt]: 1 }
                    ),
                    {verify_key: key}
                ]
            }
        });
    
        if(userInfo) {
            userInfo.verified = 1;
            await User.update({verified: 1}, {
                where: {
                    verify_key : key,
                }
            });
            
            return res.status(200).json({
                code: 200,
                message: "CHECK_MAIL_SUCCESS",
                data: {"userData": {...userInfo.dataValues}}
            });
        } 
        
        return res.status(401).json({
            code: 401,
            message: "EXPIRED_KEY",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
    
})

// 이메일 인증 재전송
router.post('/reSend',  async (req, res) => {
    try {
        const success = sendEmail(req, res);
        if (success) {
            const user = await User.findOne({
                attributes: { exclude: ['password'] },
                where : {
                    email: req.body.email,
                }
            });

            return res.status(200).json({ 
                code: 200,
                message: "CHECK_MAIL_SUCCESS", 
                data : user,
            });
        } 

        return res.status(500).json({
            code: 500,
            message: 'EXTSERV_MAIL_FAIL',
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        // 로그인 
        const userInfo = await User.findOne({
            where : {
                email: req.body.email,
            }
        })
        
        if(userInfo) {
            if(await bcrypt.compare(req.body.password, userInfo.password)) {
                if(userInfo.verified === 1) {
                    // 세션 발급 
                    const token = jwt.sign({ id: userInfo.id, nickname: userInfo.nickname,}, 
                                           ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                           { expiresIn: '30m', issuer: 'nsm',});
                    // cookie에 저장
                    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 30});
                    // return userData
                  
                    const {password, verify_key,...userData} = userInfo.dataValues;
                    console.log(userInfo.dataValues)

                    return res.json({
                        code: 200,
                        message: 'session issuance',
                        data: {
                            "userData": userData,
                            token
                        }
                    });
                }  
                return res.status(401).json({
                    code: 401,
                    message: "not verified",
                });
            } 
        } 
        return res.status(401).json({
            code: 401,
            message: "incorrect login info",
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
router.post('/detail', async(req, res) => {
    try {
        // 닉네임 validation 체크
        const nicknameRegExp = /^[ㄱ-ㅎ가-힣a-zA-Z]{1,10}$/;
        if(!nicknameRegExp.test(req.body.nickname)) {
            return res.status(409).json({
                code: 409, 
                message: "invalid nickname",
            });
        }
        
        // 닉네임 중복 체크
        const user = await User.findOne({
            where: {
                [sequelize.Op.and] : [
                    {nickname: req.body.nickname},
                    {   
                        email: {
                            [sequelize.Op.ne]: req.body.email
                        }
                    }
                ]
            }
        })

        if(user) {
            return res.status(409).json({
                code: 409,
                message: 'duplicated'
            })
        }

        // 추가 정보 update
        await User.update({
            nickname: req.body.nickname,
            gender: req.body.gender || null,
            birth_year: req.body.birth_year || null,
        }, {
            where: {
                email: req.body.email,
            }
        })

        return res.status(200).json({
            code: 200,
            message: "update info",
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
});

// 비밀번호 재설정
router.post('/reset-pw', async(req, res) => {
    try {
        const success = passwordValidation(req);
        if(!success) {
            return res.status(409).json({
                code: 409,
                message: "invalid password",
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.update({password: hashedPassword}, {
            where : {
                email: req.body.email
            }
        })

        return res.status(200).json({
            code: 200,
            message: "password update success"
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: 500, 
            message: err.stack 
        });
    }
});


// jwt 확인
router.post('/verify', middleware.verifyToken, (req, res) => {
    res.json(req.decoded);
});

export default router;
