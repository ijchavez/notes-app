const jwt = require("jsonwebtoken");
const { SECRET } = require("../config");
const User = require("../models/User");

const authCtrl = {};

/**
 * Authenticates a user and returns a JWT token if successful.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>}
 */
authCtrl.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    await validateFields(email, password);
    const user = await User.findOne({ email });
    await validatePasswordMatch(user, password);

    const token = await authCtrl.obtainToken(user._id);
    console.log(token);
    res.json({ token });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * Generates a JWT token for a given user ID.
 *
 * @param {string} id - The ID of the user.
 * @param {string} [expiresIn="1h"] - Token expiration time. Default is 1 hour.
 * @returns {Promise<string>} - The generated JWT token.
 */
authCtrl.obtainToken = async (id, expiresIn = "1h") => {
  const token = jwt.sign({ id }, SECRET, { expiresIn });
  return token;
};

/**
 * Validates the email and password fields.
 *
 * @param {string} email - The email provided by the user.
 * @param {string} password - The password provided by the user.
 * @throws Will throw an error if validation fails.
 */
const validateFields = async (email, password) => {
  if (!email) {
    throw { status: 400, message: "Email is required" };
  }
  if (!password) {
    throw { status: 400, message: "Password is required" };
  }
};

/**
 * Validates if the user exists and the password matches.
 *
 * @param {Object} user - The user object retrieved from the database.
 * @param {string} password - The password provided by the user.
 * @throws Will throw an error if validation fails.
 */
const validatePasswordMatch = async (user, password, res) => {
  //if (!user || user.matchPassword(password)) {
  if (!user || !(await user.matchPassword(password))) {
    throw { status: 401, message: "Invalid email or password" };
  }
};

module.exports = authCtrl;
