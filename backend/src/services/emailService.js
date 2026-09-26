const nodemailer = require("nodemailer");

const MAX_BATCH_SIZE = 100;
let transporter;

const isEmailConfigured = () =>
  Boolean(
    String(process.env.GMAIL_USER || "").trim() &&
      String(process.env.GMAIL_APP_PASSWORD || "").trim(),
  );

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error("Gmail SMTP is not configured.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER.trim(),
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
};

const getSafeSmtpError = (error) => {
  const code = /^[A-Z0-9_]+$/.test(String(error?.code || ""))
    ? error.code
    : "UNKNOWN";
  const descriptions = {
    EAUTH: "SMTP authentication failed. Check the Gmail account and Google App Password.",
    ECONNECTION: "Gmail SMTP connection failed.",
    ETIMEDOUT: "Gmail SMTP connection timed out.",
    ESOCKET: "Gmail SMTP socket failed.",
    EENVELOPE: "Gmail SMTP rejected the sender or recipient.",
    EMESSAGE: "Gmail SMTP could not send the message.",
  };

  return `${descriptions[code] || "Gmail SMTP message send failed."} (code: ${code})`;
};

console.info(
  `Gmail email configuration: GMAIL_USER=${process.env.GMAIL_USER?.trim() ? "present" : "missing"}, GMAIL_APP_PASSWORD=${process.env.GMAIL_APP_PASSWORD?.trim() ? "present" : "missing"}`,
);

const verifyEmailTransport = async () => {
  if (!isEmailConfigured()) {
    console.info("Gmail SMTP verification skipped: credentials are not configured.");
    return false;
  }

  try {
    await getTransporter().verify();
    console.info("Gmail SMTP verification succeeded.");
    return true;
  } catch (error) {
    console.error(`Gmail SMTP verification failed: ${getSafeSmtpError(error)}`);
    return false;
  }
};

if (isEmailConfigured()) {
  void verifyEmailTransport();
}

const sendBatchEmails = async (messages) => {
  const mailTransporter = getTransporter();
  const senderEmail = process.env.GMAIL_USER.trim();
  const senderName = String(process.env.EMAIL_FROM_NAME || "Urban Threads")
    .replace(/[\r\n<>]/g, "")
    .trim();
  const from = `${senderName} <${senderEmail}>`;

  for (let start = 0; start < messages.length; start += MAX_BATCH_SIZE) {
    const batch = messages.slice(start, start + MAX_BATCH_SIZE);

    for (const message of batch) {
      try {
        await mailTransporter.sendMail({
          from,
          to: message.to,
          subject: message.subject,
          html: message.html,
        });
      } catch (error) {
        throw new Error(getSafeSmtpError(error));
      }
    }
  }
};

module.exports = {
  isEmailConfigured,
  sendBatchEmails,
  verifyEmailTransport,
};
