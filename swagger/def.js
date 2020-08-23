/**
 * @swagger
 * tags:
 *  - name: brand
 *    description: 브랜드 관련 라우터
 */
/**
 * @swagger
 * tags:
 *  - name: burger
 *    description: 버거 관련 라우터
 */
/**
 * @swagger
 *      components:
 *          schemas:
 *              addBrandDto:
 *                  type: object
 *                  required:
 *                      - name
 *                  properties:
 *                      name:
 *                          type: string
 *                          description: 추가할 브랜드 이름
 *              modifyBrandDto:
 *                  type: object
 *                  required:
 *                      - id
 *                  properties:
 *                      id:
 *                          type: number
 *                          example: 1
 *                      data:
 *                          type: object
 *                          required:
 *                              - name
 *                          properties:
 *                              name:
 *                                  type: string
 *                                  description: 수정할 브랜드 이름
 *                                  example: 버거퀸
 */
