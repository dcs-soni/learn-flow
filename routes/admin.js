const { Router } = require("express");
const adminRouter = Router();
const { adminModel } = require("../db");

adminRouter.post("/signup", function (req, res) {
  res.json({
    message: "Signup endpoint",
  });
});

adminRouter.post("/signin", function (req, res) {
  res.json({
    message: "Signin endpoint",
  });
});

adminRouter.post("/purchases", function (req, res) {
  res.json({
    message: "Purchases endpoint of user",
  });
});

adminRouter.get("/course/bulk", function (req, res) {
  res.json({
    message: "Purchases endpoint of user",
  });
});

module.exports = {
  adminRouter,
};
