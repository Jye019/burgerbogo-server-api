// import fs from "fs";
// import path from "path";
import Sequelize from "sequelize";
import seqConfig from "../config/sequelize.json";

const env = process.env.NODE_ENV || "development";
const config = seqConfig[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

/* -------------여기에 모델 가져옴-------------*/

db.users = require("./users.js")(sequelize, Sequelize);

/*--------------------------------------------*/

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
