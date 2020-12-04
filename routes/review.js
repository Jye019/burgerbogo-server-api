/* eslint no-await-in-loop: 0 */

import express from "express";
import seq, { Op, QueryTypes } from "sequelize";
import { Review, User, Burger, sequelize } from "../models";
import middleware from "./middleware";
import { logger } from "../library/log";

const { verifyToken } = middleware;

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// 최신리뷰 조회
router.get("/recent/:limit", async (req, res) => {
  try {
    const grouping = await sequelize.query(
      `select * from (
  select id
       , burger_id
       , burger_id as 'Burger.id'
       , (select name from burgers where id=burger_id) as 'Burger.name'
       , (select price_single from burgers where id=burger_id) as 'Burger.price_single'
       , (select price_set from burgers where id=burger_id) as 'Burger.price_set'
       , (select price_combo from burgers where id=burger_id) as 'Burger.price_combo'
       , (select image from burgers where id=burger_id) as 'Burger.image'
       , (select brand_id from burgers where id=burger_id) as 'Burger.Brand.id'
       , (select name from brands where id=(select brand_id from burgers where id=burger_id)) as 'Burger.Brand.name'
	from reviews order by updated_at desc
)review group by burger_id limit ?`,
      {
        type: QueryTypes.SELECT,
        replacements: [req.params.limit * 1],
        nest: true,
      }
    );
    for (let i = 0; i < grouping.length; i += 1) {
      const score = await sequelize.query(
        `select avg(score) as score from reviews group by burger_id having burger_id=?`,
        {
          type: QueryTypes.SELECT,
          replacements: [grouping[i].burger_id],
          raw: true,
        }
      );
      grouping[i].Burger.score = Math.round(score[0].score * 10) / 10;
    }
    res.status(200).json({
      data: grouping,
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
        order: [["updated_at", "desc"]],
        attributes: ["id", "score", "content", "created_at", "updated_at"],
        include: [
          { model: User, attributes: ["nickname"] },
          { model: Burger, attributes: ["name"] },
        ],
      });
      const totalCount = await sequelize.query(
        `SELECT COUNT(*) as cnt FROM reviews WHERE deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res
        .status(200)
        .json({ meta: { totalCount: totalCount[0].cnt }, data: result });
    } else {
      let where = {};
      if (req.query.userId) {
        where = {
          burger_id: req.query.burgerId,
          [Op.not]: { user_id: req.query.userId },
        };
      } else {
        where = {
          burger_id: req.query.burgerId,
        };
      }
      result = await Review.findAll({
        limit: req.query.limit ? req.query.limit * 1 : 10,
        offset: req.query.page
          ? (req.query.page - 1) * (req.query.limit ? req.query.limit : 10)
          : 0,
        where,
        attributes: { exclude: ["burger_id"] },
        order: [["updated_at", "desc"]],
        include: [{ model: User, attributes: ["id", "nickname"] }],
        raw: true,
        nest: true,
      });
      if (req.query.page === "1" && req.query.userId) {
        console.log("★");
        const myReview = await Review.findOne({
          where: { user_id: req.query.userId, burger_id: req.query.burgerId },
          include: [{ model: User, attributes: ["id", "nickname"] }],
          attributes: { exclude: ["burger_id"] },
          raw: true,
          nest: true,
        });
        if (myReview) {
          result.unshift(myReview);
        }
        console.log(result);
      }
      res.status(200).json({ data: result });
    }
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

// 리뷰 추가
router.put("/", verifyToken, async (req, res) => {
  try {
    const isExist = await Review.findOne({
      where: { burger_id: req.body.burger_id, user_id: req.atoken.id },
    });
    if (!isExist) {
      const { id } = await Review.create({
        user_id: req.atoken.id,
        burger_id: req.body.burger_id,
        ...req.body.data,
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
    await Review.update(req.body.data, {
      where: { user_id: req.atoken.id, burger_id: req.body.burger_id },
    });
    const result = await Review.findOne({
      where: { user_id: req.atoken.id, burger_id: req.body.burger_id },
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
// router.put("/", verifyToken, async (req, res) => {
//   try {
//     const current = await Review.findOne({ where: { id: req.body.id } });
//     if (current) {
//       if (
//         current.user_id === req.atoken.id ||
//         req.atoken.user_level === 10000
//       ) {
//         await Review.update(req.body.data, { where: { id: req.body.id } });
//         res.status(200).json({});
//       } else {
//         res.status(401).json({ code: "REVIEW_WRONG_USER" });
//       }
//     } else res.status(400).json({ code: "REVIEW_INVALID_ID" });
//   } catch (err) {
//     logger.log(err);
//     if (err instanceof seq.ValidationError) {
//       return res.status(400).json({
//         code: "SEQUELIZE_VALIDATION_ERROR",
//         message: err["errors"][0]["message"],
//       });
//     }
//     res.status(500).json({ code: "ERROR", error: err.stack });
//   }
// });

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
        res.status(200).json({ code: "REVIEW_SUCCESS" });
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
