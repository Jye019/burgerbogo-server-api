import express from "express";
import { burger } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await burger.create({ ...req.body, create_at: new Date() });
    res.status(200).json({ message: "버거상세 작성 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await burger.findAll();
    res.status(200).json({ message: "버거상세 전체읽기 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await burger.findOne({ where: { id: req.params.id } });
    if (result) {
      res.status(200).json({ message: "버거상세 읽기 성공", data: result });
    } else {
      res.status(502).json({ message: "존재하지 않는 버거상세" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await burger.findOne({ where: { id: req.body.id } })) {
      await burger.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "버거상세 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거상세" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await burger.destroy({ where: { id: req.body.id } });
    if (result === 1) res.status(200).json({ message: "버거상세 삭제 성공" });
    else res.status(502).json({ message: "존재하지 않는 버거상세" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;
