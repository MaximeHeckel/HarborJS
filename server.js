// server.js

// set up ======================================================================

var express  = require('express');
var app      = express();
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port     = process.env.PORT || 3000;
var fs       = require('fs');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var passport = require('passport');
var http     = require('http');
var path     = require('path');
var flash    = require('connect-flash');
var server   = http.createServer(app);
var io       = require('socket.io').listen(server);

//config files ================================================================
var configDB = require('./config/database.js');
var credentials = require('./credentials.json');

var docker   = require('docker.io')({ 
  socketPath: false, 
  host: 'http://'+credentials.host, port: '4243'}); 


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

  // set up our express application
app.use(logger("combined"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({
    secret:'iloveharborjsiloveharborjs',
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(
        {db:configDB.url},
        function(err){
            console.log(err || 'connect-mongodb setup ok');
        })
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport, docker); // load our routes and pass in our app and fully configured passport

// socket function =============================================================
require('./config/sockets.js')(io, credentials, docker);

// launch ======================================================================
server.listen(port);
console.log('HarborJS is running on port ' + port);
