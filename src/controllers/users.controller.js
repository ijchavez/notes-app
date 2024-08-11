const usersCtrl = {};
const passport = require("passport");
const validations = require("../helpers/validations");
const {
  findUserByEmail,
  registerNewUser,
} = require("../helpers/users.helpers");

usersCtrl.renderSignUpForm = (req, res) => {
  res.render("users/signup");
};
/**
 * Registers a new user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 *
 * @returns {Promise<void>}
 */
usersCtrl.signup = async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  const errors = validations.validateSignupFields(
    name,
    email,
    password,
    confirm_password
  );
  if (errors.length > 0) {
    return res.render("users/signup", {
      errors,
      name,
      email,
      password,
      confirm_password,
    });
  }

  const emailUser = await findUserByEmail(email);
  if (emailUser) {
    req.flash("error_msg", "The email is already in use");
    return res.redirect("signup");
  }

  const newUser = await registerNewUser(name, email, password);
  req.flash("success_msg", "Successfully Registered");
  res.redirect("signin");
};
usersCtrl.signin = passport.authenticate("local", {
  successRedirect: "/notes",
  failureRedirect: "/users/signin",
  failureFlash: true,
});

usersCtrl.renderSigninForm = (req, res) => {
  res.render("users/signin");
};

usersCtrl.logout = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("signin");
};

module.exports = usersCtrl;
