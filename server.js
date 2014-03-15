var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');
var server = http.createServer(app);
var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var io = require('socket.io').listen(server);

var PORT = process.env.PORT || 8082;
app.set('port', PORT);

// Authenticator
app.use(express.basicAuth('testUser', 'testPass'));

app.configure(function() {
  app.use(express.static(path.join(__dirname, '/')));
});

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/index.html');
});

app.get('/dashboard', function (req,res) {
  res.sendfile(__dirname + '/views/dashboard.html');
});

app.get('/ssh', function (req,res) {
  res.sendfile(__dirname + '/views/ssh.html');
});

app.get('/containers/:id', function(req,res) {
  console.log("Inspect container");
  res.render('/views/containers/show.html');
});

//socket functions
io.sockets.on('connection', function(socket){

  socket.on('sshkey', function(data){
    console.log('Received ssh key: ' + data);

    exec('touch ssh.pub ; echo ' + data + ' > ssh.pub; cat ~/ssh.pub | sudo sshcommand acl-add dokku progrium', {
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);

    socket.emit('sshkeyAdded');
  });

  socket.on('deleteContainer', function(idContainer) {
    exec('docker kill ' + idContainer, {
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
   }).pipe(process.stdout);
  });

  socket.on('dbCreate',function(data) {
    var name = data.dbName;
    var type = data.dbType;
    exec('dokku ' + type + ':create ' + name, {
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('dbLink', function(data) {
    var app = data.appName;
    var db = data.dbName;
    exec('dokku postgresql:link ' + app + ' ' + db, { //need function find db type
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });


  docker.containers.list(function(err,res) {
    socket.emit('containerList',res);
  });
});


server.listen(PORT);
console.info('Server listening on port ' + PORT);
