import express from "express";
import { brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/add", async (req, res) => {
  try {
    await brand.create(req.body);
    res.status(200).json({ message: "성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생" });
  }
});

export default router;
