const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty().trim(),
    body("phone").optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "მომხმარებელი უკვე არსებობს" });
      }

      // Create company user only
      const user = new User({
        email,
        password,
        firstName: name,
        lastName: "",
        phone,
        role: "company",
      });
      await user.save();

      // Create company document
      const Company = require("../models/Company");
      const company = new Company({
        name,
        phone,
        email,
        address: req.body.address || "",
        city: req.body.city || "",
        owner: user._id,
        properties: [],
      });
      await company.save();

      // Link user to company
      user.company = company._id;
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Populate company for response
      const userPopulated = await User.findById(user._id).populate("company");
      res.status(201).json({
        token,
        user: {
          _id: userPopulated._id,
          email: userPopulated.email,
          firstName: userPopulated.firstName,
          lastName: userPopulated.lastName,
          role: userPopulated.role,
          company: userPopulated.company,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "სერვერის შეცდომა" });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    console.log("LOGIN BODY:", req.body); // Debug log
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "არასწორი ელ-ფოსტა ან პაროლი" });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "არასწორი ელ-ფოსტა ან პაროლი" });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(400).json({ message: "ანგარიში დაბლოკილია" });
      }

      console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debug log
      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Populate company for response
      const userPopulated = await User.findById(user._id).populate("company");
      res.json({
        message: "შესვლა წარმატებულია",
        token,
        user: {
          _id: userPopulated._id,
          email: userPopulated.email,
          firstName: userPopulated.firstName,
          lastName: userPopulated.lastName,
          role: userPopulated.role,
          company: userPopulated.company,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "სერვერის შეცდომა" });
    }
  }
);

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("company");
    if (!user) {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

module.exports = router;
