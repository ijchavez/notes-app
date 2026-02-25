const passport = require("passport");
const { obtainToken } = require("../../helpers/jwtauth");

const apiAuthCtrl = {};

apiAuthCtrl.signin = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal error" });
    }

    if (!user) {
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });
    }

    try {
      const token = await obtainToken(user._id);
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (tokenError) {
      return res.status(500).json({ message: "Failed to generate token" });
    }
  })(req, res, next);
};

module.exports = apiAuthCtrl;
