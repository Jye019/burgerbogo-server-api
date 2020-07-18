import express from "express";

const app = express();

app.get("/", (req, res, next) => {
  res.send("success!");
  
});

app.listen(3000, () => {
  console.log(`Listening at port 3000`);
});
