import jwt from "jsonwebtoken";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Email, User } from "../models";
import {logger} from '../library/log';

// access Token 검증
exports.verifyToken = (req, res, next) => {
  try {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET || "xu5q!p1", (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(419).json({
            code: "AUTH_ACCESS_EXPIRED",
          });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            code: "AUTH_INVALID_TOKEN",
          });
        } 
      }
      req.atoken = decoded;
      next();
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      code: "ERROR",
      message: err.stack,
    });
  }
};

/** refresh Token 검증
 * 유요한 경우 access Token 재발급
 * 만료된 경우 로그인 페이지로 이동
*/
exports.renewToken = (req, res) => {
  try {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET || "xu5q!p1", async (err) => {
      if (err) {
        if (err.name === 'JsonWebTokenError') {
          return res.status(419).json({
            code: "AUTH_INVALID_TOKEN",
          });
        }

        // access token 재발급 또는 로그인 창으로 이동 
        if(err.name === 'TokenExpiredError'){
          const accessTokenJSON = jwt.decode(req.headers.authorization)
          const refreshTokenJSON = jwt.decode(req.body.refreshToken)
          const userInfo = await User.findOne({
            where: {id: accessTokenJSON.id}
          });

          if(refreshTokenJSON.refreshkey === userInfo.refresh_key && Date.now() <= refreshTokenJSON.exp * 1000) {
            const accessToken = jwt.sign({id: userInfo.id, nickname: userInfo.nickname, user_level: userInfo.user_level}, 
                                        ( process.env.JWT_SECRET || 'xu5q!p1' ),
                                        { expiresIn: '10m', issuer: 'nsm',});
            // return userData
            const {password, verify_key, refresh_key, ...userData} = userInfo.dataValues;
            return res.status(200).json({
                data: {
                    userData,
                    accessToken,
                }
            });
          }
          
          return res.status(419).json({
            code: "AUTH_REFRESH_EXPIRED"
          });
        }
      }

      return res.status(200).json({ 
        "code": "AUTH_TOKEN_NO_CHANGE"
      });
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      code: "ERROR",
      message: err.stack,
    });
  }
}

// 이메일 전송
exports.sendEmail = async (req, res, emailType) => {
  try {
    const email = await Email.findOne({
      attributes: ["id", "subject", "contents"],
      where: {
        id: emailType,
      },
    });

    const template = handlebars.compile(email.contents);
    let contents = template();

    if (emailType === 1) {
      const key1 = crypto.randomBytes(256).toString("hex").substring(99, 51);
      const key2 = crypto.randomBytes(256).toString("base64").substring(51, 99);
      const verifyKey = encodeURIComponent(key1 + key2);
      const verifyLink = `http://${req.get("host")}/auth/confirmEmail?key=${verifyKey}`;

      await User.update(
        { verify_key: verifyKey },
        { where: { email: req.body.email, },}
      );
      contents = template({ verifyLink });  
    }

    if (emailType === 2) {
      const {id, nickname='버거보고 회원'} = req.userInfo;
      const token = jwt.sign( {id, nickname}, 
                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                            { expiresIn: '10m', issuer: 'nsm',});
      const resetPasswordLink = `http://${req.get("host")}/reset/pw/${token}`;
      contents = template({nickname, resetPasswordLink}); 
    }

    if (emailType === 2) {
      const {id, nickname='버거보고 회원'} = req.userInfo;
      const token = jwt.sign( {id, nickname}, 
                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                            { expiresIn: '10m', issuer: 'nsm',});
      const resetPasswordLink = `http://${req.get("host")}/reset/pw/${token}`;
      contents = template({nickname, resetPasswordLink}); 
    }

    if (emailType === 2) {
      const {id, nickname='버거보고 회원'} = req.userInfo;
      const token = jwt.sign( {id, nickname}, 
                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                            { expiresIn: '10m', issuer: 'nsm',});
      const resetPasswordLink = `http://${req.get("host")}/reset/pw/${token}`;
      contents = template({nickname, resetPasswordLink}); 
    }

    if (emailType === 2) {
      const {id, nickname='버거보고 회원'} = req.userInfo;
      const token = jwt.sign( {id, nickname}, 
                            ( process.env.JWT_SECRET || 'xu5q!p1' ),
                            { expiresIn: '10m', issuer: 'nsm',});
      const resetPasswordLink = `http://${req.get("host")}/reset/pw/${token}`;
      contents = template({nickname, resetPasswordLink}); 
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        user: process.env.NSM_EMAIL,
        pass: process.env.NSM_EMAIL_PW,
      },
    });

    let success = true;
    transporter.sendMail(
      {
        from: `버거보고 <${process.env.NSM_EMAIL}>`,
        to: req.body.email,
        subject: email.subject,
        html: contents,
      },
      (error) => {
        if (error) {
          success = false;
        }
      }
    );
    return success;
  } catch (err) {
    logger.log(err);
    return res.status(409).json({
      code: "ERROR",
      error: err.stack,
    });
  }
};

// 유저레벨 검증
// 매니아 인지
exports.isMania = (req, res, next) => {
  if (!(req.atoken.user_level === 100 || req.atoken.user_level === 10000)) {
    return res.status(401).json({ code: "AUTH_AT_LEAST_MANIA" });
  }
  next();
};

// 사장 인지
exports.isDirector = (req, res, next) => {
  if (!(req.atoken.user_level === 1000 || req.atoken.user_level === 10000)) {
    return res.status(401).json({ code: "AUTH_ONLY_DIRECTOR" });
  }
  next();
};

// 관리자 인지
exports.isAdmin = (req, res, next) => {
  if (!(req.atoken.user_level === 10000)) {
    return res.status(401).json({ code: "AUTH_ONLY_ADMIN" });
  }
  next();
};
