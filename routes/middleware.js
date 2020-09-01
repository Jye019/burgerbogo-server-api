import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { Email, User } from '../models';

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
        console.log(req.headers)
        req.decoded = jwt.verify(req.headers.cookie.token, (process.env.JWT_SECRET || 'xu5q!p1'));
        next();
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

// 이메일 전송 
exports.sendEmail = async (req, res, emailType) => {
    try {
        const key1 = crypto.randomBytes(256).toString('hex').substring(99, 51);
        const key2 = crypto.randomBytes(256).toString('base64').substring(51, 99);
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
                id : emailType,
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
        
        let success = true;
        transporter.sendMail({
            from: `버거보고 <${process.env.NSM_EMAIL}>`,
            to: req.body.email,
            subject: email.subject,
            html: contents,
        }, (error) => {
            if(error) {
                success = false;
            }
        });
        return success;
    } catch (err) {  
        console.log(err);
        return res.status(409).json({
            code: "ERROR",
            error: err.stack
        })
    }
}