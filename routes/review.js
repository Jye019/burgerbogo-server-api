import express from "express";
import { review } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await review.create(req.body);
    res.status(200).json({ message: "버거리뷰 작성 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await review.findAll();
    res.status(200).json({ message: "버거리뷰 전체읽기 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await review.findOne({ where: { id: req.params.id } });
    if (result) {
      res.status(200).json({ message: "버거리뷰 읽기 성공", data: result });
    } else {
      res.status(502).json({ message: "존재하지 않는 버거리뷰" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await review.findOne({ where: { id: req.body.id } })) {
      await review.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "버거리뷰 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거리뷰" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await review.destroy({ where: { id: req.body.id } });
    if (result === 1) res.status(200).json({ message: "버거리뷰 삭제 성공" });
    else res.status(502).json({ message: "존재하지 않는 버거리뷰" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;
