const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");
const User = require("../models/User");

const authCtrl = {};

authCtrl.signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.matchPassword(password)) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });

  res.json({ token });
};

module.exports = authCtrl;
