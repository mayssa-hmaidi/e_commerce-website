const isProduction = () => process.env.NODE_ENV === "production";

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax",
  path: "/",
  maxAge,
});

const setAuthCookie = (res, name, token, maxAge) => {
  res.cookie(name, token, getCookieOptions(maxAge));
};

const clearAuthCookie = (res, name) => {
  res.clearCookie(name, getCookieOptions());
};

const getAuthToken = (req, cookieName) => {
  const cookieHeader = req.headers.cookie || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (cookie) {
    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  }

  const authorization = req.headers.authorization || "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
};

module.exports = {
  clearAuthCookie,
  getAuthToken,
  setAuthCookie,
};