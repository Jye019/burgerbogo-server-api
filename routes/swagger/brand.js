/**
 * @swagger
 *  /brand:
 *    post:
 *      summary: 브랜드 추가
 *      tags: [brand]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/addBrandDto'
 *      responses:
 *       '200':
 *        description: 브랜드 추가 성공
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 브랜드 추가 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 오류 발생
 *                      error:
 *                          type: string
 *                          example: content of error
 */

/**
 * @swagger
 *  /brand:
 *    get:
 *      summary: 전체 브랜드 조회
 *      tags: [brand]
 *      responses:
 *       '200':
 *        description: 전체 브랜드 조회 성공
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 전체 브랜드 조회 성공
 *                      data:
 *                          type: array
 *                          items:
 *                              type: object
 *                          example:
 *                              - id: 1
 *                                name: 맥도날드
 *                                createdAt: 2020-08-20T12:29:43.000Z
 *                                updatedAt: 2020-08-20T12:29:43.000Z
 *                                deletedAt:
 *                              - id: 2
 *                                name: 버거킹
 *                                createdAt: 2020-08-20T14:03:51.000Z
 *                                updatedAt: 2020-08-20T14:03:51.000Z
 *                                deletedAt:
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 오류 발생
 *                      error:
 *                          type: string
 *                          example: content of error
 */

/**
 * @swagger
 *  /brand/{id}:
 *    get:
 *      summary: 특정 브랜드 조회
 *      tags: [brand]
 *      parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *          minimum: 1
 *          example: 1
 *        description: 브랜드 ID
 *      responses:
 *       '200':
 *        description: 브랜드 조회
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 브랜드 조회 성공
 *                      data:
 *                          type: object
 *                          properties:
 *                              id:
 *                                  type: number
 *                                  example: 1
 *                              name:
 *                                  type: string
 *                                  example: 버거킹
 *                              createdAt:
 *                                  type: string
 *                                  example: 2020-08-23T07:18:10.000Z
 *                              updatedAt:
 *                                  type: string
 *                                  example: 2020-08-23T07:18:10.000Z
 *                              deletedAt:
 *                                  type: string
 *                                  example:
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 오류 발생
 *                      error:
 *                          type: string
 *                          example: content of error
 *       '502':
 *        description: 존재하지 않는 브랜드
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 존재하지 않는 브랜드
 */

/**
 * @swagger
 *  /brand:
 *    put:
 *      summary: 브랜드 수정
 *      tags: [brand]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/modifyBrandDto'
 *      responses:
 *       '200':
 *        description: 브랜드 수정 성공
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 브랜드 수정 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          applicaiton/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 오류 발생
 *                      error:
 *                          type: string
 *                          example: content of error
 *       '502':
 *        description: 존재하지 않는 브랜드
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 존재하지 않는 브랜드
 */

/**
 * @swagger
 *  /brand:
 *    delete:
 *      summary: 브랜드 삭제
 *      tags: [brand]
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - id
 *                      properties:
 *                          id:
 *                              type: number
 *                              description: 삭제할 브랜드 ID
 *                              example: 1
 *      responses:
 *       '200':
 *        description: 브랜드 삭제 성공
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 브랜드 삭제 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 오류 발생
 *                      error:
 *                          type: string
 *                          example: content of error
 *       '502':
 *        description: 존재하지 않는 브랜드
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 존재하지 않는 브랜드
 */
