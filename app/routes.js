var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var config = require('../config/application.js');
var App    = require('../app/models/apps');
module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});

	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		});
	});

  app.get('/dashboard', isLoggedIn,  function (req,res) {
    docker.containers.list(function(err,cont){
     App.find(function (warn, apps, count){
       res.render('dashboard.ejs',{apps: apps, containers: cont, user : req.user});
    });
   });
  });

  app.get('/ssh', isLoggedIn ,function (req,res) {
    res.render('ssh.ejs');
  });

  app.get('/containers/:id',function(req,res){
    console.log('INSPECT CONTAINER WITH ID '+req.params.id);
    docker.containers.inspect(req.params.id,function(err,req){
      res.render('containers/show.ejs',{container: req});
    });
  });


	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// app routes ===============================================================

  app.post( '/create', config.create );


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('signup.ejs', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));



	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/profile', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// unlink -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.username    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
