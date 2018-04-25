 var mongoose = require('mongoose');

var PromosSchema = new mongoose.Schema({
  			id:String,
			avatar:String,
			promos:[{descripcion:String,created_at:String,idTwit:String,id_str:String}],
});

module.exports = mongoose.model('Promos', PromosSchema);


			