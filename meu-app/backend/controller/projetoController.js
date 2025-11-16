const Projeto = require('../models/Projeto');


module.exports = {

    async criar(req, res){
        
        try{
            const usuarioId = req.usuarioId

            const projeto = await Projeto.create({
                nome: req.body.nome,
                descricao: req.body.descricao,
                concluido: req.body.concluido,
                usuario: usuarioId
            });
            
            return res.status(201).json(projeto);

        }catch(error){
            console.error(error);
            return res.status(500).json({erro: "Erro ao criar o projeto"});
        }

    },
    async listarPorIdUsuario(req, res){
        try{
            const projetos = await Projeto.find({ usuario: req.query.usuarioId })
            .sort({ createdAt: -1 });
            return res.json(projetos);

        }catch(err){
            res.status(500).json({erro: err.message})
        }


    },
    async listar(req, res){
        try{
            const projetos = await Projeto.find();
            res.json(projetos);
        }catch(err){
            res.status(500).json({erro: err.message})
        }
    },
    async buscarPorId(req, res){
        try{
            const projetos = await Projeto.findById(req.params.id);
            if(!projetos){
                return res.status(404).json({erro: "projeto não encontrado"})
            }
            res.json(projetos);

        }catch(err){
            res.status(400).json({erro: "id invalido"})
        }
    },
    async atualizar(req, res){
        try{
            const projeto = await Projeto.findByIdAndUpdate(
                req.params.id,
                req.body,
                {new: true, runValidators: true}
            )
            if(!projeto){
               return res.status(404).json({erro: "Projeto não encontrado"}); 
            }
            res.json(projeto)

        }catch(err){
            res.status(400).json({erro: err.message});
        }
    },
    async deletar(req, res){
        try{
            const projeto = await Projeto.findByIdAndDelete(req.params.id);
            if(!projeto){
                return res.status(404).json({erro: "projeto não encontrado"});
            }
            res.json({mensagem: "projeto deletado com sucesso"});

        }catch(err){
            res.status(400).json({erro: err.message});
        }
    }




}