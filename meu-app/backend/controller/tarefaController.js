const Tarefa = require('../models/Tarefa');

module.exports = {

    async criar(req, res){
        try{
            
            const projetoId = req.body.projetoId;

            const tarefa = await Tarefa.create({
                nome: req.body.nome,
                descricao: req.body.descricao, 
                concluido: req.body.concluido,
                projeto: projetoId 
            });

            return res.status(201).json(tarefa);

        }catch(error){
            console.error(error);
            return res.status(500).json({erro: "Erro ao criar uma tarefa"});
        }
    },

    async listarPorIdProjeto(req, res){
        try{
            const tarefas = await Tarefa.find({ projeto : req.query.projetoId })
                .sort({ createdAt: -1 });
            return res.json(tarefas);

        }catch(error){
            res.status(500).json({erro: error.message});
        }
    },

    async listar(req, res){
        try{
            const tarefas = await Tarefa.find();
            res.json(tarefas);
        }catch(error){
            res.status(500).json({erro: error.message});
        }
    },

    async buscarPorId(req, res){
        try{
            const tarefa = await Tarefa.findById(req.params.id);
            if(!tarefa){
                return res.status(404).json({erro:"Tarefa não encontrada"});
            }
            res.json(tarefa);

        }catch(error){
            res.status(400).json({erro: "ID inválido"});
        }
    },

    async atualizar(req, res){
        try{
            const tarefa = await Tarefa.findByIdAndUpdate(
                req.params.id,
                req.body,
                {new: true, runValidators: true}
            );

            if(!tarefa){
                return res.status(404).json({erro: "Tarefa não encontrada"});
            }

            res.json(tarefa);

        }catch(error){
            res.status(400).json({erro: error.message});
        }
    },

    async deletar(req, res){
        try{
            const tarefa = await Tarefa.findByIdAndDelete(req.params.id);
            if(!tarefa){
                return res.status(404).json({erro: "Tarefa não encontrada"});
            }
            res.json({mensagem: "Tarefa apagada com sucesso"});

        }catch(error){
            res.status(400).json({erro: error.message});
        }
    }
};


