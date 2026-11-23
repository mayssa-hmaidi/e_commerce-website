const rules = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening"],
    response: "Hello! Welcome to our store. How can I help you today?",
  },
  {
    keywords: ["product", "products", "t-shirt", "tshirts", "clothes"],
    response:
      "We offer different T-shirt designs and styles. Visit our Shop page to discover our collection!",
  },
  {
    keywords: ["size", "sizes", "sizing", "small", "medium", "large"],
    response:
      "You can check the available sizes on each product page before adding an item to your cart.",
  },
  {
    keywords: ["price", "prices", "cost", "expensive", "cheap"],
    response: "You can find the latest prices directly on our product pages.",
  },
  {
    keywords: ["delivery", "shipping", "deliver", "ship"],
    response:
      "We offer delivery to different locations. Delivery details are available during checkout.",
  },
  {
    keywords: ["payment", "pay", "credit card", "cash"],
    response: "You can check the available payment methods during checkout.",
  },
  {
    keywords: ["order", "orders", "track", "tracking"],
    response:
      "You can follow your orders from your My Orders section after logging into your account.",
  },
  {
    keywords: ["return", "refund", "exchange"],
    response:
      "For returns or exchanges, please contact our customer support team.",
  },
  {
    keywords: ["account", "login", "register", "signup", "password"],
    response:
      "You can create an account or log in using the account section of our website.",
  },
  {
    keywords: ["contact", "support", "help", "problem"],
    response:
      "We are happy to help! Please visit our Contact page for further assistance.",
  },
  {
    keywords: ["thank", "thanks"],
    response: "You're welcome! Happy shopping!",
  },
  {
    keywords: ["bye", "goodbye", "see you"],
    response: "Goodbye! Thank you for visiting our store.",
  },
];

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

function getChatbotResponse(message) {
  if (!message || typeof message !== "string") {
    return "Please enter a valid message.";
  }

  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return "Please enter a message so I can help you.";
  }

  for (const rule of rules) {
    const matched = rule.keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedMessage
        .split(" ")
        .some((word) => word === normalizedKeyword);
    });

    if (matched) {
      return rule.response;
    }
  }

  return "Sorry, I didn't understand your question. You can ask me about products, sizes, prices, delivery, payments or orders.";
}

module.exports = {
  getChatbotResponse,
};
