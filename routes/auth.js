import express from "express";
import bcrypt from 'bcrypt';
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import sequelize from "sequelize";
import { User } from '../models';
import middleware from './middleware';
import {logger} from '../library/log';

const { sendEmail, verifyToken, renewToken, isAdmin} = middleware;

const router = express.Router();

// 비밀번호 validation 
const passwordValidation = (req, res, next) => {
    if(!(req.body.password || req.body.newPassword)) return res.status(401).json({ code: "PASSWORD_IS_MISSING" });

    const pwdRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    if (!(pwdRegExp.test(req.body.password) || pwdRegExp.test(req.body.newPassword))) {
        return res.status(409).json({ code: "AUTH_REGEXP_FAIL_PASSWORD" });
    }
    next();
}

// 이메일 중복확인
const dubplicateEmail = async (req, res, next) => {
    try {
        if(!req.body.email) return res.status(401).json({ code: "EMAIL_IS_MISSING" });

        const exUser = await User.findOne({ where : { email: req.body.email }});
        if(exUser) return res.status(409).json({ code: "AUTH_DUPLICATED_EMAIL" });

        next();
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.stack });
    }    
}

// 닉네임 중복 체크
const duplicateNickname = async (req, res) => {
    try {
        if(!req.body.nickname) return res.status(401).json({ code: "NICKNAME_IS_MISSING" });

        // 닉네임 중복 체크
        const user = await User.findOne(
            {where: { 
               [sequelize.Op.and]: [{ nickname: req.body.nickname }, {id: { [sequelize.Op.ne]: req.atoken.id}}]
            }});
        if(user) return true;
        return false;
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.stack }); 
    }
}

router.post('/duplicate/email', dubplicateEmail, async (req, res) => {
    return res.status(200).json({ code: "AUTH_SUCCESS" })
});

router.post('/duplicate/nickname', verifyToken, async (req, res) => {
    if(await duplicateNickname(req, res)) {
        return res.status(409).json({ code: 'AUTH_DUPLICATED_NICKNAME'});
    }
    return res.status(200).json({ code: "AUTH_SUCCESS" });
});

// 회원가입
router.post('/join', dubplicateEmail, passwordValidation, async (req, res) => {
    try {
        // 이메일 validation 체크
        const emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if(!emailRegExp.test(req.body.email)) {
            return res.status(409).json({
                code: "AUTH_REGEXP_FAIL_EMAIL",
            });
        }

        // 계정 생성
        const hashedPassword = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(10));
        await User.create({
            email: req.body.email,
            password: hashedPassword, 
        });

        if(sendEmail(req, res, 1)) {
            return res.status(200).json({"code": "AUTH_SUCCESS"});
        };
        return res.status(500).json({ code: "AUTH_EXTSERV_MAIL_FAIL" });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.stack });
    }    
});

// 이메일 전송
router.post('/send/:type',  async (req, res) => {
    try {
        if(!req.body.email) return res.status(401).json({ code: "EMAIL_IS_MISSING" });

        // 인증 이메일 재전송 
        if(req.params.type === 'address') {
            if(sendEmail(req, res, 1)) {
                return res.status(200).json({"code": "AUTH_SUCCESS"});
            };    
        } 
        // 비밀번호 변경 이메일 전송 
        if(req.params.type === 'pw') {
            const user = await User.findOne({where : {email: req.body.email}})
            if( user ) {
                req.userInfo = user;
                if(sendEmail(req, res, 2)) {
                    return res.status(200).json({ "code": "AUTH_SUCCESS" });
                };   
            }
            return res.status(409).json({ "code": "AUTH_NOT_EXIST" });
        }
        return res.status(500).json({ code: "AUTH_EXTSERV_MAIL_FAIL" });
    } catch (err) {  
        logger.log(err);
        return res.status(500).json({ code: "ERROR", error: err.stack })
    }
});

// 이메일 인증 확인
router.get('/confirmEmail', async (req, res) => {
    try {
        const key = encodeURIComponent(req.query.key);
        const userInfo = await User.findOne({ 
            attributes: {exclude: ['password']},
            where: {verify_key: key}
        });
    
        if(userInfo) {
            const createdAt = new Date(userInfo.created_at);
            createdAt.setDate(createdAt.getDate() + 1);

            if(createdAt < new Date()) {
                return res.redirect("/auth/expired");
            } 

            if(userInfo.verified === 1) {
                return res.redirect("/auth/authorized");
            }
        
            userInfo.verified = 1;
            await User.update(
                { verified: 1 }, 
                { where: { verify_key : key }}
            );
            
            req.userInfo = {...userInfo.dataValues};
            return res.redirect('/auth/success');
        } 

        return res.redirect('/auth/fail');
        
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.stack });
    }
});

// 로그인 
router.post('/login', async (req, res) => {
    try {
        if(req.body.refreshToken) { return res.redirect(307, '/auth/renew'); }
        if(!req.body.email) return res.status(401).json({ code: "EMAIL_IS_MISSING" });
        if(!req.body.password) return res.status(401).json({ code: "PASSWORD_IS_MISSING" });

        const userInfo = await User.findOne({
            where : { email: req.body.email }
        })
        
        if(userInfo) {
            if(await bcrypt.compare(req.body.password, userInfo.password)) {
                if(userInfo.verified === 1) {
                    // 세션 발급 
                    const key1 =  encodeURIComponent(crypto.randomBytes(256).toString("hex")).substring(79, 51);
                    const key2 =  encodeURIComponent(crypto.randomBytes(256).toString("base64")).substring(51, 79);
                    const key = key1 + key2;
                    const accessToken = jwt.sign({id: userInfo.id, nickname: userInfo.nickname, user_level: userInfo.user_level}, 
                                           ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                           { expiresIn: process.env.ACCESS_EXPIRESIN_TIME * 60, issuer: 'nsm',});
                    const refreshToken = jwt.sign({refreshkey: key}, 
                                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                            { expiresIn: '14d', issuer: 'nsm',});
                    await User.update({refresh_key: key}, {
                        where: { email: userInfo.email }
                    });

                    // return userData
                    const {password, verify_key, refresh_key, ...userData} = userInfo.dataValues;
                    return res.status(200).json({
                        code: "AUTH_SUCCESS",
                        data: {
                            userData,
                            accessToken,
                            refreshToken
                        }
                    });
                }  
                return res.status(401).json({ code: "AUTH_LOGIN_FAIL_VERIFY" });
            } 
        } 
        return res.status(401).json({ code: "AUTH_LOGIN_FAIL_INFO" });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.errorData });
    }
})

// 개인정보 등록 및 수정 
router.post('/detail', verifyToken, async(req, res) => {
    try {
        const {nickname, gender, birth_year} = req.body;

        if( !( birth_year || birth_year === 0 ))
            return res.status(406).json({ code: "AUTH_BIRTH_MISSING" });
        if(Number.isNaN(parseInt(birth_year, 10)) || birth_year < 0)
            return res.status(406).json({code: "AUTH_UNEXPECTED_BIRTH"});
        if( !( gender || gender === 0 ))
            return res.status(406).json({ code: "AUTH_GENDER_MISSING" });
        if( Number.isNaN(parseInt(gender, 10)) || !(gender === 0 || gender === 1 || gender === 2) ) 
            return res.status(406).json({ code: "AUTH_UNEXPECTED_GENDER" });

        if(nickname) {
            // 닉네임 validation 체크
            const nicknameRegExp = /^[ㄱ-ㅎ가-힣0-9]{1,10}$/;
            if(!nicknameRegExp.test(nickname)) {
                return res.status(409).json({ code: "AUTH_REGEXP_FAIL_NICKNAME" });
            }

            if(await duplicateNickname(req)) {
                return res.status(409).json({ code: 'AUTH_DUPLICATED_NICKNAME' });
            }
        }

        // 추가 정보 update
        await User.update({ nickname, gender, birth_year }, 
                          { where: { id: req.atoken.id }});

        return res.status(200).json({
            code: "AUTH_SUCCESS",
            data: await User.findOne({ 
                attributes: {exclude : ["password", "refresh_key", "verify_key"]},
                where: { id: req.atoken.id }
            })
        });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", message: err.stack });
    }
});

// 비밀번호 재설정
router.post('/change/password', verifyToken, passwordValidation, async(req, res) => {
    try {
        const {password, newPassword} = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const userInfo = await User.findOne({where : { id: req.atoken.id }})
        
        if(!userInfo) {
            // 없는 계정
            return res.status(409).json({ code: "AUTH_NOT_EXIST" })
        }

        if(userInfo) {
            if(password) {
                if(!await bcrypt.compare(password, userInfo.password)) {
                    // 비밀번호 불일치 에러 코드
                    return res.status(419).json({ code: "AUTH_INVALID_PASSWORD" })
                }
            }
            if(await bcrypt.compare(newPassword, userInfo.password)) {
                // 기존 비밀번호로 변경 불가 
                return res.status(409).json({code: "AUTH_CURRENT_PASSWORD"})
            }
        }

        await User.update(
            { password: hashedPassword }, 
            { where : { id: req.atoken.id } }
        );

        return res.status(200).json({ code: "AUTH_SUCCESS" })
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", message: err.stack });
    }
});

// user 전체 리스트
router.get("/list", verifyToken, isAdmin, async (req, res) => {
    try {
        const list = await User.findAll({
            attributes: {exclude: ['password', 'verify_key', 'refresh_key']},
        });

        return res.status(200).json({ 
            code: "AUTH_SUCCESS", 
            data: list
        })
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", message: err.stack });
    }
    
});

// user 상세
router.get("/read/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({
            attributes: {exclude: ['password', 'verify_key', 'refresh_key']},
            where: { id: req.params.id } 
        });

        if(user) {
            return res.status(200).json({
                code: "AUTH_SUCCESS",
                data: user
            })
        }
        return res.status(409).json({ code: "AUTH_NOT_EXIST" });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", message: err.stack });
    }
});

// user 탈퇴 
router.post("/unsubscribe", verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if(user) {
            await User.destroy({ where: { email: req.body.email } });
            return res.status(200).json({code: "AUTH_SUCCESS"});
        } 
        return res.status(409).json({ code: "AUTH_NOT_EXIST" });
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", message: err.stack });
    }
});

// accessToken 확인
router.post('/verify', verifyToken, (req, res) => { return res.status(200).json({code: "AUTH_SUCCESS"}) });

// accessToken 갱신
router.post('/renew', renewToken);

// 이메일 인증 후 처리
router.get('/:result', async (req, res) => {
    try {
        if (req.params.result === 'success') return res.send('<script type="text/javascript">alert("인증 완료되었습니다.");</script>');
        if (req.params.result === 'expired') return res.send('<script type="text/javascript">alert("만료되었습니다.");</script>');
        if (req.params.result === 'authorized') return res.send('<script type="text/javascript">alert("이미 인증되었습니다.");</script>');
        return res.send('<script type="text/javascript">alert("인증 실패하였습니다.");</script>');
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ code: "ERROR", error: err.stack }); 
    }
});

export default router;
