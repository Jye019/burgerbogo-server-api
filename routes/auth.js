import express from "express";
import bcrypt from 'bcrypt';
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import sequelize from "sequelize";
import { User } from '../models';
import middleware from './middleware';

const router = express.Router();

// 비밀번호 validation 
const passwordValidation = (req) => {
    const pwdRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
    if (!pwdRegExp.test(req.body.password)) {
        return false;
    }
    return true;
}


// 이메일 중복확인
const dubplicationEmail = async (req, res, next) => {
    try {
        const exUser = await User.findOne({
            where : {
                email: req.body.email,
            }
        });
        if(exUser) {
            return res.status(409).json({
                code: "AUTH_DUPLICATED_EMAIL",
            })
        } 

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            error: err.stack
        });
    }    
}

router.post('/duplicate', dubplicationEmail, async (req, res) => {
    return res.status(200).json({
        code: "AUTH_SUCCESS",
    })
});

// 회원가입
router.post('/join', dubplicationEmail, async (req, res) => {
    try {
        // 이메일 validation 체크
        const emailRegExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if(!emailRegExp.test(req.body.email)) {
            return res.status(409).json({
                code: "AUTH_REGEXP_FAIL_EMAIL",
            });
        }

        // 비밀번호 validation 체크
        const success = passwordValidation(req);
        if(!success) {
            return res.status(409).json({
                code: "AUTH_REGEXP_FAIL_PASSWORD",
            })
        }        

        // 계정 생성
        const hashedPassword = await bcrypt.hash(req.body.password, bcrypt.genSaltSync(10));
        await User.create({
            email: req.body.email,
            password: hashedPassword, 
        });

        if(middleware.sendEmail(req, res, 1)) {
            return res.status(200).json({"code": "AUTH_SUCCESS"});
        };
        return res.status(500).json({
            code: "AUTH_EXTSERV_MAIL_FAIL"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            error: err.stack
        });
    }    
});

// 이메일 인증 재전송
router.post('/send',  async (req, res) => {
    try {
        if(middleware.sendEmail(req, res, 1)) {
            res.status(200).json({});
        };
        return res.status(500).json({
            code: "AUTH_EXTSERV_MAIL_FAIL"
        });
    } catch (err) {  
        console.log(err);
        return res.status(500).json({
            code: "ERROR",
            error: err.stack
        })
    }
});

// 이메일 인증 확인
router.get('/confirmEmail', async (req, res) => {
    try {
        const key = encodeURIComponent(req.query.key);
        const userInfo = await User.findOne({ 
            attributes: {exclude: ['password']},
            where: {
                [sequelize.Op.and] : [
                    sequelize.where(sequelize.fn('datediff', sequelize.fn('NOW'), sequelize.col('created_at')),{ [sequelize.Op.lt]: 1}),
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
            
            req.userInfo = {...userInfo.dataValues};
            res.redirect('/auth/success');
        } 

        res.redirect('/auth/fail');
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            error: err.stack 
        });
    }
    
});

// 이메일 인증 후 처리
router.get('/:result', async (req, res) => {
    try {
        if (req.params.result === 'success') {
            res.send('<script type="text/javascript">alert("인증 완료되었습니다.");</script>');
        }

        res.send('<script type="text/javascript">alert("인증 실패하였습니다.");</script>');
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR",
            error: err.stack 
        }); 
    }
});

// 로그인 
router.post('/login', async (req, res) => {
    try {
        const userInfo = await User.findOne({
            where : {
                email: req.body.email,
            }
        })
        
        if(userInfo) {
            if(await bcrypt.compare(req.body.password, userInfo.password)) {
                if(userInfo.verified === 1) {
                    // 세션 발급 
                    const key1 = crypto.randomBytes(256).toString("hex").substring(79, 51);
                    const key2 = crypto.randomBytes(256).toString("base64").substring(51, 79);
                    const key = encodeURIComponent(key1 + key2);
                    const accessToken = jwt.sign({id: userInfo.id, nickname: userInfo.nickname, user_level: userInfo.user_level}, 
                                           ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                           { expiresIn: '10m', issuer: 'nsm',});
                    const refreshToken = jwt.sign({refreshkey: key}, 
                                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                            { expiresIn: '15m', issuer: 'nsm',});
                    
                    await User.update({refresh_key: key}, {
                        where: {
                            email: userInfo.email
                        }
                    });

                    // return userData
                    const {password, verify_key, refresh_key, ...userData} = userInfo.dataValues;
                    return res.status(200).json({
                        data: {
                            userData,
                            accessToken,
                            refreshToken
                        }
                    });
                }  
                return res.status(401).json({
                    code: "AUTH_LOGIN_FAIL_VERIFY",
                });
            } 
        } 
        return res.status(401).json({
            code: "AUTH_LOGIN_FAIL_INFO",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR",
            error: err.stack 
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
                code: "AUTH_REGEXP_FAIL_NICKNAME",
            });
        }
        
        // 닉네임 중복 체크
        const user = await User.findOne({
            where: {
                [sequelize.Op.and] : [
                    {nickname: req.body.nickname},
                    {email: {[sequelize.Op.ne]: req.body.email}}
                ]
            }
        })

        if(user) {
            return res.status(409).json({
                code: 'AUTH_DUPLICATED_NICNAME'
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

        return res.status(200).json({})
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            message: err.stack 
        });
    }
});

// 비밀번호 재설정
router.post('/reset-pw', async(req, res) => {
    try {
        if(!passwordValidation(req)) {
            return res.status(409).json({
                code: "AUTH_REGEXP_FAIL_PASSWORD",
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.update({password: hashedPassword}, {
            where : {
                email: req.body.email
            }
        })

        return res.status(200).json({})
    } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            code: "ERROR", 
            message: err.stack 
        });
    }
});

// accessToken 확인
router.post('/verify', middleware.verifyToken, (req, res) => {return res.status(200).json({})});

// accessToken 갱신
router.post('/renew', middleware.renewToken);


export default router;
