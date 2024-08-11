const expressApp = {};
const exphbs = require("express-handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const handlebars = require("handlebars");
const path = require("path");
const morgan = require("morgan");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const passport = require("passport");
const session = require("express-session");
const express = require("express");
const { PORT } = require("./config/config");

expressApp.appSettings = (app) => {
  app.set("port", PORT || 3000);
  app.set("views", path.join(__dirname, "views"));
  app.engine(
    ".hbs",
    exphbs({
      defaultLayout: "main",
      layoutsDir: path.join(app.get("views"), "layouts"),
      partialsDir: path.join(app.get("views"), "partials"),
      extname: ".hbs",
      handlebars: allowInsecurePrototypeAccess(handlebars),
    })
  );
  app.set("view engine", ".hbs");
};

expressApp.appMiddlewares = (app) => {
  app.use(morgan("dev"));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(methodOverride("_method"));
  app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
};

expressApp.setGlovalVariables = (app) => {
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
  });
};

expressApp.setFrontEndRoutes = (app) => {
  app.use(require("./routes/index.routes"));
  app.use(require("./routes/notes.routes"));
  app.use(require("./routes/users.routes"));
  app.use(require("./routes/auth.routes"));
};

expressApp.setBackendRoutes = (app) => {
  app.use("/api/notes", require("./routes/api/notes.api.routes"));
  app.use("/api/users", require("./routes/api/users.api.routes"));
};

expressApp.setStaticFiles = (app) => {
  app.use(express.static(path.join(__dirname, "public")));
};

expressApp.render404 = (app) => {
  app.use((req, res, next) => {
    return res.status(404).render("404");
  });
};

expressApp.render500 = (app) => {
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.render("error", {
      error,
    });
  });
};

expressApp.listen = (app) => {
  app.listen(app.get("port"), () => {
    console.log("server on port:", app.get("port"));
  });
};

module.exports = expressApp;
