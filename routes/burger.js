import express from "express";
import path from "path";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import seq, { Op } from "sequelize";
import { Burger, TBurger, Brand, Review } from "../models";
import { parseQueryString } from "../library/parsing";
import awscon from "../config/awsconfig.json";
import middleware from "./middleware";

const { verifyToken, isAdmin, isDirector } = middleware;

// 사진 Upload 설정 부분
aws.config.accessKeyId = awscon.accessKeyId;
aws.config.secretAccessKey = awscon.secretAccessKey;
aws.config.region = awscon.region;

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: awscon.bucket,
    key: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      cb(null, `${Date.now().toString()}${extension}`);
    },
    acl: "public-read-write",
  }),
});
//

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*                오늘의 버거 Start               */
// 오늘의버거 입력
router.post("/today", verifyToken, isAdmin, async (req, res) => {
  try {
    if (
      await Burger.findOne({
        where: { id: req.body.burger_id },
      })
    ) {
      await TBurger.create(req.body);
      res.status(200).json({});
    } else {
      res.status(400).json({ code: "BURGER_INVALID_ID" });
    }
  } catch (err) {
    if (err instanceof seq.ValidationError) {
      return res.status(400).json({
        code: "SEQUELIZE_VALIDATION_ERROR",
        message: err["errors"][0]["message"],
      });
    }
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
// 오늘의버거 조회
router.get("/today", async (req, res) => {
  try {
    const todayBurger = await TBurger.findAll({
      attributes: [["burger_id", "id"]],
    });
    const filter = todayBurger.map((e) => e.dataValues);
    console.log(filter);
    const result = await Burger.scope("burgersToday").findAll({
      where: {
        [Op.or]: filter,
      },
    });
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
// 오늘의버거 삭제
router.delete("/today", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await TBurger.findOne({ where: { id: req.body.id } })) {
      await TBurger.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BURGER_TODAY_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
/*                오늘의 버거 End               */

/*                버거 Start                    */
// 버거 이미지 등록
router.post("/image", verifyToken, isDirector, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(500).json({ code: "BURGER_IMAGE_UPLOAD" });
    }
    return res.status(200).json({ path: req.file.location });
  });
});

// 버거 등록
router.post("/", verifyToken, isDirector, async (req, res) => {
  try {
    if (
      await Brand.findOne({
        where: { id: req.body.brand_id },
      })
    ) {
      await Burger.create(req.body);
      res.status(200).json({});
    } else {
      res.status(400).json({ code: "BRAND_INVALID_ID" });
    }
  } catch (err) {
    if (err instanceof seq.ValidationError) {
      return res.status(400).json({
        code: "SEQUELIZE_VALIDATION_ERROR",
        message: err["errors"][0]["message"],
      });
    }
    res.status(500).json({ code: "ERROR", error: err });
  }
});

// 버거 조회
router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, Burger, {
      Brand,
      Review,
    });
    const result = await Burger.findAll(parsed);
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 버거 수정
router.put("/", verifyToken, isDirector, async (req, res) => {
  try {
    if (await Burger.findOne({ where: { id: req.body.id } })) {
      await Burger.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BURGER_INVALID_ID" });
  } catch (err) {
    if (err instanceof seq.ValidationError) {
      return res.status(400).json({
        code: "SEQUELIZE_VALIDATION_ERROR",
        message: err["errors"][0]["message"],
      });
    }
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 버거 삭제
router.delete("/", verifyToken, isDirector, async (req, res) => {
  try {
    if (await Burger.findOne({ where: { id: req.body.id } })) {
      await Burger.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BURGER_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
/*                버거 End                    */

export default router;
