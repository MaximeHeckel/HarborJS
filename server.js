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

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// routing
app.get('/', function (req, res) {
     res.render('index.ejs');
});

app.get('/dashboard', function (req,res) {
  docker.containers.list(function(err,req){
     res.render('dashboard.ejs',{containers: req});
  });
});

app.get('/ssh', function (req,res) {
  res.render('ssh.ejs');
});

app.get('/containers/:id',function(req,res){
    console.log('INSPECT CONTAINER WITH ID '+containerId);
    docker.containers.inspect(':id',function(err,req){
      res.render('containers/show.ejs',{container: req});
    });
  });


//for api test purposes

docker.info(function(err,res){
  console.log(res);
});

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

  socket.on('inspectId',function(data){
	var containerId=data;
	console.log('INSPECT CONTAINER WITH ID '+containerId);
	docker.containers.inspect(containerId ,function(err,res){
          console.log(res);
          socket.emit('thiscontainer',res);
	});
  });
});


server.listen(app.get('port'));
console.log('HarborJS listening on port ' + app.get('port'));

