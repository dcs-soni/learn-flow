const { Router } = require("express");

const courseRouter = Router();

courseRouter.post("/purchase", function (req, res) {
  res.json({
    message: "Purchases endpoint",
  });
});

courseRouter.get("/preview", function (req, res) {
  res.json({
    message: "Courses preview endpoint",
  });
});

module.exports = {
  courseRouter,
};
