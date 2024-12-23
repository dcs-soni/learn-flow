const express = require("express");
const app = express();

app.post("/user/signup", function (req, res) {
  res.json({
    message: "Signup endpoint",
  });
});

app.post("/user/signin", function (req, res) {
  res.json({
    message: "Signin endpoint",
  });
});

app.post("/user/purchases", function (req, res) {
  res.json({
    message: "Purchases endpoint",
  });
});

app.post("/course/purchase", function (req, res) {
  res.json({
    message: "Purchases endpoint",
  });
});

app.get("/courses", function (req, res) {
  res.json({
    message: "Signup endpoint",
  });
});

app.listen(3000);
