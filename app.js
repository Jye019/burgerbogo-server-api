import express from "express";
import join from "./routes/join";

const app = express();

app.get("/", (req, res, next) => {
  res.send("success!");
});
app.use('/join', join);

app.listen(3000, () => {
  console.log(`Listening at port 3000`);
});
