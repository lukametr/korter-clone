const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Try loading .env from absolute path
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });
console.log("DOTENV RESULT:", result);
console.log("SERVER ENV PATH:", envPath);
console.log("SERVER JWT_SECRET:", process.env.JWT_SECRET);

const app = express();

// Security middleware setup
require("./middleware/security")(app);

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with CORS headers
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/korter-clone",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const authRoutes = require("./routes/auth");
const propertiesRoutes = require("./routes/properties");
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/upload");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertiesRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// API Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "Korter Clone API is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint for database connection
app.get("/api/debug/db", async (req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const dbName = mongoose.connection.name || "unknown";
    const dbHost = mongoose.connection.host || "unknown";

    res.json({
      connected: isConnected,
      connectionState: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      database: dbName,
      host: dbHost,
      mongodbUri: process.env.MONGODB_URI ? "SET" : "MISSING",
      jwtSecret: process.env.JWT_SECRET ? "SET" : "MISSING",
      nodeEnv: process.env.NODE_ENV || "unknown",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

// Debug endpoint for environment variables
app.get("/api/debug/env", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || "undefined",
    PORT: process.env.PORT || "undefined",
    MONGODB_URI_SET: process.env.MONGODB_URI ? "YES" : "NO",
    JWT_SECRET_SET: process.env.JWT_SECRET ? "YES" : "NO",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "undefined",
  });
});

// Debug endpoint for Cloudinary configuration
app.get("/api/debug/cloudinary", (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ? "SET" : "MISSING",
    apiKey: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
    apiSecret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
    cloudinaryConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  });
});

// Simple ping endpoint for connectivity test
app.get("/api/auth/ping", (req, res) => {
  res.json({ status: "ok", message: "Auth ping successful" });
});

// Serve static files from React build (after API routes)
app.use(
  express.static(path.join(__dirname, "../client/build"), {
    setHeaders: (res, path) => {
      // Set proper MIME types for JavaScript modules
      if (path.endsWith(".js")) {
        res.set("Content-Type", "application/javascript");
      } else if (path.endsWith(".mjs")) {
        res.set("Content-Type", "application/javascript");
      } else if (path.endsWith(".css")) {
        res.set("Content-Type", "text/css");
      }
      // Enable CORS for all static files
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  // Make sure we don't serve index.html for API routes or specific static files
  if (req.path.startsWith("/api/") || req.path.startsWith("/assets/")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// Create superadmin on startup
const createSuperAdmin = async () => {
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");

    const existingSuperAdmin = await User.findOne({ email: "admin@admin.com" });

    if (!existingSuperAdmin) {
      // არ გააშიფრო პაროლი ხელით, მიანდე mongoose-ს
      const superAdmin = new User({
        email: "admin@admin.com",
        password: "admin123", // პაროლი უბრალო ტექსტად, რომ pre-save ჰუკმა გააშიფროს
        firstName: "Super",
        lastName: "Admin",
        role: "superadmin",
        phone: "+995555123456",
        isActive: true, // Ensure superadmin is active
      });

      await superAdmin.save();
      console.log("Superadmin created successfully");
    }
  } catch (error) {
    console.error("Error creating superadmin:", error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// For Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    createSuperAdmin();
  });
} else {
  // For production (Vercel), just call createSuperAdmin
  createSuperAdmin();
}

// Export for Vercel
module.exports = app;
