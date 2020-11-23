import express from "express";
import seq from "sequelize";
import { Review, User, Burger } from "../models";
import middleware from "./middleware";
import { logger } from "../library/log";

const { verifyToken } = middleware;

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 최신리뷰 조회
router.get("/recent/:limit", async (req, res) => {
  try {
    const result = await Review.scope("newReview").findAll({
      offset: 0,
      limit: req.params.limit * 1,
      raw: true,
      nest: true,
    });
    for (let i = 0; i < result.length; i += 1) {
      result[i].Burger.score = result[i].score;
      delete result[i].score;
    }
    res.status(200).json({
      data: result,
    });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 리뷰 조회
router.get("/", async (req, res) => {
  try {
    let result = {};
    if (!req.query.burgerId) {
      result = await Review.findAll({
        limit: req.query.limit ? req.query.limit * 1 : 10,
        offset: req.query.page
          ? (req.query.page - 1) * (req.query.limit ? req.query.limit : 10)
          : 0,
        order: [["created_at", "desc"]],
        attributes: ["id", "score", "content", "created_at"],
        include: [
          { model: User, attributes: ["nickname"] },
          { model: Burger, attributes: ["name"] },
        ],
      });
    } else {
      result = await Review.findAll({
        limit: req.query.limit ? req.query.limit * 1 : 10,
        offset: req.query.page
          ? (req.query.page - 1) * (req.query.limit ? req.query.limit : 10)
          : 0,
        where: { burger_id: req.query.burgerId },
        order: [["created_at", "desc"]],
        include: [{ model: User, attributes: ["id", "nickname"] }],
      });
    }
    const totalCount = await Review.count();
    res.status(200).json({ meta: { totalCount }, data: result });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 리뷰 추가
router.post("/", verifyToken, async (req, res) => {
  try {
    const isExist = await Review.findOne({
      where: { burger_id: req.body.burger_id, user_id: req.atoken.id },
    });
    if (!isExist) {
      const { id } = await Review.create({
        user_id: req.atoken.id,
        ...req.body,
      });
      const result = await Review.findOne({
        where: { id },
        attributes: {
          exclude: [
            "sweet",
            "sour",
            "salty",
            "spicy",
            "greasy",
            "user_id",
            "deleted_at",
          ],
        },
        include: [{ model: User, attributes: ["id", "nickname"] }],
      });
      return res.status(200).json({ data: result });
    }
    return res.status(500).json({ code: "REVIEW_WRONG_USER" });
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

// 리뷰 수정
router.put("/", verifyToken, async (req, res) => {
  try {
    const current = await Review.findOne({ where: { id: req.body.id } });
    if (current) {
      if (
        current.user_id === req.atoken.id ||
        req.atoken.user_level === 10000
      ) {
        await Review.update(req.body.data, { where: { id: req.body.id } });
        res.status(200).json({});
      } else {
        res.status(401).json({ code: "REVIEW_WRONG_USER" });
      }
    } else res.status(400).json({ code: "REVIEW_INVALID_ID" });
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

// 리뷰 삭제
router.delete("/", verifyToken, async (req, res) => {
  try {
    const current = await Review.findOne({ where: { id: req.query.id } });
    if (current) {
      if (
        current.user_id === req.atoken.id ||
        req.atoken.user_level === 10000
      ) {
        await Review.destroy({ where: { id: req.query.id } });
        res.status(200).json({});
      } else {
        res.status(401).json({ code: "REVIEW_WRONG_USER" });
      }
    } else res.status(400).json({ code: "REVIEW_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 내가 쓴 리뷰 조회
router.get("/my", verifyToken, async (req, res) => {
  try {
    const list = await Review.scope("myReview").findAll({
      where: { user_id: req.atoken.id },
    });

    res.status(200).json({
      code: "REVIEW_SUCCESS",
      data: list,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.get("/test", async (req, res) => {
  const result = await Review.findAll({
    where: { burger_id: 1 },
    include: [{ model: User }],
  });
  res.json(result);
});
export default router;

// 단일 리뷰 조회
router.get("/:id", async (req, res) => {
  try {
    const result = await Review.findOne({
      where: { burger_id: req.params.id },
      include: [{ model: User, attributes: ["id", "nickname"] }],
    });
    return res.status(200).json({ data: result });
  } catch (err) {
    return res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
