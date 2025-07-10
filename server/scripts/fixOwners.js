const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://127.0.0.1:27017/korter-clone";

async function main() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB!");

  // Test direct MongoDB query (no models)
  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Collections in DB:",
      collections.map((c) => c.name)
    );
  } catch (e) {
    console.error("listCollections error:", e);
  }

  // Require models after connection
  const Property = require("../server/models/Property");
  const Company = require("../server/models/Company");
  const User = require("../server/models/User");

  console.log("Company model typeof:", typeof Company);
  console.log("Company.find typeof:", typeof Company.find);

  // Try User.find first
  try {
    const users = await User.find();
    console.log("User count:", users.length);
  } catch (e) {
    console.error("User.find error:", e);
  }

  // Try Company.countDocuments
  try {
    const companyCount = await Company.countDocuments();
    console.log("Company count:", companyCount);
  } catch (e) {
    console.error("Company.countDocuments error:", e);
  }

  // Try Company.find
  const companies = await Company.find();
  for (const company of companies) {
    // მოძებნე user, რომელიც არის ამ კომპანიის owner
    const user = await User.findOne({ companyId: company._id });
    if (!user) continue;
    // ყველა ბინა ამ კომპანიისთვის
    const result = await Property.updateMany(
      { company: company._id },
      { $set: { owner: user._id } }
    );
    console.log(
      `Updated ${result.modifiedCount} properties for company ${company.name}`
    );
  }

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
