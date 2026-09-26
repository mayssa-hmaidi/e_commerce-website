const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Customer = require("../models/Customer");

// =========================================
// GENERATE CUSTOMER TOKEN
// =========================================

const generateCustomerToken = (
  customer,
) => {
  return jwt.sign(
    {
      id: customer._id.toString(),

      customerId:
        customer._id.toString(),

      role: "customer",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =========================================
// REGISTER CUSTOMER
// =========================================

const registerCustomer = async (
  req,
  res,
) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // =====================================
    // VALIDATION
    // =====================================

    if (
      !name ||
      !name.trim() ||
      !email ||
      !email.trim() ||
      !phone ||
      !phone.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const normalizedPhone =
      phone.trim();

    // =====================================
    // CHECK EXISTING CUSTOMER
    // =====================================

    const existingCustomer =
      await Customer.findOne({
        email:
          normalizedEmail,
      });

    if (existingCustomer) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    // =====================================
    // HASH PASSWORD
    // =====================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    // =====================================
    // CREATE CUSTOMER
    // =====================================

    const customer =
      await Customer.create({
        name:
          name.trim(),

        email:
          normalizedEmail,

        phone:
          normalizedPhone,

        password:
          hashedPassword,
      });

    // =====================================
    // GENERATE TOKEN
    // =====================================

    const token =
      generateCustomerToken(
        customer,
      );

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(201).json({
      message:
        "Account created successfully.",

      token,

      customer: {
        _id:
          customer._id,

        name:
          customer.name,

        email:
          customer.email,

        phone:
          customer.phone,
      },
    });
  } catch (error) {
    console.error(
      "Customer register error:",
      error,
    );

    // Mongo duplicate email protection
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      message:
        "Failed to create customer account.",
    });
  }
};

// =========================================
// LOGIN CUSTOMER
// =========================================

const loginCustomer = async (
  req,
  res,
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // =====================================
    // VALIDATION
    // =====================================

    if (
      !email ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // =====================================
    // FIND CUSTOMER
    // =====================================

    const customer =
      await Customer.findOne({
        email:
          normalizedEmail,
      });

    if (!customer) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // =====================================
    // CHECK PASSWORD
    // =====================================

    const passwordMatches =
      await bcrypt.compare(
        password,
        customer.password,
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    // =====================================
    // GENERATE TOKEN
    // =====================================

    const token =
      generateCustomerToken(
        customer,
      );

    // =====================================
    // RESPONSE
    // =====================================

    return res.status(200).json({
      message:
        "Login successful.",

      token,

      customer: {
        _id:
          customer._id,

        name:
          customer.name,

        email:
          customer.email,

        phone:
          customer.phone,
      },
    });
  } catch (error) {
    console.error(
      "Customer login error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to login.",
    });
  }
};

// =========================================
// GET CURRENT CUSTOMER
// =========================================

const getCurrentCustomer =
  async (
    req,
    res,
  ) => {
    try {
      const customerId =
        req.customer?.id ||
        req.customer?.customerId;

      if (!customerId) {
        return res.status(401).json({
          message:
            "Customer authentication required.",
        });
      }

      const customer =
        await Customer.findById(
          customerId,
        ).select(
          "_id name email phone createdAt updatedAt",
        );

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found.",
        });
      }

      return res.status(200).json(
        customer,
      );
    } catch (error) {
      console.error(
        "Get current customer error:",
        error,
      );

      return res.status(500).json({
        message:
          "Failed to load customer profile.",
      });
    }
  };

module.exports = {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
};