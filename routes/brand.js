import express from "express";
import { Brand } from "../models";
import { parseQueryString } from "../library/parsing";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await Brand.create(req.body);
    res.status(200).json({ message: "브랜드 추가 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(req.query);
    const result = await Brand.findAll(parsed);
    res.status(200).json({ message: "브랜드 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.body.id } })) {
      await Brand.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "브랜드 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await Brand.findOne({ where: { id: req.body.id } })) {
      await Brand.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "브랜드 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;
