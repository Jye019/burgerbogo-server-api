import express from "express";
import { brand } from "../models";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/", async (req, res) => {
  try {
    await brand.create(req.body);
    res.status(200).json({ message: "브랜드 추가 성공" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
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
    if (result) {
      res.status(200).json({ message: "브랜드 읽기 성공", data: result });
    } else {
      res.status(502).json({ message: "존재하지 않는 브랜드" });
    }
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.put("/", async (req, res) => {
  try {
    if (await brand.findOne({ where: { id: req.body.id } })) {
      await brand.update(req.body.data, { where: { id: req.body.id } });
      res.status(200).json({ message: "브랜드 수정 성공" });
    } else res.status(502).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

router.delete("/", async (req, res) => {
  try {
    const result = await brand.destroy({ where: { id: req.body.id } });
    if (result === 1) res.status(200).json({ message: "브랜드 삭제 성공" });
    else res.status(502).json({ message: "존재하지 않는 브랜드" });
  } catch (err) {
    res.status(500).json({ message: "오류 발생", error: err.stack });
  }
});

export default router;

/**
 * @swagger
 *  /brand:
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
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  example: 브랜드 추가 성공
 *       '500':
 *        description: 오류 발생
 *        schema:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  example: 오류 발생
 *              error:
 *                  type: string
 *                  example: 에러 내용
 */

/**
 * @swagger
 *  /brand:
 *    get:
 *      tags:
 *      - brand
 *      description: 전체 브랜드 조회
 *      produces:
 *      - applicaion/json
 *      responses:
 *       '200':
 *        description: 전체 브랜드 조회 성공
 *        schema:
 *            type: object
 *            properties:
 *                message:
 *                    type: string
 *                    example: 브랜드 전체읽기 성공
 *                data:
 *                    type: array
 *                    items:
 *                        type: object
 *                    example:
 *                        - id: 1
 *                          name: 맥도날드
 *                          createdAt: 2020-08-20T12:29:43.000Z
 *                          updatedAt: 2020-08-20T12:29:43.000Z
 *                          deletedAt:
 *                        - id: 2
 *                          name: 버거킹
 *                          createdAt: 2020-08-20T14:03:51.000Z
 *                          updatedAt: 2020-08-20T14:03:51.000Z
 *                          deletedAt:
 */

/**
 * @swagger
 *  /brand/{id}:
 *    get:
 *      tags:
 *      - brand
 *      description: 브랜드 조회
 *      produces:
 *      - applicaion/json
 *      parameters:
 *      - name: id
 *        in: body
 *        description: "브랜드 id"
 *        required: true
 *        type: boolean
 *      responses:
 *       '200':
 *        description: 브랜드 조회
 *        schema:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  example: 브랜드 읽기 성공
 *              data:
 *                  type: object
 *                  properties:
 *                      id:
 *                          type: number
 *                          example: 1
 *                      name:
 *                          type: string
 *                          example: 버거킹
 *                      createdAt:
 *                          type: string
 *                          example: 2020-08-23T07:18:10.000Z
 *                      updatedAt:
 *                          type: string
 *                          example: 2020-08-23T07:18:10.000Z
 *                      deletedAt:
 *                          type: string
 *                          example:
 *
 */

/**
 * @swagger
 *  /brand:
 *    put:
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

/**
 * @swagger
 *  /brand:
 *    delete:
 *      tags:
 *      - brand
 *      description: 브랜드를 삭제한다.
 *      produces:
 *      - applicaion/json
 *      parameters:
 *      - in: body
 *        name: brandID
 *        description: "브랜드 ID"
 *        schema:
 *            type: object
 *            required:
 *                - id
 *            properties:
 *                id:
 *                    type: number
 *                    example: 1
 *      responses:
 *       '200':
 *        description: 브랜드 삭제 성공
 *        schema:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  example: 브랜드 삭제 성공
 */
