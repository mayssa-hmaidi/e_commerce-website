const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const Customer = require("../models/Customer");
const Admin = require("../models/Admin");
const PasswordResetToken = require("../models/PasswordResetToken");
const { sendBatchEmails } = require("../services/emailService");
const { createPasswordResetEmail } = require("../services/emailTemplates");

const RESET_TOKEN_TTL_MINUTES = 20;
const GENERIC_REQUEST_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const safeErrorCode = (error) => {
  const code = String(error?.code || error?.name || "UNKNOWN");
  return /^[A-Z0-9_]+$/.test(code) ? code : "UNKNOWN";
};

const getAppUrl = () => {
  const appUrl = String(process.env.APP_URL || "").trim().replace(/\/$/, "");
  const parsedUrl = new URL(appUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Invalid application URL.");
  }

  return appUrl;
};

const createForgotPasswordHandler = (UserModel, userType) =>
  async (req, res) => {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    try {
      const user = await UserModel.findOne({ email });

      if (user) {
        await PasswordResetToken.deleteMany({
          userId: user._id,
          userType,
          usedAt: null,
        });

        const rawToken = crypto.randomBytes(32).toString("base64url");
        const tokenHash = crypto
          .createHash("sha256")
          .update(rawToken)
          .digest("hex");
        const expiresAt = new Date(
          Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
        );

        await PasswordResetToken.create({
          userId: user._id,
          userType,
          tokenHash,
          expiresAt,
        });

        const resetPath = userType === "admin"
          ? "/admin/reset-password"
          : "/reset-password";
        const resetUrl = `${getAppUrl()}${resetPath}?token=${encodeURIComponent(rawToken)}`;
        const emailContent = createPasswordResetEmail({ resetUrl });

        try {
          await sendBatchEmails([
            {
              to: user.email,
              subject: emailContent.subject,
              html: emailContent.html,
            },
          ]);
        } catch (error) {
          await PasswordResetToken.deleteOne({ tokenHash }).catch(() => {});
          console.error(
            `Password reset email failed (${safeErrorCode(error)}).`,
          );
        }
      }

      return res.status(200).json({ message: GENERIC_REQUEST_MESSAGE });
    } catch (error) {
      console.error(
        `Password reset request failed (${safeErrorCode(error)}).`,
      );
      return res.status(200).json({ message: GENERIC_REQUEST_MESSAGE });
    }
  };

const createResetPasswordHandler = (UserModel, userType) =>
  async (req, res) => {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      return res.status(400).json({
        message: "This reset link is invalid or expired. Request a new link.",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    try {
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const now = new Date();
      const resetRecord = await PasswordResetToken.findOneAndUpdate(
        {
          tokenHash,
          userType,
          usedAt: null,
          expiresAt: { $gt: now },
        },
        { $set: { usedAt: now } },
        { returnDocument: "after" },
      );

      if (!resetRecord) {
        return res.status(400).json({
          message: "This reset link is invalid or expired. Request a new link.",
        });
      }

      const user = await UserModel.findById(resetRecord.userId);

      if (!user) {
        return res.status(400).json({
          message: "This reset link is invalid or expired. Request a new link.",
        });
      }

      user.password = await bcrypt.hash(password, 10);
      await user.save();

      await PasswordResetToken.deleteMany({
        userId: resetRecord.userId,
        userType,
        _id: { $ne: resetRecord._id },
      });

      return res.status(200).json({
        message: "Password reset successfully. You can now sign in.",
      });
    } catch (error) {
      console.error(
        `Password reset failed (${safeErrorCode(error)}).`,
      );
      return res.status(500).json({
        message: "Unable to reset your password. Request a new reset link.",
      });
    }
  };

module.exports = {
  requestCustomerPasswordReset: createForgotPasswordHandler(Customer, "customer"),
  resetCustomerPassword: createResetPasswordHandler(Customer, "customer"),
  requestAdminPasswordReset: createForgotPasswordHandler(Admin, "admin"),
  resetAdminPassword: createResetPasswordHandler(Admin, "admin"),
  RESET_TOKEN_TTL_MINUTES,
};
