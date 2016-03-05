var express = require('express');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var expressValidator = require('express-validator');
//var Account = require('../models/account');
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

//Homepage for registered user + Book Page
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

      //req.flash('errors', { msg: (err.errors.booktitle || err.errors.authorname || err.errors.isbn || err).message });
      //req.flash('errors', { msg: 'A Book with this credentials already exists'});
      req.flash('errors', { msg: err.message } );
      console.log((err.message ));
    } 
    else {
      req.flash('success', { msg: 'Book has been added to our database.'});
    }
    res.redirect('/homepage');
  });
    

});

/*
//Book Page
router.get('/books', function(req, res, next){
  Book.find({userId: req.user.id}, function(err, docs){
    res.render('books', { 
      user: req.user,
      title: 'Team-Book-Tu',
      books: docs });
  });
     
 });

router.post('/books', function(req, res, next) {
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

      //req.flash('errors', { msg: (err.errors.booktitle || err.errors.authorname || err.errors.isbn || err).message });
      //req.flash('errors', { msg: 'A Book with this credentials already exists'});
      req.flash('errors', { msg: err.message } );
      console.log((err.message ));
    } 
    else {
      req.flash('success', { msg: 'Book has been added to our database.'});
    }
    res.redirect('/books');
  });
    

});
*/

//Search Page
router.get('/search', function(req, res, next){
  res.render('search', {
    user: req.user,
    title: 'Team-Book-Tu'
  });
});

router.post('/search', function(req, res){
  
});

//Register page
router.get('/register', function(req, res){
  res.render('register', {
    user: req.user,
    title: 'Team-Book-Tu'
  });
});

/*router.post('/register', function(req, res){
	Account.register(new Account({ username : req.body.username}), req.body.password, function(err, account){
		if (err){
			return res.render('register', { info : "Sorry. That username already exists. Try again.", title: 'Team-Book-Tu'});
		}
		passport.authenticate('local')(req, res, function(){
			res.redirect('/');
		});
	});
});*/

router.post('/register', function(req, res){
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  user.save(function(err){
    req.logIn(user, function(err){
      res.redirect('/');
    });
  });
});

router.get('/login', function(req, res){
	//res.render('login', { user : req.user });
	res.render('login', { 
		user : req.user, 
		message : req.flash('error'), 
		title: 'Team-Book-Tu' 
	});
});

/*router.post('/login', passport.authenticate('local', { failureRedirect : '/login', failureFlash : true }), function(req, res,next){
	req.session.save(function(err){
		if (err){
			return next(err);
		}
		res.redirect('/');
	});
	//res.render('index', { title: 'Team-Book-Tu' }); Team-Book-Tu 
});*/

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if(!user){
      return res.redirect('/login');
    }
    req.logIn(user, function(err){
      if(err){
        return next(err);
      }
      return res.redirect('/');
    });
  })(req, res, next); //passport goddamnit!


});

//Password reset
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

//Reset password: Tokens
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

router.get('/logout', function(req, res){
	req.session.destroy();//clear session data
  req.logout();
	res.redirect('/');
  
});



module.exports = router;
