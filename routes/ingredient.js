import express from "express";
import seq from "sequelize";
import { Ingredient, BIngredient, Burger } from "../models";
import { parseQueryString } from "../library/parsing";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*       재료       */
router.post("/", async (req, res) => {
  try {
    await Ingredient.create(req.body);
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

router.get("/", async (req, res) => {
  try {
    const parsed = parseQueryString(res, req.query, Ingredient);
    const result = await Ingredient.findAll(parsed);
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await Ingredient.findOne({ where: { id: req.body.id } })) {
      await Ingredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
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

router.delete("/", async (req, res) => {
  try {
    if (await Ingredient.findOne({ where: { id: req.body.id } })) {
      await Ingredient.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});
/* ------------------ */

/*    버거와 연결     */
router.post("/burger", async (req, res) => {
  try {
    if (!(await Burger.findOne({ where: { id: req.body.burger_id } }))) {
      return res.status(400).json({ code: "BURGER_INVALID_ID" });
    }
    if (
      !(await Ingredient.findOne({ where: { id: req.body.ingredient_id } }))
    ) {
      return res.status(400).json({ code: "INGREDIENT_INVALID_ID" });
    }
    await BIngredient.create(req.body);
    return res.status(200).json({});
  } catch (err) {
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
    const { where, attributes, include } = parseQueryString(res, req.query, {
      Burger,
      Ingredient,
    });
    const result = await BIngredient.findAll({ where, attributes, include });
    if (result) res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

router.put("/burger", async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.body.id } })) {
      await BIngredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_BURGER_INVALID_ID" });
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

router.delete("/burger", async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.body.id } })) {
      await BIngredient.destroy({ where: { id: req.body.id } });
      res.status(200).json({});
    } else res.status(400).json({ code: "INGREDIENT_BURGER_INVALID_ID" });
  } catch (err) {
    res.status(500).json({ code: "ERROR", error: err.stack });
  }
});

/* ------------------ */
export default router;
