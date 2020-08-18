import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
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

// 이메일 발송 
exports.sendEmail = async (req) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            auth: {
                user: process.env.NSM_EMAIL,
                pass: process.env.NSM_EMAIL_PW,
            }
        });

        const email = await db.email_contents.findOne({
            attributes: ['id', 'subject', 'contents'],
            where : {
                id : req.body.emailId,
            }
        })

        const template = handlebars.compile(email.contents);
        let contents = template();
        if(email.id===1) {
            contents = template({verifyLink: req.body.verifyLink});
        }

        await transporter.sendMail({
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
            attributes: ['id', 'subject', 'contents'],
            where : {
                id : req.body.emailId,
            }
        })

        const template = handlebars.compile(email.contents);
        let contents = template();
        if(email.id===1) {
            contents = template({verifyLink: req.body.verifyLink});
        }

        await transporter.sendMail({
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