import swaggerUi from "swagger-ui-express";
import swaggereJsdoc from "swagger-jsdoc";
import express from "express";

const router = express.Router();

const options = {
  // swagger문서 설정
  swaggerDefinition: {
    info: {
      title: "버거보고 REST API",
      version: "0.0.0",
      description: "버거보고 REST API 정리 문서",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  // swagger api가 존재하는 곳 입니다.
  apis: ["./routes/*.js"],
};

const specs = swaggereJsdoc(options);

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

export default router;
