const jwt = require("jsonwebtoken");
const { SECRET } = require("../config/config");

const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "Not Authorized");
  res.redirect("/users/signin");
};
helpers.isApiAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired." });
      }
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = { id: decoded.id };
    next();
  });
};

module.exports = helpers;
