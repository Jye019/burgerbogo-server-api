import express from "express";
import path from "path";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { Op } from "sequelize";
import models, { Burger, TBurger, Brand } from "../models";
import awscon from "../config/awsconfig.json";

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
router.post("/today", async (req, res) => {
  try {
    if (
      await Burger.findOne({
        where: { id: req.body.burger_id },
      })
    ) {
      await TBurger.create(req.body);
      res.status(200).json({ message: "오늘의 버거 작성 성공" });
    } else {
      res.status(502).json({ message: "존재하지 않는 버거" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});
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
    res.status(200).json({ message: "오늘의 버거 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});
router.delete("/today", async (req, res) => {
  try {
    if (await TBurger.findOne({ where: { id: req.body.id } })) {
      await TBurger.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "오늘의 버거 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 오늘의 버거" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});
/*                오늘의 버거 End               */

/*                버거 Start                    */
router.post("/image", upload.single("image"), (req, res) => {
  res
    .status(200)
    .json({ message: "버거사진 업로드 성공", path: req.file.location });
});

router.post("/", async (req, res) => {
  try {
    if (
      await Brand.findOne({
        where: { id: req.body.brand_id },
      })
    ) {
      await Burger.create(req.body);
      res.status(200).json({ message: "버거 작성 성공" });
    } else {
      res.status(502).json({ message: "존재하지 않는 브랜드" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

// router.get("/limit/:limit/:order", async (req, res) => {
//   try {
//     const result = await Burger.findAll({
//       offset: 0,
//       limit: req.params.limit * 1,
//       order: [["createdAt", req.params.order]],
//       include: [{ model: Brand, attributes: ["name"] }],
//     });
//     res.status(200).json({
//       message: `${req.params.limit}개의 버거 ${req.params.order}로 조회 성공`,
//       data: result,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "오류 발생", error: err.stack });
//   }
// });

router.get("/", async (req, res) => {
  try {
    let includeTmp = [];
    let attributeTmp = [];

    if (req.query._include) {
      includeTmp = req.query._include.split(",");
      delete req.query._include;
    }
    if (req.query._attribute) {
      attributeTmp = req.query._attribute.split(",");
      delete req.query._attribute;
    }
    const where = req.query;

    const include = [];
    let attributes = [];

    if (includeTmp) {
      includeTmp.forEach((inc) => {
        include.push({ model: models[inc] });
      });
    }
    if (attributeTmp) {
      attributeTmp.forEach((att) => {
        const split = att.split(".");
        if (split.length === 1) attributes.push(split[0]);
        else {
          include.forEach((e) => {
            if (e.model === models[split[0]]) {
              if (!e.attributes) e.attributes = [];
              e.attributes.push(split[1]);
            }
          });
        }
      });
    }

    if (attributes.length === 0) attributes = null;
    console.log({
      include,
      where,
      attributes,
    });

    const result = await Burger.findAll({
      include,
      where,
      attributes,
    });
    if (result) {
      res.status(200).json({ message: "버거 조회 성공", data: result });
    } else {
      res.status(502).json({ message: "일치하는 버거 없음" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await Burger.findOne({ where: { id: req.body.id } })) {
      await Burger.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "버거 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await Burger.findOne({ where: { id: req.body.id } })) {
      await Burger.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "버거 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});
/*                버거 End                    */

export default router;
