var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');
var server = http.createServer(app);
var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var io = require('socket.io').listen(server);


app.configure(function(){
  app.use(express.static(path.join(__dirname,'/')));
});
// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/index.html');
});
app.get('/dashboard', function (req,res) {
  res.sendfile(__dirname + '/views/dashboard.html');
});
app.get('/containers/:id',function(req,res){
  console.log("Inspect container");
  res.render('containers/show.html');
});

io.sockets.on('connection', function(socket){

  socket.on('sshkey', function(data){
    exec('touch ssh.pub ; echo '+data+' > ssh.pub; cat ~/ssh.pub | sudo sshcommand acl-add dokku progrium', {
    user: 'root',
    host: '127.0.0.1',
    password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('containerId', function(data){
   exec('docker kill '+data,{
   user: 'root',
   host: '127.0.0.1',
   password: 'admin'
   }).pipe(process.stdout);
  });

  socket.on('dbname',function(data){
     var name=data;
     socket.on('dbtype',function(data){
	console.log(data);
        var type=data;
     exec('dokku '+type+':create '+name,{
      user: 'root',
      host: '127.0.0.1',
      password: 'admin'
    }).pipe(process.stdout);
  });

  socket.on('apptolink', function(data){
    var app=data;
    socket.on('dbtolinl', function(data){
	var db=data;
	exec('dokku postgresql:link '+ app +' '+db,{ //need function find db type
	  user: 'root',
          host: '127.0.0.1',
          password: 'admin'
	}).pipe(process.stdout);
    });
  });
});
	docker.containers.list(function(err,res){ 
  	socket.emit('container',res);
     });
});


server.listen(8082);
