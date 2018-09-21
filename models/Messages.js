var mongoose = require('mongoose');

var messagesSchema = new mongoose.Schema({
  id:Number,
  message:String,
  status:Boolean,
  auxuse:Boolean});

module.exports = mongoose.model('Messages', messagesSchema);
