const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["GEL", "USD", "EUR"],
    default: "GEL",
  },
  area: {
    type: Number,
    required: true,
  },
  rooms: {
    type: Number,
  },
  bedrooms: {
    type: Number,
  },
  bathrooms: {
    type: Number,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  mainImage: {
    type: String,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  transactionType: {
    type: String,
    enum: ["sale"],
    default: "sale",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    city: { type: String },
    // add more fields if needed
  },
});

propertySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports =
  mongoose.models.Property || mongoose.model("Property", propertySchema);
