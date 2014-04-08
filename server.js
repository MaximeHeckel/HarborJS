// server.js

// set up ======================================================================

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var fs       = require('fs');
var mongoose = require('mongoose');
var passport = require('passport');
var http     = require('http');
var path     = require('path');
var flash    = require('connect-flash');
var server   = http.createServer(app);
var io       = require('socket.io').listen(server);
var docker   = require('docker.io')({ socketPath:'/var/run/docker.sock'});



//config files ================================================================
var configDB = require('./config/database.js');
var credentials = JSON.parse(fs.readFileSync('credentials.json'));

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

  // set up our express application
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.set('view engine', 'ejs'); // set up ejs for templating
  app.use(express.static(path.join(__dirname, 'public')));

  // required for passport
  app.use(express.session({ secret: 'iloveharborjsiloveharborjs' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash()); // use connect-flash for flash messages stored in session
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// socket function =============================================================
require('./config/sockets.js')(io, credentials, docker);

// launch ======================================================================
server.listen(port);
console.log('HarborJS is running on port ' + port);
