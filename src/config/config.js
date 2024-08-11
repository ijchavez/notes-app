// config.js
const dotenv = require("dotenv");
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  SECRET: process.env.SECRET,
};

module.exports = config;
