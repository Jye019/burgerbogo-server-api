import express from "express";
import { brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await brand.create(req.body);
    res.status(200).json({ message: "브랜드 작성 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await brand.findAll();
    res.status(200).json({ message: "브랜드 전체읽기 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await brand.findOne({ where: { id: req.params.id } });
    res.status(200).json({ message: "브랜드 읽기 성공", data: result });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await brand.findOne({ where: { id: req.body.id } })) {
      await brand.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "브랜드 수정 성공" });
    } else res.status(200).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await brand.destroy({ where: { id: req.body.id } });
    if (result === 1) res.status(200).json({ message: "브랜드 삭제 성공" });
    else res.status(200).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;

/**
 * @swagger
 * definitions:
 *  newBrand:
 *   type: object
 *   required:
 *     - name
 *   properties:
 *     name:
 *       type: string
 *       description: 브랜드 이름
 */

/**
 * @swagger
 *  /brand/add:
 *    post:
 *      tags:
 *      - brand
 *      description: 브랜드를 추가한다.
 *      produces:
 *      - applicaion/json
 *      parameters:
 *      - name: name
 *        in: body
 *        description: "브랜드 이름"
 *        required: true
 *        type: string
 *      responses:
 *       '200':
 *        description: 브랜드 추가 성공
 *        schema:
 *          $ref: '#/definitions/newBrand'
 */
