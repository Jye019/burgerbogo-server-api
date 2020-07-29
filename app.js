import express from "express";
import SequelizeAuto from "sequelize-auto";
import auth from "./routes/auth";
import seqConfig from "./config/sequelize.json";

import models from "./models";

const app = express();

const env = process.env.NODE_ENV || "development";
const config = seqConfig[env];

const auto = new SequelizeAuto(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: "3306",
    dialect: config.dialect,
    additional: {
      timestamps: false,
    },
  }
);
auto.run((err) => {
  if (err) throw err;
});

app.get("/", async (req, res, next) => {
  const userModel = models.users;
  userModel
    .findAll()
    .then((userList) => {
      res.json(userList);
    })
    .catch((err) => {
      next(err);
    });
});
app.use("/auth", auth);

app.use((err, req, res) => {
  res.send(err.stack);
});

app.listen(3000, () => {
  console.log("Listening at port 3000");
});
