const expressApp = {};
const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const express = require("express");
const { PORT } = require("./config/config");
const { setupSwaggerDocs } = require("./swagger/swagger");

const publicDir = path.join(__dirname, "public");
const spaEntry = path.join(publicDir, "app", "index.html");

expressApp.appSettings = (app) => {
  app.set("port", PORT || 3000);
};

expressApp.appMiddlewares = (app) => {
  app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(passport.initialize());
};

expressApp.setBackendRoutes = (app) => {
  app.use("/api/notes", require("./routes/api/notes.api.routes"));
  app.use("/api/users", require("./routes/api/users.api.routes"));
  app.use("/api/auth", require("./routes/api/auth.api.routes"));
};

expressApp.setSwagger = (app) => {
  setupSwaggerDocs(app);
};

expressApp.setStaticFiles = (app) => {
  app.use(express.static(publicDir));
};

expressApp.setSpaRoutes = (app) => {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/api-docs")) {
      return next();
    }
    return res.sendFile(spaEntry);
  });
};

expressApp.render404 = (app) => {
  app.use((req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "Not Found" });
    }
    return res.status(404).sendFile(spaEntry);
  });
};

expressApp.render500 = (app) => {
  app.use((error, req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res
        .status(error.status || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
    return res.status(error.status || 500).send("Internal Server Error");
  });
};

expressApp.listen = (app) => {
  app.listen(app.get("port"), () => {
    console.log(`Server running on http://localhost:${app.get("port")}`);
  });
};

module.exports = expressApp;
