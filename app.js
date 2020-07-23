import express from "express";
import join from "./routes/join";
import Sequelize from "./models/index";

const app = express();

Sequelize.sequelize.sync();

app.get("/", (req, res) => {
  res.send("success!");
});
app.use("/join", join);

app.listen(3000, () => {
  console.log(`Listening at port 3000`);
});
