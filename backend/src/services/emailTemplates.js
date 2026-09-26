const { isDeepStrictEqual } = require("util");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const safeUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : "";
  } catch {
    return "";
  }
};

const emailLayout = ({ storeName, eyebrow, title, body, actionUrl, actionLabel, unsubscribeUrl }) => `
  <!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;background:#f3f3f1;color:#171717;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3f1;padding:32px 12px;">
        <tr><td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;">
            <tr><td style="padding:28px 32px;border-bottom:1px solid #e8e8e5;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(storeName)}</td></tr>
            <tr><td style="padding:34px 32px 12px;color:#777;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</td></tr>
            <tr><td style="padding:0 32px 16px;font-size:30px;line-height:1.15;font-weight:700;">${escapeHtml(title)}</td></tr>
            <tr><td style="padding:0 32px 30px;color:#555;font-size:15px;line-height:1.65;">${body}</td></tr>
            <tr><td style="padding:0 32px 38px;"><a href="${escapeHtml(safeUrl(actionUrl))}" style="display:inline-block;padding:14px 24px;background:#171717;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(actionLabel)}</a></td></tr>
            <tr><td style="padding:20px 32px;border-top:1px solid #e8e8e5;color:#888;font-size:11px;line-height:1.6;">You received this because you subscribed to ${escapeHtml(storeName)} updates.<br><a href="${escapeHtml(safeUrl(unsubscribeUrl))}" style="color:#555;">Unsubscribe</a></td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>
`;

const createNewProductEmail = ({
  storeName,
  productName,
  imageUrl,
  price,
  originalPrice,
  discount,
  currency,
  productUrl,
  unsubscribeUrl,
}) => {
  const image = safeUrl(imageUrl);
  const imageMarkup = image
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(productName)}" width="536" style="display:block;width:100%;height:auto;max-height:520px;object-fit:cover;margin:0 0 24px;">`
    : "";
  const priceMarkup = discount > 0
    ? `<strong>${escapeHtml(price)} ${escapeHtml(currency)}</strong> <span style="color:#888;text-decoration:line-through;">${escapeHtml(originalPrice)} ${escapeHtml(currency)}</span> <span style="color:#a43d30;font-weight:700;">-${escapeHtml(discount)}%</span>`
    : `<strong>${escapeHtml(price)} ${escapeHtml(currency)}</strong>`;
  const body = `${imageMarkup}<p style="margin:0 0 12px;">A new piece just landed. Meet <strong>${escapeHtml(productName)}</strong>.</p><p style="margin:0;">${priceMarkup}</p>`;

  return {
    subject: `New drop: ${productName}`,
    html: emailLayout({
      storeName,
      eyebrow: "New Drop",
      title: productName,
      body,
      actionUrl: productUrl,
      actionLabel: "Shop Now",
      unsubscribeUrl,
    }),
  };
};

const createPromotionEmail = ({
  storeName,
  title,
  discount,
  code,
  minimumOrder,
  currency,
  expiresAt,
  shopUrl,
  unsubscribeUrl,
}) => {
  const expiry = expiresAt
    ? `<p style="margin:14px 0 0;">Offer ends ${escapeHtml(new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }))}.</p>`
    : "";
  const minimum = Number(minimumOrder) > 0
    ? `<p style="margin:14px 0 0;">Minimum order: ${escapeHtml(Number(minimumOrder).toFixed(2))} ${escapeHtml(currency)}.</p>`
    : "";
  const body = `<p style="margin:0 0 12px;">${escapeHtml(discount)}</p>${code ? `<p style="margin:0;padding:12px 16px;background:#f3f3f1;font-size:17px;font-weight:700;letter-spacing:2px;">${escapeHtml(code)}</p>` : ""}${minimum}${expiry}`;

  return {
    subject: `${title} | ${storeName}`,
    html: emailLayout({
      storeName,
      eyebrow: "A Little Something For You",
      title,
      body,
      actionUrl: shopUrl,
      actionLabel: "Shop Now",
      unsubscribeUrl,
    }),
  };
};

const formatProductChange = (field, change) => {
  const before = change.before;
  const after = change.after;

  if (field === "price") {
    return `Price changed from ${Number(before).toFixed(2)} DT to ${Number(after).toFixed(2)} DT`;
  }

  if (field === "discount") {
    return `Discount changed from ${Number(before) || 0}% to ${Number(after) || 0}%`;
  }

  if (field === "stock") {
    return `Stock changed from ${before} to ${after}`;
  }

  if (field === "variants") {
    const colorsBefore = (before || []).map((variant) => variant.color).join(", ") || "None";
    const colorsAfter = (after || []).map((variant) => variant.color).join(", ") || "None";
    const imagesChanged = !isDeepStrictEqual(
      (before || []).map((variant) => variant.images || []),
      (after || []).map((variant) => variant.images || []),
    );
    const colorSummary = `Colors changed from ${colorsBefore} to ${colorsAfter}`;
    return imagesChanged ? `${colorSummary}; product images were updated` : colorSummary;
  }

  if (field === "sizes") {
    return `Sizes changed from ${(before || []).join(", ") || "None"} to ${(after || []).join(", ") || "None"}`;
  }

  if (field === "description") {
    const summarize = (value) => {
      const text = String(value || "").trim();
      return text.length > 180 ? `${text.slice(0, 177)}...` : text || "Empty";
    };
    return `Description changed from "${summarize(before)}" to "${summarize(after)}"`;
  }

  return `Product name changed from "${before}" to "${after}"`;
};

const createProductChangeEmail = ({
  storeName,
  productName,
  title,
  changeType,
  changes,
  productUrl,
  unsubscribeUrl,
}) => {
  const descriptions = Object.entries(changes).map(([field, change]) =>
    formatProductChange(field, change),
  );
  const body = descriptions.length
    ? `<p style="margin:0 0 12px;">${escapeHtml(productName)} was updated:</p><ul style="margin:0;padding-left:20px;">${descriptions.map((description) => `<li style="margin:0 0 8px;">${escapeHtml(description)}</li>`).join("")}</ul>`
    : `<p style="margin:0;">${escapeHtml(productName)} is no longer available.</p>`;

  return {
    subject: `${changeType}: ${productName}`,
    html: emailLayout({
      storeName,
      eyebrow: changeType,
      title,
      body,
      actionUrl: productUrl,
      actionLabel: changeType === "Product Removed" ? "Shop Now" : "View Product",
      unsubscribeUrl,
    }),
  };
};

const createPasswordResetEmail = ({ resetUrl }) => {
  const safeResetUrl = escapeHtml(safeUrl(resetUrl));

  return {
    subject: "Urban Threads - Reset Your Password",
    html: `
      <!doctype html>
      <html lang="en">
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;background:#f3f3f1;color:#171717;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3f1;padding:32px 12px;">
            <tr><td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;">
                <tr><td style="padding:28px 32px;border-bottom:1px solid #e8e8e5;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Urban Threads</td></tr>
                <tr><td style="padding:34px 32px 12px;color:#777;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">ACCOUNT SECURITY</td></tr>
                <tr><td style="padding:0 32px 16px;font-size:28px;line-height:1.2;font-weight:700;">Reset Your Password</td></tr>
                <tr><td style="padding:0 32px 24px;color:#555;font-size:15px;line-height:1.65;">We received a request to reset your password. Use the button below to choose a new password. This link expires in 20 minutes.</td></tr>
                <tr><td style="padding:0 32px 24px;"><a href="${safeResetUrl}" style="display:inline-block;padding:14px 24px;background:#171717;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Reset Password</a></td></tr>
                <tr><td style="padding:0 32px 28px;color:#666;font-size:12px;line-height:1.6;">If the button does not work, use this link:<br><a href="${safeResetUrl}" style="color:#333;word-break:break-all;">${safeResetUrl}</a></td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid #e8e8e5;color:#888;font-size:11px;line-height:1.6;">If you did not request this, you can ignore this email. Your password will not change unless the reset link is used.</td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  };
};

module.exports = {
  createNewProductEmail,
  createProductChangeEmail,
  createPromotionEmail,
  createPasswordResetEmail,
};
