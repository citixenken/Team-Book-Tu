var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var User = require('../models/user');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Team-Book-Tu' }); /*Team-Book-Tu */
  res.render('index', { 
  	user : req.user, 
  	title: 'Team-Book-Tu' 
  });
  
});

router.get('/home', function(req, res, next) {
  res.render('home', { 
    user : req.user,
    title: 'Team-Book-Tu' }); /*Team-Book-Tu */
  //res.render('home', { user : req.user });
  
});

/*router.get('/register' , function(req, res){
	res.render('register', { title: 'Team-Book-Tu' });
});*/

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
	req.logout();
  req.session.destroy();//clear session data
	res.redirect('/');
  
});



module.exports = router;
