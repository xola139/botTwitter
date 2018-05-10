var mongoose = require('mongoose');

var disponibleSchema = new mongoose.Schema({
  id:String,
  disponibles:[{
  	ciudad:String,
  	descripcion: String,
  	created_at:String
  }],
  fk_images: [{type: mongoose.Schema.Types.ObjectId, ref: 'Images'}]

});
module.exports = mongoose.model('Disponible', disponibleSchema);
