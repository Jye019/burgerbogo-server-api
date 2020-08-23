import swaggerUi from "swagger-ui-express";
import swaggereJsdoc from "swagger-jsdoc";
import express from "express";

const router = express.Router();

const options = {
  // swagger문서 설정
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "버거보고 REST API",
      version: "0.1.0",
      description: "버거보고 REST API 정리 문서",
    },
    host: "localhost:3000",
    basePath: "/",
  },
  // swagger api가 존재하는 곳 입니다.
  apis: ["./routes/swagger/*.js"],
};

const specs = swaggereJsdoc(options);

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

export default router;
