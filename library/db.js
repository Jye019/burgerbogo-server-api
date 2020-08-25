const db = {};

db.syncronize = (models) => {
  models.sequelize
    .sync()
    .then(() => {
      console.log("✓ DB connection success.");
      console.log("  Press CTRL-C to stop\n");
    })
    .catch((err) => {
      console.error(err);
      console.log("✗ DB connection error. Please make sure DB is running.");
      process.exit();
    });
};

export default db;
