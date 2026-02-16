import mongoose from "mongoose";

const MONGODB_URI =
 ''

async function resetDatabase() {
  try {
    console.log("⚠️  DROPPING ENTIRE DATABASE ⚠️");
    await mongoose.connect(MONGODB_URI);

    await mongoose.connection.db.dropDatabase();

    console.log("✅ Database dropped successfully");
  } catch (error) {
    console.error("❌ Error dropping database:", error);
  } finally {
    await mongoose.disconnect();
  }
}

resetDatabase();
