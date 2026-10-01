const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const { clearAuthCookie, setAuthCookie } = require("../utils/authCookies");

const ADMIN_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

// =========================================
// LOGIN
// =========================================

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        admin.password,
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    setAuthCookie(res, "adminToken", token, ADMIN_COOKIE_MAX_AGE);

    return res.status(200).json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(
      "Login admin error:",
      error,
    );

    return res.status(500).json({
      message: "Login failed.",
    });
  }
};

const logoutAdmin = (req, res) => {
  clearAuthCookie(res, "adminToken");
  return res.status(200).json({ message: "Logged out successfully." });
};

// =========================================
// GET ADMIN PROFILE
// =========================================

const getAdminProfile = async (req, res) => {
  try {
    const adminId =
      req.user?.id ||
      req.user?._id ||
      req.user?.adminId;

    if (!adminId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const admin = await Admin.findById(
      adminId,
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "Administrator",
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    });
  } catch (error) {
    console.error(
      "Get admin profile error:",
      error,
    );

    return res.status(500).json({
      message: "Failed to load profile.",
    });
  }
};

// =========================================
// UPDATE ADMIN PROFILE
// =========================================

const updateAdminProfile = async (
  req,
  res,
) => {
  try {
    const adminId =
      req.user?.id ||
      req.user?._id ||
      req.user?.adminId;

    if (!adminId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message:
          "Name and email are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail =
      email.toLowerCase().trim();

    if (!cleanName || !cleanEmail) {
      return res.status(400).json({
        message:
          "Name and email cannot be empty.",
      });
    }

    // Check if another admin already uses
    // this email.
    const existingAdmin =
      await Admin.findOne({
        email: cleanEmail,
        _id: { $ne: adminId },
      });

    if (existingAdmin) {
      return res.status(400).json({
        message:
          "This email is already in use.",
      });
    }

    const admin =
      await Admin.findByIdAndUpdate(
        adminId,
        {
          name: cleanName,
          email: cleanEmail,
        },
        {
          new: true,
          runValidators: true,
        },
      ).select("-password");

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    return res.status(200).json({
      message:
        "Profile updated successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error(
      "Update admin profile error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to update profile.",
    });
  }
};

// =========================================
// CHANGE ADMIN PASSWORD
// =========================================

const changeAdminPassword = async (
  req,
  res,
) => {
  try {
    const adminId =
      req.user?.id ||
      req.user?._id ||
      req.user?.adminId;

    if (!adminId) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters.",
      });
    }

    const admin =
      await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found.",
      });
    }

    const currentPasswordMatch =
      await bcrypt.compare(
        currentPassword,
        admin.password,
      );

    if (!currentPasswordMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect.",
      });
    }

    const samePassword =
      await bcrypt.compare(
        newPassword,
        admin.password,
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          "New password must be different from the current password.",
      });
    }

    admin.password =
      await bcrypt.hash(
        newPassword,
        10,
      );

    await admin.save();

    return res.status(200).json({
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "Change admin password error:",
      error,
    );

    return res.status(500).json({
      message:
        "Failed to change password.",
    });
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
};