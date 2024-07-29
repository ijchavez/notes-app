const jwt = require("jsonwebtoken");
const secret = "zat71gpnWLz9+o9R7wcceHeqQ5YLIiddaU3Mq5voChs=";

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

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token." });
    }

    req.user = { id: decoded.id };
    next();
  });
};

module.exports = helpers;
