import express from "express";
import SequelizeAuto from "sequelize-auto";
import auth from "./routes/auth";
import sequelizeConfig from "./config/sequelize";

const app = express();

const env = process.env.NODE_ENV || "development";
const config = sequelizeConfig[env];

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

app.get("/", (req, res) => {
  res.send("success!");
});
app.use("/auth", auth);

app.listen(3000, () => {
  console.log("Listening at port 3000");
});
