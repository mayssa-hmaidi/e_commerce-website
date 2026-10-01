const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "middleware-test-secret";

const adminProtect = require("../src/middleware/authMiddleware");
const customerProtect = require("../src/middleware/customerAuthMiddleware");

const runMiddleware = (middleware, cookie) => {
  const response = {
    statusCode: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json() {
      return this;
    },
  };
  let nextCalled = false;

  middleware(
    { headers: { cookie } },
    response,
    () => {
      nextCalled = true;
    },
  );

  return { response, nextCalled };
};

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" });

test("admin routes reject missing authentication", () => {
  const { response, nextCalled } = runMiddleware(adminProtect, "");

  assert.equal(response.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("admin routes reject customer tokens with 403", () => {
  const customerToken = signToken({ id: "customer-1", role: "customer" });
  const { response, nextCalled } = runMiddleware(
    adminProtect,
    `customerToken=${customerToken}`,
  );

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("admin routes accept explicit admin tokens", () => {
  const adminToken = signToken({ id: "admin-1", role: "admin" });
  const { response, nextCalled } = runMiddleware(
    adminProtect,
    `adminToken=${adminToken}`,
  );

  assert.equal(response.statusCode, null);
  assert.equal(nextCalled, true);
});

test("customer routes reject admin tokens with 403", () => {
  const adminToken = signToken({ id: "admin-1", role: "admin" });
  const { response, nextCalled } = runMiddleware(
    customerProtect,
    `customerToken=${adminToken}`,
  );

  assert.equal(response.statusCode, 403);
  assert.equal(nextCalled, false);
});

test("customer routes accept customer tokens", () => {
  const customerToken = signToken({ id: "customer-1", role: "customer" });
  const { response, nextCalled } = runMiddleware(
    customerProtect,
    `customerToken=${customerToken}`,
  );

  assert.equal(response.statusCode, null);
  assert.equal(nextCalled, true);
});