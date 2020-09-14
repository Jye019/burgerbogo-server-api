import express from "express";
import path from "path";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import seq, { Op } from "sequelize";
import xlsx from "xlsx";
import { sequelize, Burger, TBurger, Brand, Review } from "../models";
import { parseQueryString } from "../library/parsing";
import awscon from "../config/awsconfig.json";
import middleware from "./middleware";

const { verifyToken, isAdmin, isDirector } = middleware;

// 사진 Upload 설정 부분
aws.config.accessKeyId = awscon.accessKeyId;
aws.config.secretAccessKey = awscon.secretAccessKey;
aws.config.region = awscon.region;

const s3 = new aws.S3();

// 버거 이미지 업로드 부분
const upload = multer({
  storage: multerS3({
    s3,
    bucket: awscon.bucket,
    key: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      req.test = "23213"; // ★★★★★
      cb(null, `${Date.now().toString()}${extension}`);
    },
    acl: "public-read-write",
  }),
});

// 엑셀 업로드 부분
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/xlsx/burger");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const uploadXlsx = multer({ storage });

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
      raw: true,
    });
    const filter = todayBurger.map((e) => e);
    console.log(filter);

    const result = await Burger.scope("burgersToday").findAll({
      where: {
        [Op.or]: filter,
      },
      raw: true,
    });
    for (let i = 0; i < filter.length; i += 1) {
      const getScore = await sequelize.query(
        "SELECT AVG(score) AS score FROM reviews WHERE burger_id=? AND score IS NOT NULL",
        { type: seq.QueryTypes.SELECT, replacements: [filter[i].id] }
      );
      for (let j = 0; j < result.length; j += 1) {
        if (result[j].id === filter[i].id) {
          result[j].score = getScore[0].score;
        }
      }
    }
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
    console.log(req.test); // ★★★★★
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
    if (parsed.error)
      return res
        .status(406)
        .json({ code: parsed.code, message: parsed.message });
    const found = await Burger.findAll({ ...parsed, raw: true });
    let withScore = {};
    if (req.query.id) {
      const score = await sequelize.query(
        "SELECT AVG(score) AS score FROM reviews WHERE burger_id=? AND score IS NOT NULL",
        { type: seq.QueryTypes.SELECT, replacements: [req.query.id] }
      );
      const flavor = await sequelize.query(
        "SELECT AVG(sweet) AS sweet,AVG(sour) AS sour,AVG(salty) AS salty,AVG(spicy) AS spicy,AVG(greasy) AS greasy FROM reviews WHERE burger_id=? AND sweet IS NOT NULL",
        { type: seq.QueryTypes.SELECT, replacements: [req.query.id] }
      );
      withScore = Object.assign(found[0], score[0], flavor[0]);
      return res.status(200).json({ data: [withScore] });
    }
    return res.status(200).json({ data: found });
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

// 리뷰 평점평균
router.get("/score/:id", async (req, res) => {
  try {
    const result = await sequelize.query(
      "SELECT AVG(score) AS score FROM reviews WHERE burger_id=? AND score IS NOT NULL",
      { type: seq.QueryTypes.SELECT, replacements: [req.params.id] }
    );
    const result2 = await sequelize.query(
      "SELECT AVG(sweet) AS sweet,AVG(sour) AS sour,AVG(salty) AS salty,AVG(spicy) AS spicy,AVG(greasy) AS greasy FROM reviews WHERE burger_id=? AND sweet IS NOT NULL",
      { type: seq.QueryTypes.SELECT, replacements: [req.params.id] }
    );
    res.status(200).json({
      data: {
        score: result[0].score,
        sweet: result2[0].sweet,
        sour: result2[0].sour,
        salty: result2[0].salty,
        spicy: result2[0].spicy,
        greasy: result2[0].greasy,
      },
    });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

/*                버거 End                    */

// 엑셀로 입력
router.post("/xlsx" /* , verifyToken, isDirector */, async (req, res) => {
  uploadXlsx.single("xlsx")(req, res, async (err) => {
    try {
      if (err) {
        return res
          .status(500)
          .json({ code: "BURGER_XLSX_UPLOAD", message: err });
      }
      const workbook = xlsx.readFile(
        `./uploads/xlsx/burger/${req.file.originalname}`
      );
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = xlsx.utils.sheet_to_json(worksheet);
      const result = await Burger.bulkCreate(parsed /* , { validate: true } */);
      if (result) return res.status(200).json({});
    } catch (err2) {
      if (err2 instanceof seq.ForeignKeyConstraintError) {
        return res.status(400).json({
          code: "SEQUELIZE_WRONG_FOREIGN_KEY",
          message: err2["fields"][0],
        });
      }
      return res.status(500).json({ code: "ERROR", message: err2 });
    }
  });
});

export default router;
