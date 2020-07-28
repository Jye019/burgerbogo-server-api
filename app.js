import express from "express";
import auth from "./routes/auth";
import SequelizeAuto from 'sequelize-auto';
import path from 'path';


const app = express();
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname + '/config/sequelize.json'))[env];
const sequelize_auto = new SequelizeAuto(config.database, config.username, config.password, {
  host: config.host,
  port: '3306',
  dialect: config.dialect,
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
app.use("/auth", auth);

app.listen(3000, () => {
  console.log('Listening at port 3000');
});
