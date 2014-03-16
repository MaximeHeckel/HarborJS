var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');
var server = http.createServer(app);
var docker = require('docker.io')({ socketPath:'/var/run/docker.sock'});
var io = require('socket.io').listen(server);

// Authenticator
app.use(express.basicAuth('testUser', 'testPass'));

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

app.get('/ssh', function (req,res) {
  res.sendfile(__dirname + '/views/ssh.html');
});

app.get('/containers/:id',function(req,res){
  res.sendfile(__dirname + '/views/containers/show.html',{container: docker.containers});
});


//for api test purposes 
/*docker.containers.inspect('9771bda577f5d81da130f9518160fafb2a9d878b8e74a558edc2f3bfb876fcda', function(err,res){
	if(err) throw err;
	console.log(res);	
});*/

//socket functions
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

  socket.on('dbCreate',function(data){
     var name=data.name;
     var type=data.type;
     exec('dokku '+type+':create '+name,{
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
	docker.containers.list(function(err,res){ 
  	socket.emit('container',res);
     });

  socket.on('inspectId',function(data){
	var containerId=data;
	console.log('INSPECT CONTAINER WITH ID '+containerId);
	docker.containers.inspect(containerId ,function(err,res){
          console.log(res);
          socket.emit('thiscontainer',res);
	});
  });
});


server.listen(8082);
