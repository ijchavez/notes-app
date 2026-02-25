const mongoose = require("mongoose");
const { MONGODB_URI } = require("./config");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    const port = mongoose.connection.port;
    console.log("=======================================");
    console.log("📦 Connected successfully to MongoDB");
    console.log(`🔗 DB Name: ${dbName}`);
    console.log(`🌐 Host: ${host}:${port}`);
    console.log("=======================================");
  })
  .catch((err) => {
    console.error("❌ Error al conectar con MongoDB:", err.message);
  });