import express from "express";
import seq from "sequelize";
import { Brand } from "../models";
import { parseQueryString } from "../library/parsing";
import middleware from "./middleware";
import { logger } from "../library/log";

const { verifyToken, isAdmin } = middleware;

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 브랜드 작성
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    await Brand.create(req.body);
    res.status(200).json({});
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

// 브랜드 조회
router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, Brand);
    if (parsed.error)
      return res
        .status(406)
        .json({ code: parsed.code, message: parsed.message });
    const result = await Brand.findAll(parsed);
    res.status(200).json({ data: result });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 브랜드 수정
router.put("/", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.body.id } })) {
      await Brand.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BRAND_INVALID_ID" });
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

router.delete("/", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.query.id } })) {
      await Brand.destroy({ where: { id: req.query.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "BRAND_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

export default router;
