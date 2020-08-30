import express from "express";
import { Review, Burger, Brand, User } from "../models";
import { parseQueryString } from "../library/parsing";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await Review.create(req.body);
    res.status(200).json({ message: "버거리뷰 추가 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(req.query, {
      Burger,
      User,
    });
    const result = await Review.findAll(parsed);
    res.status(200).json({ message: "버거리뷰 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/limit/:limit", async (req, res) => {
  try {
    const result = await Review.scope("newReview").findAll({
      offset: 0,
      limit: req.params.limit * 1,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Burger,
          attributes: [
            "name",
            "price_single",
            "price_set",
            "price_combo",
            "image",
          ],
          include: [{ model: Brand, attributes: ["name"] }],
        },
      ],
    });
    res.status(200).json({
      message: `${req.params.limit}개의 최신 버거리뷰 조회 성공`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await Review.findOne({ where: { id: req.params.id } });
    if (result) {
      res.status(200).json({ message: "버거리뷰 조회 성공", data: result });
    } else {
      res.status(502).json({ message: "존재하지 않는 버거리뷰" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await Review.findOne({ where: { id: req.body.id } })) {
      await Review.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "버거리뷰 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거리뷰" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await Review.findOne({ where: { id: req.body.id } })) {
      await Review.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "버거리뷰 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 버거리뷰" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;
