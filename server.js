// server.js

// set up ======================================================================

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');
var flash    = require('connect-flash');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var configDB = require('./config/database.js');

// configuration ===============================================================

mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating
        app.use(express.static(path.join(__dirname, 'public')));
	// required for passport
	app.use(express.session({ secret: 'iloveharborjsiloveharborjs' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//for api test purposes ========================================================
function handler(err, res) {
    if (err) throw err;
    console.log("data returned from Docker as JS object: ", res);
};


//socket functions =============================================================
io.sockets.on('connection', function(socket){  
 
  socket.on('sshkey', function(data){
    exec('touch ssh.pub ; echo '+data.mysshkey+' > ssh.pub; cat ~/ssh.pub | sudo sshcommand acl-add dokku '+ data.name, {
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('containerId', function(data){
    exec('docker kill '+ data.idcont +'; sudo rm -r /home/dokku/'+ data.namecont,{
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
   }).pipe(process.stdout);
  });

  socket.on('dbCreate',function(data){
    var name=data.name;
    var type=data.type;
    exec('dokku '+type+':create '+name,{
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('cmd', function(data){
    var cmd=data.cmd;
    var name=data.name;
    exec('dokku run ' + name + ' ' + cmd,{
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('apptolink', function(data){
    var app=data.appName;
    var db=data.dbName;
    exec('dokku postgresql:link '+ app +' '+db,{ //need function find db type
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });
});


// launch ======================================================================
server.listen(port);
console.log('HarborJS is running on port ' + port);
