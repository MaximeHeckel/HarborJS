var express = require('express');
var http = require('http');
var path = require('path');
var exec = require('ssh-exec');

var app = express();

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


app.listen(3000)
