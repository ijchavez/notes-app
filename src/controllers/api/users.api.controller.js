const validations = require("../../helpers/validations");
const {
  findUserByEmail,
  registerNewUser,
} = require("../../helpers/users.helpers");
const { obtainToken } = require("../../helpers/jwtauth");
const usersApiCtrl = {};

/**
 * Registers a new user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>}
 */
usersApiCtrl.apiRegisterUser = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  const errors = validations.validateSignupFields(
    name,
    email,
    password,
    confirm_password
  );
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const emailUser = await findUserByEmail(email);
  if (emailUser) {
    return res.status(400).json({ message: "The email is already in use" });
  }

  const newUser = await registerNewUser(name, email, password);
  const token = await obtainToken(newUser._id);

  res.status(201).json({ token });
};

module.exports = usersApiCtrl;
