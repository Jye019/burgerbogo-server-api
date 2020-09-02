import express from "express";
import { Brand } from "../models";
import { parseQueryString } from "../library/parsing";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 브랜드 작성
router.post("/", async (req, res) => {
  try {
    await Brand.create(req.body);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 브랜드 조회
router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(req.query);
    const result = await Brand.findAll(parsed);
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 브랜드 수정
router.put("/", async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.body.id } })) {
      await Brand.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(406).json({ code: "BRAND_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.body.id } })) {
      await Brand.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(406).json({ code: "BRAND_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

export default router;
