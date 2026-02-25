const express = require("express");
const { setSwagger } = require("./expressApp");
const {
  appSettings,
  appMiddlewares,
  setBackendRoutes,
  setStaticFiles,
  setSpaRoutes,
  render404,
  render500,
} = require("./expressApp");

// INIT
const app = express();
require("./config/passport");

// SETTINGS
appSettings(app);

// MIDDLEWARES
appMiddlewares(app);

// API ROUTES
setBackendRoutes(app);
setSwagger(app);

// STATIC FILES + SPA
setStaticFiles(app);
setSpaRoutes(app);

// ERRORS
render404(app);
render500(app);

module.exports = app;
