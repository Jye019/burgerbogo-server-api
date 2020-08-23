import express from "express";
import dotenv from "dotenv";
import swaggerDoc from "./swaggerDoc";
import auth from "./routes/auth";
import burger from "./routes/burger";
import brand from "./routes/brand";
import review from "./routes/review";
import models from "./models";

const env = process.env.NODE_ENV || "development";

// MySQL Timeout 현상 방지
models.preventDisconnection(env);

// DB 변경 시에만 실행
models.generate();

const app = express();
app.use(swaggerDoc);

// 바디 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", auth);
app.use("/burger", burger);
app.use("/brand", brand);
app.use("/review", review);

// env 설정
dotenv.config();

app.get("/", async (req, res, next) => {
  const userModel = models.users;
  try {
    const users = await userModel.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.use("/auth", auth);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: err.stack });
  next();
});

app.listen(3000, () => {
  console.log("Listening at port 3000");
});
