const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    concluido: { type: Boolean, default: false },

    projeto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projeto",
        required: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Tarefa", TarefaSchema);