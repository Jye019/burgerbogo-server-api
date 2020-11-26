import jwt from "jsonwebtoken";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Email, User } from "../models";
import { logger } from "../library/log";

// access Token 검증
exports.verifyToken = (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ code: "TOKEN_IS_MISSING" });
    jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET || "xu5q!p1",
      (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(419).json({ code: "AUTH_ACCESS_EXPIRED" });
          }
          if (err.name === "JsonWebTokenError") {
            return res.status(419).json({ code: "AUTH_INVALID_TOKEN" });
          }
        }
        req.atoken = decoded;
        next();
      }
    );
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ code: "ERROR", message: err.stack });
  }
};

/** refresh Token 검증
 * 유요한 경우 access Token 재발급
 * 만료된 경우 로그인 페이지로 이동
 */
exports.renewToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const refreshTokenJSON = jwt.decode(refreshToken);
    const userInfo = await User.findOne({
      where: { refresh_key: refreshTokenJSON.refreshkey },
    });

    if (userInfo && Date.now() <= refreshTokenJSON.exp * 1000) {
      const accessToken = jwt.sign(
        {
          id: userInfo.id,
          nickname: userInfo.nickname,
          user_level: userInfo.user_level,
        },
        process.env.JWT_SECRET || "xu5q!p1",
        { expiresIn: "1m", issuer: "nsm" }
      );
      // return userData
      const {
        password,
        verify_key,
        refresh_key,
        ...userData
      } = userInfo.dataValues;
      return res.status(200).json({
        code: "AUTH_SUCCESS",
        data: {
          userData,
          accessToken,
          refreshToken,
        },
      });
    }
    return res.status(419).json({ code: "AUTH_REFRESH_EXPIRED" });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({ code: "ERROR", message: err.stack });
  }
};

// 이메일 전송
exports.sendEmail = async (req, res, emailType) => {
  try {
    const email = await Email.findOne({
      attributes: ["id", "subject", "contents"],
      where: { id: emailType },
    });

    const template = handlebars.compile(email.contents);
    let contents = template();

    if (emailType === 1) {
      const key1 = encodeURIComponent(
        crypto.randomBytes(256).toString("hex")
      ).substring(99, 51);
      const key2 = encodeURIComponent(
        crypto.randomBytes(256).toString("base64")
      ).substring(51, 99);
      const verifyKey = key1 + key2;

      console.log(verifyKey);
      await User.update(
        { verify_key: verifyKey },
        { where: { email: req.body.email } }
      );

      const verifyLink = `http://${ process.env.NODE_ENV==='production'?'api':'api-dev'}.burgerbogo.net/auth/confirmEmail?key=${verifyKey}`;
      contents = template({ verifyLink });
    }

    if (emailType === 2) {
      const { id, nickname = "버거보고 회원" } = req.userInfo;
      const token = jwt.sign(
        { id, nickname },
        process.env.JWT_SECRET || "xu5q!p1",
        { expiresIn: "10m", issuer: "nsm" }
      );
      const resetPasswordLink = `https://${
        process.env.NODE_ENV === "production" ? "api" : "api-dev"
      }.burgerbogo.net/reset/pw/${token}`;
      contents = template({ nickname, resetPasswordLink });
    }

    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      secure: true,
      auth: {
        type: "OAuth2",
        user: process.env.NSM_EMAIL,
        clientId:
          "268947122060-b8sl6jti7qftjum6tf6kn3eueg3jfma3.apps.googleusercontent.com",
        clientSecret: "cQw4Cc4COwzqzRNmAqft8iwL",
        refreshToken:
          "1//0fGv_NzQfiO8MCgYIARAAGA8SNwF-L9IrKAds4gGKma8syL4dYOAW1clgbUU-OwA6zWuzv8S2yfTiIKBpPvC5kXJInl6lBJ6-xYc",
        accessToken:
          "ya29.a0AfH6SMAG1xK0pKUK_-eQ31VJQsZAuhQtfgFuJNANLgq5XkPrv-klCRRepvcjAOOzaTNrli8kiy5GLHWjF1zUZlaeI0LVrqmo5PTf0R6l7GYzqRHqoQh9tNwm12zWuU39HqC_2s3yBVtorrZNTLCtpPXfyyNx49iQEtU",
        expires: 3600,
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

    transporter.close();
    return success;
  } catch (err) {
    logger.log(err);
    return res.status(409).json({ code: "ERROR", error: err.stack });
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
