const mongoose = require("mongoose");
require("dotenv").config();

const Property = require("./models/Property");

const checkProperties = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const properties = await Property.find().sort({ createdAt: -1 });
    console.log(`Total properties: ${properties.length}`);

    properties.forEach((prop, index) => {
      console.log(
        `${index + 1}. ${prop.title} - ${prop.createdAt} - Active: ${
          prop.isActive
        } - Type: ${prop.transactionType}`
      );
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkProperties();
