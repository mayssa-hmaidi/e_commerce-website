const getFrontendUrl = () => {
  const configuredUrl =
    process.env.FRONTEND_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configuredUrl) {
    throw new Error("FRONTEND_URL must be configured.");
  }

  const withProtocol = /^https?:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;
  const parsedUrl = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("FRONTEND_URL must use http or https.");
  }

  return withProtocol.replace(/\/$/, "");
};

module.exports = getFrontendUrl;