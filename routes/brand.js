import express from "express";
import { brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

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

router.post("/add", async (req, res, next) => {
  try {
    await brand.create(req.body);
    res.status(200).json({ message: "성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생" });
  }
});

export default router;
