import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_resource_hub");
  const email = (process.env.ADMIN_EMAIL || "admin@urh.et").toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@12345", 10);
  await User.create({
    email,
    fullName: "Master Admin",
    universityName: "Addis Ababa University",
    studentId: "ADMIN-000",
    passwordHash,
    role: "admin",
    yearSemester: "Year 4 - Semester 2"
  });
  console.log("Admin created");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
