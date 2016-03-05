var express = require('express');//handles routing requests
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); //used to examine POST calls

var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('express-flash');
var session = require('express-session');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var mongo = require('mongodb');
//var monk = require('monk');
//var db = monk('localhost:27017/password-reset-nodejs');

var routes = require('./routes/index');
//var books = require('./routes/books');

//connect to MongoDB
mongoose.connect('mongodb://localhost/app-database');

var User = require('./models/user');
var Book = require('./models/book');
//var Account = require('./models/account');

//mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');
var app = express(); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  secret : 'session secret key',
  resave : false,
  saveUninitialized: false,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//make our db accessible to our router.
// app.use(function(req, res, next){
//   req.db = db;
//   next();
// });

app.use('/', routes);
//app.use('/books', books);

/*//passport config

passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());*/

//Setting up LocalStrategy
passport.use(new LocalStrategy(function(username, password, done){
  User.findOne({ username: username }, function(err, user){
    if(err){
      return done(err);
    }
    if(!user){
      return done(null, false, { message: 'Incorrect username.'});
    }
    user.comparePassword(password, function(err, isMatch){
      if(isMatch){
        return done(null, user);
      }
      else{
        return done(null, false, { message: 'Incorrect password.'});
      }
    });

  });
}));

/*serialize and deserialize methods: Allows user to stay logged-in
when navigating between different pages within application.*/
passport.serializeUser(function(user, done){
  done(null, user.id);
}); 
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
