import express from "express";
import { Burger, TBurger, Brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

/*                오늘의 버거 Start               */

router.post("/", async (req, res) => {
  try {
    if (
      await Burger.findOne({
        where: { id: req.body.burger_id },
      })
    ) {
      await TBurger.create(req.body);
      res.status(200).json({ message: "오늘의 버거 작성 성공" });
    } else {
      res.status(502).json({ message: "존재하지 않는 버거" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await TBurger.findAll({
      include: [
        {
          model: Burger.scope("burgersToday"),
          include: [{ model: Brand.scope("burgersToday") }],
        },
      ],
    });
    res.status(200).json({ message: "오늘의 버거 조회 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    if (await TBurger.findOne({ where: { id: req.body.id } })) {
      await TBurger.destroy({ where: { id: req.body.id } });
      res.status(200).json({ message: "오늘의 버거 삭제 성공" });
    } else res.status(502).json({ message: "존재하지 않는 오늘의 버거" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;
