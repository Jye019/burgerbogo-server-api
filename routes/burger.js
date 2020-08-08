import express from "express";
import { burger } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/add", async (req, res, next) => {
  try {
    const addBurger = await burger.create(req.body);
    res.json(addBurger);
  } catch (err) {
    next(err);
  }
});

export default router;
