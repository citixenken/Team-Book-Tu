var express = require('express');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var expressValidator = require('express-validator');
var User = require('../models/user');
var Book = require('../models/book');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Team-Book-Tu' }); /*Team-Book-Tu */
  res.render('index', { 
  	user : req.user, 
  	title: 'Team-Book-Tu' 
  });
  
});


/*Homepage for registered user + Book Page*/

router.get('/homepage', function(req, res, next){
  Book.find({userId: req.user.id}, function(err, docs){
    res.render('homepage', { 
      user: req.user,
      title: 'Team-Book-Tu',
      books: docs });
  });
     
 });

router.post('/homepage', function(req, res, next) {
  req.assert('booktitle', 'Title cannot be blank').notEmpty();
  req.assert('authorname', 'Name cannot be blank').notEmpty();
  req.assert('isbn', 'ISBN cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/homepage');
  }

  var book = new Book({
    userId: req.user.id,
    booktitle: req.body.booktitle,
    authorname: req.body.authorname,
    isbn: req.body.isbn
  });

  book.save(function(err) {
    if (err) {
      req.flash('errors', { msg: err.message } );
      console.log((err.message ));
    } 
    else {
      req.flash('success', { msg: 'Book has been added to our database.'});
    }
    res.redirect('/homepage');
  });
    

});


/*Search Page*/

router.get('/search', function(req, res, next){
  res.render('search', {
    user: req.user,
    title: 'Team-Book-Tu'
  });
});

router.post('/search', function(req, res,next){
  var query = {};
  //console.log(req.body);
  for (var k in req.body){
    if ('_csrf' === k) continue;

    var v = req.body[k];
    if (v) query[k] = RegExp(v, 'i');
  }
  //console.log(query);
  //query.userId= req.user.id;
  Book.find(query, function(err, docs){
    if (err) return next(err);

    if (docs.length === 0){
      req.flash('errors', { msg: 'No book matching that criteria is in our database.'});
    }
    
    res.render('search', { searches: docs });
  });
  
});


/*Register page*/

router.get('/register', function(req, res){
  res.render('register', {
    user: req.user,
    title: 'Team-Book-Tu'
  });
});


router.post('/register', function(req, res){
  req.assert('username', 'Username cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/register');
  }
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/register');
    }
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        req.flash('success', { msg: 'Registration successful! You have been added to our database.' });
        res.redirect('/');
      });
    });
  });
});


/*Login page*/

router.get('/login', function(req, res){
	if (req.user) {
    return res.redirect('/');
  }
  res.render('login', {
    title: 'Team-Book-Tu'
  });
});

router.post('/login', function(req, res, next){

  req.assert('username', 'Username is not valid').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);//passport goddamnit!


});


/*Forgot password: Password reset*/

router.get('/forgot', function(req, res){
  res.render('forgot', {
    user: req.user
  })
});

router.post('/forgot', function(req, res, next){
  async.waterfall([
    function(done){
      crypto.randomBytes(20, function(err, buf){
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done){
      User.findOne({ email: req.body.email }, function(err, user){
        if(!user){
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; //1 hour lifetime

        user.save(function(err){
          done(err, token, user);
        });
      });
    },
    function(token, user, done){
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'c1t1z3nk3n',
          pass: ''
        }

      });
      var mailOptions = {
        to: user.email,
        //from: 'passwordreset@demo.com',
        from: 'c1t1z3nk3n@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
    ], function(err){
      if(err){
        return next(err);
      }
      res.redirect('/forgot');
    });
});


/*Reset password: Tokens*/

router.get('/reset/:token', function(req, res){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user){
    if(!user){
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res){
  async.waterfall([
    function(done){
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
        if(!user){
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        //unsetting these fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err){
          req.logIn(user, function(err){
            done(err, user);
          });
        });
      });
    },
    function(user, done){
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'c1t1z3nk3n',
          pass: ''
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed.',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'

      };
      smtpTransport.sendMail(mailOptions, function(err){
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
    ], function(err){
      res.redirect('/');
    });
});


/*Logout*/

router.get('/logout', function(req, res){
	req.session.destroy();//clear session data
  req.logout();
	res.redirect('/');
  
});



module.exports = router;
