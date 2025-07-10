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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Simple ping endpoint for connectivity test
app.get("/api/auth/ping", (req, res) => {
  res.json({ status: "ok", message: "Auth ping successful" });
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createSuperAdmin();
});
