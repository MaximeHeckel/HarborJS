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

exec('cd ~/Desktop; ls -lh', {
    user: 'heckelmaxime',
    host: '127.0.0.1'
}).pipe(process.stdout);


io.sockets.on('connection', function(socket){
  
  socket.on('sshkey', function(data){
    exec('touch ssh.pub; echo '+data' >> ssh.pub; cat ~/ssh.pub | sudo sshcommand acl-add dokku progrium', {
    user: 'root',
    host: '127.0.0.1'
    }).pipe(process.stdout);
  });
});

server.listen(8081)
