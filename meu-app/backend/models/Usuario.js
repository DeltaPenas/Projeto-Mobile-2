const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UsuarioSchema = new mongoose.Schema({
  nome: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  senha: {type: String, required: true,}
}, {timestamps: true}); 

//middleware pra criptografar a senha automaticamente 
UsuarioSchema.pre("save", async function(next) {
  if (!this.isModified("senha")) return next();
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  
});

//metodo pra validar a senha criptografada no login

UsuarioSchema.methods.compararSenha = async function(senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha)
  
}

//Tirar a senha do json

UsuarioSchema.methods.toJSON = function(){
  const obj = this.toObject();
  delete obj.senha;
  return obj;
}

module.exports = mongoose.model('Usuario', UsuarioSchema);