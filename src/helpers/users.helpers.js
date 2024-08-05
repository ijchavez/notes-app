const User = require("../models/User");

/**
 * Finds a user by email.
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<Object|null>} - The user object if found, null otherwise.
 */
const findUserByEmail = async (email) => {
  return await User.findOne({ email: email });
};

/**
 * Registers a new user.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Object>} - The newly registered user object.
 */
const registerNewUser = async (name, email, password) => {
  const newUser = new User({
    name,
    email,
    password,
  });
  newUser.password = await newUser.encryptPassword(password);
  await newUser.save();
  return newUser;
};

module.exports = {
  findUserByEmail,
  registerNewUser,
};
