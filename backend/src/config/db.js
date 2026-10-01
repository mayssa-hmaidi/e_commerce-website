const mongoose = require("mongoose");

const cache = global.__mongooseConnection || {
  connection: null,
  promise: null,
};

global.__mongooseConnection = cache;

const connectDB = async () => {
  if (cache.connection && mongoose.connection.readyState === 1) {
    return cache.connection;
  }

  if (!process.env.MONGO_URI) {
    const error = new Error("MongoDB is not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        cache.connection = connection;
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        cache.promise = null;
        error.statusCode = 503;
        throw error;
      });
  }

  return cache.promise;
};

module.exports = connectDB;