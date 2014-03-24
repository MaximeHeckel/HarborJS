// load up the user model
var App       = require('../app/models/apps');

exports.create = function(req, res){
  new App({
	name : 'app/'+req.body.name+':latest',
        user : req.body.user
  }).save(function(err, app, count){
    res.redirect('/new');
  });
};

exports.createdb = function(req,res){
  new App({
	name : req.body.type + '/'  + req.body.name + ':latest',
        user : req.body.user
  }).save(function(err, app, count){
    res.redirect('/new');
  });
};

/*exports.show = function(req,res){
  App.find( function(err, apps, count){

};*/
