var User = require("./app/models/user.js")
var configDB = require("./config/database.js");
var mongoose = require("mongoose");

mongoose.connect(configDB.url); // connect to our database
mongoose.connection.on('error', function(err){
  console.warn("Db connection error: " + err);
});

console.log("Seeding...");

var users = [];
var user;

user = users[0]= new User();
user.local.username = "admin";
user.local.password = user.generateHash("admin");

user = users[1]= new User();
user.local.username = "toto";
user.local.password = user.generateHash("toto");

user = users[2]= new User();
user.local.username = "titi";
user.local.password = user.generateHash("titi");

User.create(users, function(err){
  if(err){
    console.warn("Error when saving users: " + err);
  }
  else {
    console.log("Users saved");
    process.exit();
  }
});
