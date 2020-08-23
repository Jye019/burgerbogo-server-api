/**
 * @swagger
 *  /burger:
 *    post:
 *      summary: 버거 추가
 *      tags: [burger]
 *      requestBody:
 *          content:
 *              application/json:
 *                 schema:
 *                     type: object
 *                     required:
 *                         - name
 *                     properties:
 *                         name:
 *                             type: string
 *                             example: 폴더버거
 *                             description: 이름
 *                         price_single:
 *                             type: number
 *                             example: 3900
 *                             description: 단품 가격
 *                         price_set:
 *                             type: number
 *                             example: 5800
 *                             description: 세트 가격
 *                         price_combo:
 *                             type: number
 *                             example: 4800
 *                             description: 콤보 가격
 *                         calorie:
 *                             type: number
 *                             example: 492
 *                             description: 총 칼로리(열량)
 *                         image:
 *                             type: string
 *                             example: https://example-storage/folderburger.png
 *                             description: 이미지 주소
 *                         releasedAt:
 *                             type: string
 *                             example: 2020-06-28
 *                             description: 출시일
 *                         weight:
 *                             type: number
 *                             example: 300
 *                             description: 중량
 *                         protein:
 *                             type: number
 *                             example: 250
 *                             description: 단백질
 *                         natrium:
 *                             type: number
 *                             example: 220
 *                             description: 나트륨
 *                         sugar:
 *                             type: number
 *                             example: 300
 *                             description: 당분
 *                         saturated_fat:
 *                             type: number
 *                             example: 200
 *                             description: 포화지방
 *      responses:
 *       '200':
 *        description: 버거 추가 성공
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 버거 추가 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 오류 발생
 *                   error:
 *                       type: string
 *                       example: content of error
 *       '502':
 *        description: 브랜드 아이디가 잘못 되었을 시
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 존재하지 않는 브랜드
 */

/**
 * @swagger
 *  /burger:
 *    get:
 *      summary: 전체 버거 조회
 *      tags: [burger]
 *      responses:
 *       '200':
 *        description: 전체 버거 조회 성공
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      message:
 *                          type: string
 *                          example: 전체 버거 조회 성공
 *                      data:
 *                          type: array
 *                          items:
 *                              type: object
 *                          example:
 *                              - id: 1
 *                                brand_id: 1
 *                                name: 핫크리스피 치킨버거
 *                                price_single: 3800
 *                                price_set: 5600
 *                                price_combo: 4800
 *                                calorie: 560
 *                                image: https://example-storage/burger.png
 *                                releasedAt: 2020-06-28
 *                                weight: 300
 *                                protein: 500
 *                                natrium: 250
 *                                sugar: 200
 *                                saturated_fat: 300
 *                                createdAt: 2020-08-20 20:12:05
 *                                updatedAt: 2020-08-23 22:12:05
 *                                deletedAt: null
 *                              - id: 2
 *                                brand_id: 2
 *                                name: 빅맥
 *                                price_single: 3900
 *                                price_set: 5800
 *                                price_combo: null
 *                                calorie: 600
 *                                image: https://example-storage/burger2.png
 *                                releasedAt: 1996-03-01
 *                                weight: 420
 *                                protein: 500
 *                                natrium: 180
 *                                sugar: 300
 *                                saturated_fat: 300
 *                                createdAt: 2020-06-13 06:45:31
 *                                updatedAt: 2020-06-15 08:12:05
 *                                deletedAt: 2020-08-08 18:05:08
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 오류 발생
 *                   error:
 *                       type: string
 *                       example: content of error
 */

/**
 * @swagger
 *  /burger/{id}:
 *    get:
 *      summary: 특정 버거 조회
 *      tags: [burger]
 *      parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: integer
 *          minimum: 1
 *          example: 2
 *        description: 버거 ID
 *      responses:
 *       '200':
 *        description: 버거 조회 성공
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 버거 조회 성공
 *                   data:
 *                       type: object
 *                       example:
 *                           - id: 2
 *                             brand_id: 2
 *                             name: 빅맥
 *                             price_single: 3900
 *                             price_set: 5800
 *                             price_combo: null
 *                             calorie: 600
 *                             image: https://example-storage/burger2.png
 *                             releasedAt: 1996-03-01
 *                             weight: 420
 *                             protein: 500
 *                             natrium: 180
 *                             sugar: 300
 *                             saturated_fat: 300
 *                             createdAt: 2020-06-13 06:45:31
 *                             updatedAt: 2020-06-15 08:12:05
 *                             deletedAt: 2020-08-08 18:05:08
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 오류 발생
 *                   error:
 *                       type: string
 *                       example: content of error
 *       '502':
 *        description: 존재하지 않는 버거
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 존재하지 않는 버거
 */

/**
 * @swagger
 *  /burger:
 *    put:
 *      summary: 버거 수정
 *      tags: [burger]
 *      requestBody:
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   id:
 *                       type: number
 *                       example: 3
 *                       description: 수정할 버거 ID
 *                   data:
 *                       type: object
 *                       properties:
 *                           name:
 *                               type: string
 *                               example: 폴더버거
 *                               description: 이름
 *                           price_single:
 *                               type: number
 *                               example: 3900
 *                               description: 단품 가격
 *                           price_set:
 *                               type: number
 *                               example: 5800
 *                               description: 세트 가격
 *                           price_combo:
 *                               type: number
 *                               example: 4800
 *                               description: 콤보 가격
 *                           calorie:
 *                               type: number
 *                               example: 492
 *                               description: 총 칼로리(열량)
 *                           image:
 *                               type: string
 *                               example: https://example-storage/folderburger.png
 *                               description: 이미지 주소
 *                           releasedAt:
 *                               type: string
 *                               example: 2020-06-28
 *                               description: 출시일
 *                           weight:
 *                               type: number
 *                               example: 300
 *                               description: 중량
 *                           protein:
 *                               type: number
 *                               example: 250
 *                               description: 단백질
 *                           natrium:
 *                               type: number
 *                               example: 220
 *                               description: 나트륨
 *                           sugar:
 *                               type: number
 *                               example: 300
 *                               description: 당분
 *                           saturated_fat:
 *                               type: number
 *                               example: 200
 *                               description: 포화지방
 *      responses:
 *       '200':
 *        description: 버거 수정 성공
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 버거 수정 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 오류 발생
 *                   error:
 *                       type: string
 *                       example: content of error
 *       '502':
 *        description: 존재하지 않는 버거
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 존재하지 않는 버거
 */

/**
 * @swagger
 *  /burger:
 *    delete:
 *      summary: 버거 삭제
 *      tags: [burger]
 *      requestBody:
 *        content:
 *          application/json:
 *             schema:
 *                 type: object
 *                 required:
 *                     - id
 *                 properties:
 *                     id:
 *                         type: number
 *                         description: 삭제할 버거 ID
 *                         example: 1
 *      responses:
 *       '200':
 *        description: 버거 삭제 성공
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 버거 삭제 성공
 *       '500':
 *        description: 오류 발생
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 오류 발생
 *                   error:
 *                       type: string
 *                       example: content of error
 *       '502':
 *        description: 존재하지 않는 버거
 *        content:
 *          application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   message:
 *                       type: string
 *                       example: 존재하지 않는 버거
 */
