var express = require('express');
var app = express();
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');
var server = http.createServer(app);
var io = require('socket.io').listen(server);


app.configure(function(){
  app.use(express.static(path.join(__dirname,'/')));
});
// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  
  socket.on('sshkey', function(data){
    exec('touch ssh.pub; echo '+data+' > ssh.pub; cat ~/ssh.pub | ssh root@localhost \"sudo sshcommand acl-add dokku progrium\"', {
    user: 'root',
    host: '127.0.0.1'
    });
  });
});

server.listen(8081)
