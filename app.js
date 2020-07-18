import express from "express";

const app = express(),
  PORT = 3000;

app.get("/", (req, res, next) => {
  res.send("success");
});

app.listen(PORT, () => {
  console.log(`Listening at PORT:${PORT}`);
});
