var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var flash = require('connect-flash');
module.exports = function(app,passport){
  app.get('/', function (req, res) {
     res.render('index.ejs');
  });

  app.get('/dashboard', function (req,res) {
    docker.containers.list(function(err,req){
     res.render('dashboard.ejs',{containers: req});
    });
  });

  app.get('/ssh',isLoggedIn ,function (req,res) {
    res.render('ssh.ejs');
  });

  app.get('/containers/:id',function(req,res){
    console.log('INSPECT CONTAINER WITH ID '+req.params.id);
    docker.containers.inspect(req.params.id,function(err,req){
      res.render('containers/show.ejs',{container: req});
    });
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function(req, res) {

  // render the page and pass in any flash data if it exists
    res.render('login.ejs'/*, { message: req.flash('loginMessage') }*/); 
  });

  // process the login form
  // app.post('/login', do all our passport stuff here);

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs'/*, { message: req.flash('signupMessage') }*/);
  });

  app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : false // allow flash messages
	}));

  // process the signup form
  // app.post('/signup', do all our passport stuff here);

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
    user : req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

