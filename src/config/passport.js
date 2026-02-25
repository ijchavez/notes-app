const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User')

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    //confirmar si existe el correo del usuario
    const user = await User.findOne({ email: email });
    if (!user) {
      return done(null,
                  false,
                  { message: "Not User found." });

    } else {
      // Match Password's User
      const match = await user.matchPassword(password);
      if (match) {
        return done(null, user);
      
      } else {
        return done(null,
                    false,
                    { message: "Incorrect Password." });
      
      }
    
    }
  }

));

passport.serializeUser((user, done) => {
    done(null, user.id)

});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});