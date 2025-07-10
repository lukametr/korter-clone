const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "korter-properties", // Folder name in Cloudinary
    format: async (req, file) => {
      // Support multiple formats
      const allowedFormats = ["jpg", "jpeg", "png", "gif", "webp"];
      const fileExtension = file.originalname.split(".").pop().toLowerCase();
      return allowedFormats.includes(fileExtension) ? fileExtension : "jpg";
    },
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      return `property-${timestamp}-${random}`;
    },
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    file.originalname.split(".").pop().toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("მხოლოდ სურათებია დაშვებული (JPG, PNG, GIF, WebP)"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

// Upload single image
router.post("/image", auth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ფაილი არ არის ატვირთული" });
    }

    // Cloudinary automatically provides the URL
    const imageUrl = req.file.path;
    res.json({
      message: "ფაილი წარმატებით ატვირთულია",
      url: imageUrl,
      filename: req.file.filename,
      cloudinary_id: req.file.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "ატვირთვის შეცდომა",
      error: error.message,
    });
  }
});

// Upload multiple images
router.post("/images", auth, upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "ფაილები არ არის ატვირთული" });
    }

    // Cloudinary files have .path property with the full URL
    const images = req.files.map((file) => ({
      url: file.path,
      public_id: file.public_id,
      filename: file.filename,
    }));

    // Return just the URLs for backward compatibility
    const imageUrls = req.files.map((file) => file.path);

    res.status(200).json({
      images: imageUrls,
      details: images, // Additional details if needed
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({
      message: "სურათების ატვირთვის შეცდომა",
      error: error.message,
    });
  }
});

module.exports = router;
