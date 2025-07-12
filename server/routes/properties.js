const express = require("express");
const Property = require("../models/Property");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, city, minPrice, maxPrice } = req.query;

    // მხოლოდ იყიდება
    const filter = { isActive: true, transactionType: "sale" };

    if (city) filter["location.city"] = new RegExp(city, "i");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate("owner", "firstName lastName email")
      .populate("company", "name logo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get featured properties
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true, isFeatured: true })
      .populate("owner", "firstName lastName")
      .populate("company", "name logo")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error("Get featured properties error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Get single property
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "firstName lastName email phone")
      .populate("company", "name logo phone email");

    if (!property) {
      return res.status(404).json({ message: "უძრავი ქონება ვერ მოიძებნა" });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Create property (requires auth)
router.post("/", auth, async (req, res) => {
  try {
    // Get user to check if they have a company
    const User = require("../models/User");
    const user = await User.findById(req.user.userId).populate("company");

    const propertyData = {
      ...req.body,
      owner: req.user.userId,
    };

    // Add company if user has one
    if (user.company) {
      propertyData.company = user.company._id;
    }

    const property = new Property(propertyData);

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Update property (owner or admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "უძრავი ქონება ვერ მოიძებნა" });
    }

    if (
      !property.owner ||
      (property.owner.toString() !== req.user.userId &&
        req.user.role !== "admin" &&
        req.user.role !== "superadmin")
    ) {
      return res.status(403).json({ message: "არ გაქვთ უფლება" });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json(property);
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Delete property (owner or admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "უძრავი ქონება ვერ მოიძებნა" });
    }

    if (!property.owner) {
      return res.status(400).json({ message: "ბინას არ აქვს owner ველი" });
    }

    if (
      property.owner.toString() !== req.user.userId &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    ) {
      return res.status(403).json({ message: "არ გაქვთ უფლება" });
    }

    // await property.remove();
    await Property.deleteOne({ _id: property._id });
    res.json({ message: "უძრავი ქონება წაშლილია" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Get properties by company
router.get("/company/:companyId", auth, async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const properties = await Property.find({ company: companyId }).sort({
      createdAt: -1,
    });
    res.json(properties);
  } catch (error) {
    console.error("Get company properties error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

// Search properties by title
router.get("/search", async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "საძიებო ზონა მუხტია" });
    }

    const filter = {
      isActive: true,
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
        { address: new RegExp(query, "i") },
      ],
    };

    const properties = await Property.find(filter)
      .populate("owner", "firstName lastName email")
      .populate("company", "name logo")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Search properties error:", error);
    res.status(500).json({ message: "სერვერის შეცდომა" });
  }
});

module.exports = router;
