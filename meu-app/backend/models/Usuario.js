const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: {type: String, require: true},
  email: {type: String, require: true, unique: true},
  senha: {type: String, require: true, unique: true}
}, {Timestamp: true}); 

module.exports = mongoose.model('Usuario', UsuarioSchema);