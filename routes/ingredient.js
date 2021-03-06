import express from "express";
import seq from "sequelize";
import { Ingredient, BIngredient, Burger } from "../models";
import { parseQueryString } from "../library/parsing";
import middleware from "./middleware";
import { logger } from "../library/log";

const { verifyToken, isAdmin } = middleware;

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*       재료       */
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    await Ingredient.create(req.body);
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

router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, Ingredient);
    if (parsed.error)
      return res
        .status(406)
        .json({ code: parsed.code, message: parsed.message });
    const result = await Ingredient.findAll(parsed);
    res.status(200).json({ data: result });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.put("/", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await Ingredient.findOne({ where: { id: req.body.id } })) {
      await Ingredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
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
    if (await Ingredient.findOne({ where: { id: req.query.id } })) {
      await Ingredient.destroy({ where: { id: req.query.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
/* ------------------ */

/*    버거와 연결     */
router.post("/burger", verifyToken, isAdmin, async (req, res) => {
  try {
    if (!(await Burger.findOne({ where: { id: req.body.burger_id } }))) {
      return res.status(400).json({ code: "BURGER_INVALID_ID" });
    }
    for (let i = 0; i < req.body.ingredient_id.length; i += 1) {
      if (
        !(await Ingredient.findOne({
          where: { id: req.body.ingredient_id[i] }
        }))
      ) {
        return res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
      }
    }

    // 기존에 버거와 재료 연결돼있는 데이터 삭제
    await BIngredient.destroy({ where: { burger_id: req.body.burger_id } });

    // 버거와 재료 연결 
    const bulkData = req.body.ingredient_id.map((e) => {
      return { burger_id: req.body.burger_id, ingredient_id: e };
    });
    await BIngredient.bulkCreate(bulkData);
    return res.status(200).json({});
  } catch (err) {
    logger.log(err);
    if (err instanceof seq.ValidationError) {
      return res.status(400).json({
        code: "SEQUELIZE_VALIDATION_ERROR",
        message: err["errors"][0]["message"],
      });
    }
    return res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.get("/burger", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, BIngredient, {
      Burger,
      Ingredient,
    });
    if (parsed.error)
      return res
        .status(406)
        .json({ code: parsed.code, message: parsed.message });
    const result = await BIngredient.findAll(parsed);
    if (result) res.status(200).json({ data: result });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.put("/burger", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.body.id } })) {
      await BIngredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_BURGER_INVALID_ID" });
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

router.delete("/burger", verifyToken, isAdmin, async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.query.id } })) {
      await BIngredient.destroy({ where: { id: req.query.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_BURGER_INVALID_ID" });
  } catch (err) {
    logger.log(err);
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

/* ------------------ */
export default router;
