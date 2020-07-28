import express from "express";
import join from "./routes/join";
import SequelizeAuto from 'sequelize-auto';

const app = express();
const sequelize_auto = new SequelizeAuto('dev', 'admin', 'shTmfah1!', {
  host: 'nsm-burgerbogo.civjzz8g5pvm.ap-northeast-2.rds.amazonaws.com',
  port: '3306',
  dialect: 'mysql',
  additional: {
    timestamps: false
  }
});
sequelize_auto.run((err) => {
  if(err) throw err;
})

app.get("/", (req, res) => {
  res.send("success!");
});
app.use("/join", join);

app.listen(3000, () => {
  console.log('Listening at port 3000');
});
