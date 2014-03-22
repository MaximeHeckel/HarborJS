// load up the user model
var App       = require('../app/models/apps');

exports.create = function(req, res){
  new App({
	name : req.body.name,
        user : req.body.user
  }).save(function(err, app, count){
    res.redirect('/profile')
  });
};

/*exports.show = function(req,res){
  App.find( function(err, apps, count){

};*/
