import express from "express";
import path from "path";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import seq, { Op, QueryTypes } from "sequelize";
import xlsx from "xlsx";
import db, { sequelize, Burger, TBurger, Review, Brand } from "../models";
import awscon from "../config/awsconfig.json";
import middleware from "./middleware";
import { logger } from "../library/log";

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
    logger.log(err);
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
    const tbList = await TBurger.findAll({
      attributes: [["burger_id", "id"]],
      raw: true,
    });
    // tbList = tbList.map((e) => e.burger_id);
    console.log(tbList);

    const result = await Burger.findAll({
      attributes: [
        "id",
        "name",
        "image",
        "price_single",
        "price_set",
        "price_combo",
      ],
      where: { [Op.or]: tbList },
      include: [{ model: Brand, attributes: ["name"] }],
      raw: true,
      nest: true,
    });

    const score = await Review.findAll({
      attributes: [
        "burger_id",
        [sequelize.fn("AVG", sequelize.col("score")), "score"],
      ],
      group: ["burger_id"],
      where: sequelize.literal(
        `burger_id IN (SELECT burger_id FROM burgers_today WHERE deleted_at IS NULL)`
      ),
      raw: true,
    });

    console.log(score);
    for (let i = 0; i < result.length; i += 1) {
      result[i].score = null;
      for (let j = 0; j < score.length; j += 1) {
        if (result[i].id === score[j].burger_id) {
          console.log("ㅁㄴㅇㅁㄴㅇㄴㅁㅇㄴㅁㅇ");
          result[i].score = Math.round(score[j].score * 10) / 10;
        }
      }
    }
    console.log(result);
    res.status(200).json({ data: result });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
// 오늘의버거 삭제
router.delete("/today", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await TBurger.findOne({ where: { id: req.query.id } })) {
      await TBurger.destroy({ where: { id: req.query.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BURGER_TODAY_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
/*                오늘의 버거 End               */

/*                버거 Start                    */
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await Burger.findAll({
      attributes: { exclude: ["brand_id", "deleted_at"] },
      include: [{ model: Brand, attributes: { exclude: ["deleted_at"] } }],
    });
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
// 버거 이미지 등록
router.post("/image", verifyToken, isDirector, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      logger.log(err);
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
      const { id } = await Burger.create(req.body);
      res.status(200).json({ data: { id } });
    } else {
      res.status(400).json({ code: "BRAND_INVALID_ID" });
    }
  } catch (err) {
    logger.log(err);
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
router.get("/:id", async (req, res) => {
  try {
    const reviewNum = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM reviews WHERE burger_id=?`,
      { replacements: [req.params.id], type: QueryTypes.SELECT, raw: true }
    );
    let result = await Burger.findOne({
      attributes: {
        exclude: ["created_at", "updated_at", "deleted_at"],
      },
      include: [
        {
          model: Brand,
          attributes: { exclude: ["created_at", "updated_at", "deleted_at"] },
        },
      ],
      where: { id: req.params.id },
      raw: true,
      nest: true,
    });
    const score = await sequelize.query(
      `SELECT AVG(score) AS score,AVG(sweet) AS sweet,AVG(sour) AS sour,AVG(salty) AS salty,AVG(spicy) AS spicy,AVG(greasy) AS greasy FROM reviews WHERE burger_id=?`,
      {
        replacements: [req.params.id],
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    result = { ...result, ...score[0], review_num: reviewNum[0].cnt };
    return res.status(200).json({ data: result });
  } catch (err) {
    logger.log(err);
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
    logger.log(err);
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
    if (await Burger.findOne({ where: { id: req.query.id } })) {
      await Burger.destroy({ where: { id: req.query.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BURGER_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

/*                버거 End                    */

// 엑셀로 입력
router.post("/xlsx" /* , verifyToken, isDirector */, async (req, res) => {
  uploadXlsx.single("xlsx")(req, res, async (err) => {
    try {
      if (err) {
        logger.log(err);
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
      logger.log(err2);
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

// 버거 이름 자동완성 검색
router.get("/autocomplete/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const list = await db.sequelize.query(
      `SELECT id, 
                             name,
                             (select name from brands where id = brand_id) as brand_name,
                             price_single, 
                             price_set,
                             price_combo,
                             image
                      FROM burgers
                      WHERE fn_search_csnt(name) like '%${keyword}%' 
                      OR name like '%${keyword}%'`,
      {
        type: QueryTypes.SELECT,
        nest: true,
      }
    );

    return res.status(200).json({
      code: "SUCCESS",
      data: list,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      code: "ERROR",
      error: err.stack,
    });
  }
});

export default router;
