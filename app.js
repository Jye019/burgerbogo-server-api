import express from 'express';
import passport from 'passport';
import auth from './routes/auth';
import Sequelize from './models';
import passportConfig from './passport';

const app = express();
// Sequelize.sequelize.sync();
passportConfig(passport);

Sequelize.sequelize.sync();

app.get("/", (req, res) => {
  res.send("success!");
});
app.use("/join", join);

app.listen(3000, () => {
  console.log('Listening at port 3000');
});
