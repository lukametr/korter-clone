const express = require("express");
const User = require("../models/User");
const Property = require("../models/Property");
const Company = require("../models/Company");
const auth = require("../middleware/auth");

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "არ გაქვთ წვდომა" });
  }
  next();
};

// Get dashboard stats
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    // მხოლოდ company, admin, superadmin მომხმარებლების დათვლა
    const totalUsers = await User.countDocuments({
      role: { $in: ["company", "admin", "superadmin"] },
    });
    const totalProperties = await Property.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const activeProperties = await Property.countDocuments({ isActive: true });

    res.json({
      totalUsers,
      totalProperties,
      totalCompanies,
      activeProperties,
      recentActivity: [], // Add empty array for now
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Toggle user status
router.patch("/users/:id/toggle-status", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "მომხმარებელი ვერ მოიძებნა" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: "მომხმარებლის სტატუსი შეცვლილია", user });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Toggle property featured status
router.patch(
  "/properties/:id/toggle-featured",
  auth,
  adminAuth,
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);

      if (!property) {
        return res.status(404).json({ message: "უძრავი ქონება ვერ მოიძებნა" });
      }

      property.isFeatured = !property.isFeatured;
      await property.save();

      res.json({ message: "უძრავი ქონების სტატუსი შეცვლილია", property });
    } catch (error) {
      console.error("Toggle property featured error:", error);
      res.status(500).json({ message: "სერვერის შეცდომა" });
    }
  }
);

// Get all users for admin dashboard
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["company", "superadmin"] },
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 recent users for dashboard

    res.json(users);
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

module.exports = router;
