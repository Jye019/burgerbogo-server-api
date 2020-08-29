import express from "express";
import { Ingredient, BIngredient, Burger } from "../models";
import { parseQueryString } from "../library/parsing";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*       재료       */
router.post("/", async (req, res) => {
  try {
    await Ingredient.create(req.body);
    res.status(200).json({ message: "재료 추가 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const { where, attributes } = parseQueryString(req.query);
    const result = await Ingredient.findAll({ where, attributes });
    res.status(200).json({ message: "재료 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await Ingredient.findOne({ where: { id: req.body.id } })) {
      await Ingredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "재료 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 재료" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await Ingredient.findOne({ where: { id: req.body.id } })) {
      await Ingredient.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "재료 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 재료" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});
/* ------------------ */

/*    버거와 연결     */
router.post("/burger", async (req, res) => {
  try {
    await BIngredient.create(req.body);
    res.status(200).json({ message: "재료in버거 추가 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/burger", async (req, res) => {
  try {
    const { where, attributes, include } = parseQueryString(req.query, {
      Burger,
      Ingredient,
    });
    const result = await BIngredient.findAll({ where, attributes, include });
    res.status(200).json({ message: "재료in버거 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/burger", async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.body.id } })) {
      await BIngredient.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "재료in버거 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 재료in버거" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/burger", async (req, res) => {
  try {
    if (await BIngredient.findOne({ where: { id: req.body.id } })) {
      await BIngredient.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "재료in버거 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 재료" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

/* ------------------ */
export default router;
