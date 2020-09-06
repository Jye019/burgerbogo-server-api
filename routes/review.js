import express from "express";
import seq from "sequelize";
import { Review, Burger, User } from "../models";
import { parseQueryString } from "../library/parsing";
import middleware from "./middleware";

const { verifyToken } = middleware;

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 리뷰 추가
router.post("/", verifyToken, async (req, res) => {
  try {
    await Review.create(req.body);
    res.status(200).json({});
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

// 리뷰 조회
router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, Review, {
      Burger,
      User,
    });
    const result = await Review.findAll(parsed);
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 최신리뷰 조회
router.get("/recent/:limit", async (req, res) => {
  try {
    const result = await Review.scope("newReview").findAll({
      offset: 0,
      limit: req.params.limit * 1,
    });
    res.status(200).json({
      data: result,
    });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 리뷰 수정
router.put("/", verifyToken, async (req, res) => {
  try {
    if (await Review.findOne({ where: { id: req.body.id } })) {
      await Review.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "REVIEW_INVALID_ID" });
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

// 리뷰 삭제
router.delete("/", verifyToken, async (req, res) => {
  try {
    if (await Review.findOne({ where: { id: req.body.id } })) {
      await Review.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "REVIEW_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

export default router;
