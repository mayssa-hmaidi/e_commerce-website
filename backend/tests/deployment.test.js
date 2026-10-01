const path = require("path");
const { readFileSync } = require("fs");
const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGO_URI = "";
process.env.JWT_SECRET = "deployment-test-secret";
process.env.FRONTEND_URL = "https://urban-threads.vercel.app";
process.env.NODE_ENV = "production";

const app = require("../src/server");
const vercelHandler = require("../../api/[...path].js");
const adminRoutes = require("../src/routes/adminRoutes");
const vercelConfig = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../vercel.json"), "utf8"),
);
const appSource = readFileSync(
  path.resolve(__dirname, "../../frontend/src/App.tsx"),
  "utf8",
);

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("Vercel API entrypoint exports the existing Express app", () => {
  assert.equal(vercelHandler, app);
  assert.equal(vercelConfig.functions["api/[...path].js"].maxDuration, 60);
  assert.equal(vercelConfig.outputDirectory, "frontend/dist");
});

test("health endpoint responds without MongoDB", async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("products route is mounted once at /api/products", () => {
  const productMounts = app.router.stack.filter(
    (layer) => layer.name === "router" && layer.match("/api/products"),
  );

  assert.equal(productMounts.length, 1);
  assert.ok(
    productMounts[0].handle.stack.some(
      (layer) => layer.route?.path === "/",
    ),
  );
  assert.equal(
    app.router.stack.some(
      (layer) => layer.name === "router" && layer.match("/api/api/products"),
    ),
    false,
  );
});

test("SPA rewrite excludes API paths and allows client routes", () => {
  const rewrite = vercelConfig.rewrites.find(
    ({ destination }) => destination === "/index.html",
  );
  const matcher = new RegExp(`^${rewrite.source}$`);

  assert.ok(rewrite);
  assert.equal(matcher.test("/"), true);
  assert.equal(matcher.test("/admin/products"), true);
  assert.equal(matcher.test("/api"), false);
  assert.equal(matcher.test("/api/health"), false);
});

test("customer and admin routes remain declared", () => {
  for (const route of [
    "/",
    "/products",
    "/login",
    "/admin/login",
    "/admin",
    "/admin/dashboard",
    "/admin/products",
    "/admin/orders",
    "/admin/customers",
    "/admin/settings",
    "/admin/promotions",
      "/tshirts",
      "/product/:id",
      "/products/:id",
      "/cart",
      "/register",
      "/checkout",
      "/account",
      "/profile",
      "/my-orders",
      "/orders",
      "/favorites",
      "/admin/forgot-password",
      "/admin/reset-password",
      "/admin/register",
      "/admin/products/add",
      "/admin/products/edit/:id",
      "/admin/stock",
      "/admin/analytics",
      "/admin/promo-codes",
      "/admin/messages",
      "/admin/newsletter",
  ]) {
    assert.ok(appSource.includes(`path="${route}"`), `${route} is missing`);
  }
});

test("products URL reaches Express and does not become a SPA response", async () => {
  const response = await fetch(`${baseUrl}/api/products`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.message, "Service temporarily unavailable.");
  assert.match(response.headers.get("content-type"), /application\/json/);
});

test("settings has one route owner and admin registration is absent", () => {
  const settingsMounts = app.router.stack.filter(
    (layer) => layer.name === "router" && layer.match("/api/settings"),
  );

  assert.equal(settingsMounts.length, 1);
  assert.equal(
    adminRoutes.stack.some((layer) => layer.route?.path === "/register"),
    false,
  );
});

test("CORS allows the configured Vercel origin and local frontend", async () => {
  for (const origin of [
    "https://urban-threads.vercel.app",
    "http://localhost:5173",
  ]) {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
      },
    });

    assert.equal(response.headers.get("access-control-allow-origin"), origin);
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  }
});

test("state-changing requests reject untrusted origins", async () => {
  const response = await fetch(`${baseUrl}/api/admin/logout`, {
    method: "POST",
    headers: { Origin: "https://untrusted.example" },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    message: "Request origin is not allowed.",
  });
});

test("admin and customer logout clear cookies without MongoDB", async () => {
  for (const [path, cookieName] of [
    ["/api/admin/logout", "adminToken"],
    ["/api/customer-auth/logout", "customerToken"],
  ]) {
    const response = await fetch(`${baseUrl}${path}`, { method: "POST" });

    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie"), new RegExp(`${cookieName}=`));
    assert.match(response.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/i);
  }
});