import express from "express";
import { brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/add", async (req, res, next) => {
  try {
    const addBrand = await brand.create(req.body);
    res.json(addBrand);
  } catch (err) {
    next(err);
  }
});

export default router;
