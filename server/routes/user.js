const { Router } = require("express");
const { z } = require("zod");
const { userModel, purchaseModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
  const authSchema = z.object({
    email: z
      .string()
      .email("Invalid email address")
      .min(5, "Email is too short")
      .max(255, "Email is too long")
      .trim()
      .toLowerCase(),
    password: z.string().min(5).max(15),
    firstName: z.string().min(3).max(20),
    lastName: z.string().max(20),
  });

  const parseDataWithSuccess = authSchema.safeParse(req.body);
  if (!parseDataWithSuccess.success) {
    return res.json({
      message: "Incorrect format",
      error: parseDataWithSuccess.error,
    });
  }

  const { email, password, firstName, lastName } = req.body;

  try {
    const existingUser = await userModel.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return res.json({
      message: "User succesfully created",
    });
  } catch (error) {
    console.log("Sign up error", error);

    // If there is any duplicate key in the db, then the server will geenrate 11000 error, catching that error below
    // This will rarely be hit now since we're checking existence first,
    // but keeping as a safety net for race conditions
    if (error.code === 11000) {
      console.log("Duplicate entry is found");
      const field = Object.keys(error.keyPattern)[0];
      return res.json({
        success: false,
        message: `${
          field.charAt(0).toUpperCase + field.slice(1)
        } already exists`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred during signup. Please try again later.",
    });
  }
});

userRouter.post("/signin", async function (req, res) {
  const signinSchema = z.object({
    email: z.string(),
    password: z.string().min(3).max(30),
  });

  const parseDataWithSuccess = signinSchema.safeParse(req.body);

  if (!parseDataWithSuccess.success) {
    return res.json({
      success: false,
      message: "Invalid input format",
      error: parseDataWithSuccess.error,
    });
  }

  const { email, password } = parseDataWithSuccess.data;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid email",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.json({
      success: false,
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
    },
    JWT_USER_SECRET,
    {
      expiresIn: "24h",
    }
  );

  return res.status(200).json({
    success: true,
    message: "Successfully signed in",
    token,
  });
});

userRouter.post("/purchases", userMiddleware, async function (req, res) {
  const userId = req.userId;

  const purchases = await purchaseModel.find({
    userId,
  });

  const coursesData = await courseModel.find({
    _id: { $in: purchases.map((x) => x.courseId) },
  });

  res.json({
    purchases,
    coursesData,
  });
});

module.exports = {
  userRouter,
};
