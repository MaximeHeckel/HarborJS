var exec = require('ssh-exec');

exec('cd ~/Desktop; ls -lh', {
    user: 'heckelmaxime',
    host: '127.0.0.1'
}).pipe(process.stdout);

