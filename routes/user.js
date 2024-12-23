const { Router } = require("express");

const userRouter = Router();

userRouter.post("/signup", function (req, res) {
  res.json({
    message: "Signup endpoint",
  });
});

userRouter.post("/signin", function (req, res) {
  res.json({
    message: "Signin endpoint",
  });
});

userRouter.post("/purchases", function (req, res) {
  res.json({
    message: "Purchases endpoint of user",
  });
});

module.exports = {
  userRouter,
};
