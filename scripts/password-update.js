import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../lib/models/User.js";

const MONGODB_URI =  ''

async function resetPasswords() {
  await mongoose.connect(MONGODB_URI);

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash("sumit123", salt);

  const result = await User.updateMany(
    {},
    { $set: { password: hashedPassword } }
  );

  console.log(`Updated ${result.modifiedCount} users`);
  await mongoose.disconnect();
}

resetPasswords();
