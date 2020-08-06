import express from "express";
import dotenv from "dotenv";
import auth from "./routes/auth";
import models from "./models";

// DB 변경 시에만 실행
// models.generate();

const app = express();

// 바디 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
