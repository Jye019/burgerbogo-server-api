var fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const SequelizeAuto = require("sequelize-auto");

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname + "/../config/sequelize.json"))[env];
const db = {};

const sequelize = new Sequelize(config);

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.preventDisconnection = async (env) => {
  const sequelize = new Sequelize(config);
  try {
    await sequelize.authenticate();
    console.log("preventDiscionnection() successed");
  } catch (err) {
    console.log("preventDiscionnection() failed : ", err);
  }
};

db.generate = () => {
  console.log("fetching models");
  const auto = new SequelizeAuto(
    config.database,
    config.username,
    config.password,
    config
  );
  auto.run((err) => {
    if (err) throw err;
  });
};

module.exports = db;
