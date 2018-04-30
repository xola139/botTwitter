 var mongoose = require('mongoose');

var ImagesSchema = new mongoose.Schema({
  id: String,
  avatar: String,
  images: [{
	  	url: String,
	  	fecha: String,
	  	status: String
	}]
});

module.exports = mongoose.model('Images', ImagesSchema);
