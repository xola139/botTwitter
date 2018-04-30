 var mongoose = require('mongoose');

var PromosSchema = new mongoose.Schema({
  			id:String,
			avatar:String,
			promos:[{descripcion:String,created_at:String,idTwit:String,id_str:String}],
			fk_images: [{type: mongoose.Schema.Types.ObjectId, ref: 'Images'}]
});

module.exports = mongoose.model('Promos', PromosSchema);


			