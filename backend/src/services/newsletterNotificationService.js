const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const NewsletterNotification = require("../models/NewsletterNotification");
const ShopSettings = require("../models/ShopSettings");
const { isEmailConfigured, sendBatchEmails } = require("./emailService");
const {
  createNewProductEmail,
  createProductChangeEmail,
  createPromotionEmail,
} = require("./emailTemplates");
const getFrontendUrl = require("../utils/frontendUrl");

const claimEvent = async (eventKey, type) => {
  try {
    await NewsletterNotification.create({ eventKey, type, status: "processing" });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      console.log(`Newsletter event already handled: ${eventKey}`);
      return false;
    }
    throw error;
  }
};

const buildRecipientMessages = (subscribers, makeEmail, appUrl) =>
  subscribers.map((subscriber) => {
    const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
    return {
      to: subscriber.email,
      ...makeEmail(unsubscribeUrl),
    };
  });

const sendEvent = async ({ eventKey, type, label, makeEmail }) => {
  if (!isEmailConfigured()) {
    throw new Error("Set GMAIL_USER and GMAIL_APP_PASSWORD to enable newsletter delivery.");
  }

  const appUrl = getFrontendUrl();

  if (!(await claimEvent(eventKey, type))) {
    return;
  }

  try {
    const [subscribers, settings] = await Promise.all([
      NewsletterSubscriber.find({ subscribed: true })
        .select("email +unsubscribeToken")
        .lean(),
      ShopSettings.findOne().select("storeName currency").lean(),
    ]);

    console.log(`Newsletter subscribers found: ${subscribers.length}`);

    if (subscribers.length) {
      const storeName = settings?.storeName || "Urban Threads";
      const messages = buildRecipientMessages(
        subscribers,
        (unsubscribeUrl) => makeEmail({
          storeName,
          currency: settings?.currency || "DT",
          appUrl,
          unsubscribeUrl,
        }),
        appUrl,
      );
      await sendBatchEmails(messages);
    }

    await NewsletterNotification.updateOne(
      { eventKey },
      { $set: { status: "completed", completedAt: new Date() } },
    );
    console.log(`${label} email notification completed`);
  } catch (error) {
    await NewsletterNotification.updateOne(
      { eventKey },
      { $set: { status: "failed", completedAt: new Date() } },
    ).catch((updateError) => {
      console.error("Newsletter event status update failed:", updateError.message);
    });
    console.error("Newsletter email failed:", error.message);
  }
};

const notifyNewProduct = async (product) => {
  const productId = String(product._id);
  console.log("New product email notification started");

  await sendEvent({
    eventKey: `product:${productId}`,
    type: "product",
    label: "New product",
    makeEmail: ({ storeName, currency, appUrl, unsubscribeUrl }) => {
      const discount = Number(product.discount) || 0;
      const imageUrl = product.variants
        ?.flatMap((variant) => variant.images || [])
        .find(Boolean);
      const formattedPrice = Number(product.price).toFixed(2);

      return createNewProductEmail({
        storeName,
        productName: product.name,
        imageUrl,
        price: (Number(product.price) * (1 - discount / 100)).toFixed(2),
        originalPrice: formattedPrice,
        discount,
        currency,
        productUrl: `${appUrl}/products/${encodeURIComponent(productId)}`,
        unsubscribeUrl,
      });
    },
  });
};

const getProductUrl = (appUrl, productId) =>
  `${appUrl}/products/${encodeURIComponent(String(productId))}`;

const notifyProductUpdated = async (product, changes, eventKey) => {
  console.log("Product update email notification started");

  await sendEvent({
    eventKey,
    type: "product",
    label: "Product update",
    makeEmail: ({ storeName, appUrl, unsubscribeUrl }) =>
      createProductChangeEmail({
        storeName,
        productName: product.name,
        title: "Product Updated",
        changeType: "Product Updated",
        changes,
        productUrl: getProductUrl(appUrl, product._id),
        unsubscribeUrl,
      }),
  });
};

const notifyProductRemoved = async (product, eventKey) => {
  console.log("Product removal email notification started");

  await sendEvent({
    eventKey,
    type: "product",
    label: "Product removal",
    makeEmail: ({ storeName, appUrl, unsubscribeUrl }) =>
      createProductChangeEmail({
        storeName,
        productName: product.name,
        title: "Product Removed",
        changeType: "Product Removed",
        changes: {},
        productUrl: `${appUrl}/tshirts`,
        unsubscribeUrl,
      }),
  });
};

const notifyPromotion = async (promoCode) => {
  const promoId = String(promoCode._id);
  console.log("Promotion email notification started");

  await sendEvent({
    eventKey: `promotion:${promoId}`,
    type: "promotion",
    label: "Promotion",
    makeEmail: ({ storeName, currency, appUrl, unsubscribeUrl }) => {
      const discount = promoCode.type === "percentage"
        ? `${Number(promoCode.value)}% off`
        : `${Number(promoCode.value).toFixed(2)} ${currency} off`;

      return createPromotionEmail({
        storeName,
        title: `A new offer from ${storeName}`,
        discount,
        code: promoCode.code,
        minimumOrder: promoCode.minOrderAmount,
        currency,
        expiresAt: promoCode.expiresAt,
        shopUrl: `${appUrl}/tshirts`,
        unsubscribeUrl,
      });
    },
  });
};

module.exports = {
  notifyNewProduct,
  notifyProductUpdated,
  notifyProductRemoved,
  notifyPromotion,
};
