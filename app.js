import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from './routes/auth';
import burger from './routes/burger';
import brand from './routes/brand';
import review from './routes/review';
import filter from './routes/filter';
import ingredient from './routes/ingredient';
import models from './models';
import db from './library/db';
import { logger } from './library/log';

// TEST
// 테이블이 존재하지 않으면 테이블 생성
db.syncronize(models);

const app = express();

// 바디 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/auth', auth);
app.use('/burger', burger);
app.use('/brand', brand);
app.use('/review', review);
app.use('/filter', filter);
app.use('/ingredient', ingredient);

// env 설정
dotenv.config();

// 에러 핸들러
app.use((req, res) => {
  logger.error('404 Not Found');
  res.status(404).json({ message: '404 Not Found' });
});

app.listen(3000, () => {
  console.log('Listening at port 3000');
});
