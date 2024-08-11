const express = require("express");

const {
  appSettings,
  appMiddlewares,
  setGlovalVariables,
  setFrontEndRoutes,
  setBackendRoutes,
  setStaticFiles,
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

// GLOBAL VARIABLES
setGlovalVariables(app);

// ROUTES
setFrontEndRoutes(app);
setBackendRoutes(app);

// STATIC FILES
setStaticFiles(app);
render500(app); //esto renderiza el error de una manera mas amigable

module.exports = app;
