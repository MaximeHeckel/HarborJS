var mongoose = require('mongoose');

//define the schema for our apps model
var Schema = mongoose.Schema;

var appSchema = new Schema({
  name   : String,
  user   : String
});

// create the model for apps and expose it to our app
module.exports = mongoose.model('App', appSchema);

