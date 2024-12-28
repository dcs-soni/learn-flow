const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");

const { JWT_ADMIN_SECRET } = require("../config");
const { adminMiddleWare } = require("../middleware/admin");
adminRouter.post("/signup", async function (req, res) {
  const authSchema = z.object({
    email: z
      .string()
      .email("Invalid email address")
      .min(5, "Email is too short")
      .max(255, "Email is too long")
      .trim()
      .toLowerCase(),
    password: z.string().min(5).max(15),
  });

  const parseDataWithSuccess = authSchema.safeParse(req.body);
  if (!parseDataWithSuccess.success) {
    return res.json({
      message: "Incorrect format",
      error: parseDataWithSuccess.error,
    });
  }

  const { email, password } = req.body;

  try {
    const existingAdmin = await adminModel.findOne({
      email,
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email,
      password: hashedPassword,
    });

    return res.json({
      message: "Admin succesfully created",
    });
  } catch (error) {
    console.log("Sign up error", error);
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

adminRouter.post("/signin", async function (req, res) {
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

  const admin = await adminModel.findOne({
    email,
  });

  if (!admin) {
    return res.json({
      success: false,
      message: "Invalid email",
    });
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (!passwordMatch) {
    return res.json({
      success: false,
      message: "Invalid password",
    });
  }

  const token = jwt.sign(
    {
      id: admin._id.toString(),
    },
    JWT_ADMIN_SECRET,
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

adminRouter.post("/course", adminMiddleWare, async function (req, res) {
  const adminId = req.userId;

  const { title, description, imageUrl, price } = req.body;

  const course = await courseModel.create({
    title,
    description,
    imageUrl,
    price,
    creatorId: adminId,
  });

  res.json({
    message: "Course created",
    courseId: course._id,
  });
});

adminRouter.put("/course", adminMiddleWare, async function (req, res) {
  const adminId = req.userId;

  const { title, description, imageUrl, price, courseId } = req.body;

  const course = await courseModel.updateOne(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title: title,
      description,
      description,
      imageUrl: imageUrl,
      price: price,
    }
  );

  res.json({
    message: "Course updated",
    courseId: course._id,
  });
});

adminRouter.get("/course/bulk", adminMiddleWare, async function (req, res) {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  res.json({
    message: "Courses fetched",
    courses,
  });
});

module.exports = {
  adminRouter,
};
