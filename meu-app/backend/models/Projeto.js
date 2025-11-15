const mongoose = require('mongoose');

const ProjetoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    concluido: { type: Boolean, default: false },

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Projeto", ProjetoSchema);