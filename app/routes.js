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

  app.get('/containers/:id', isLoggedIn,function(req,res){
    console.log('INSPECT CONTAINER WITH ID '+req.params.id);
    docker.containers.inspect(req.params.id,function(err,requ){
      var reqname = requ.Config.Image;
      var name = reqname.replace('app/','').replace('postgresql/','').replace('mysql/','');
      docker.containers.attach(req.params.id, {stream: true, stdout: true, stderr:false, tty:false}, function(err,stream) {
	res.render('containers/show.ejs',{container: requ, name: name, stream: stream});
      });
    });
  });


  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

// app routes ===============================================================
  app.get('/new', function(req,res){
    res.render('containers/new.ejs', {user : req.user, apps : app});
  });

  app.get('/api/app_name_exists/:name', function(req, res){
    var app_exists;
    var app_name = decodeURIComponent(req.params.name);

    App.findOne({name: app_name}, function(err, app){
      app_exists = (app) ? true : false;
      res.json(app_exists);
    })
  });

  app.post( '/create', config.create );
  
  app.post('/createdb', config.createdb);

  app.get('/destroy/:id', config.destroy);

  //Oauth
  app.get('/oauth',
    passport.authenticate('oauth2'));

  app.get('/auth',
    passport.authenticate('oauth2', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/profile');
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}
