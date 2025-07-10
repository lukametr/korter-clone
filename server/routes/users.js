const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "არ გაქვთ წვდომა" });
    }
    // მხოლოდ company, admin, superadmin მომხმარებლები
    const users = await User.find({
      role: { $in: ["company", "admin", "superadmin"] },
    })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Get single user
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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
