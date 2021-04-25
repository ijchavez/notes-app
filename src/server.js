const express = require('express');
const exphbs = require('express-handlebars');

const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');

const session = require('express-session');

//INIT
const app = express();
require('./config/passport')
//SETTINGS

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');
//MDW
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true

    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//GLOBAL VARIABLES
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
})
//ROUTES
app.use(require('./routes/index.routes'));
app.use(require('./routes/notes.routes'));
app.use(require('./routes/users.routes'));
// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));



module.exports = app;