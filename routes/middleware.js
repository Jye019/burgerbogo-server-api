import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import db from '../models';

// 로그인 상태인지 확인
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthoricated()) {
        next();
    } else {
        res.status(403).send({
            message: "isNotLoggedIn"
        });
    }
}

// 로그인 안된 상태인지 확인
exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthoricated()){
        next();
    } else {
        res.redirect('/');
    }
}

// 클라이언트로부터 받은 jwt 검증
exports.verifyToken = (req, res, next) => {
    try {
        req.decoded = jwt.verify(req.headers.authorization, (process.env.JWT_SECRET || 'xu5q!p1'));
        return next();
    } catch (err) {
        if(err.name === 'TokenExpriedError') {
            return res.status(419).json({
                code: 419,
                message: 'expired token',
            })
        } 

        return res.status(401).json({
            code: 401,
            message: 'invalid token',
        })
    }
}

// 비밀번호 정규식 
exports.pwValidation = (req, res, next) => {
    const pwdRegExp = /^.*(?=.{8,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if (pwdRegExp.test(req.body.password)) {
        next();
    } else {
        return res.status(409).json({
            code: 409, 
            message: "invalid password",
        });
    }
}

// 이메일 발송 
exports.sendEmail = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.NSM_EMAIL,
                pass: process.env.NSM_EMAIL_PW,
            }
        });

        const email = await db.email_contents.findOne({
            attributes: ['contents'],
            where : {
                id : 1,
            }
        })

        const info = await transporter.sendMail({
            from: `버거보고 <${process.env.NSM_EMAIL}>`,
            to: req.body.email,
            subject: '회원가입 이메일 인증',
            html: email.contents,
        });

        return res.status(200).json({
            code: 200,
            message: 'Sent Auth Email',
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            code: 401,
            message: 'fail email transport',
        })
    }
}