const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before seeding.");
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }

  await connectDB();

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new Error("An administrator with this email already exists.");
  }

  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await Admin.create({
    name: ADMIN_NAME.trim(),
    email,
    password,
  });

  console.log(`Administrator created: ${email}`);
};

seedAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });