const Tarefa = require('../models/Tarefa');
const Projeto = require('../models/Projeto'); 

module.exports = {

    async criar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const projetoId = req.body.projetoId;

            const projeto = await Projeto.findById(projetoId);
            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }
            if(projeto.concluido){
                return res.status(403).json({ erro: "Uma tarefa não pode ser adicionada a um projeto concluído" });
            }

            const tarefa = await Tarefa.create({
                nome: req.body.nome,
                descricao: req.body.descricao,
                concluido: req.body.concluido || false,
                projeto: projetoId,
                usuario: usuarioId
            });

            return res.status(201).json(tarefa);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao criar tarefa" });
        }
    },

    async listar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const filtro = { usuario: usuarioId }; 

            if (req.query.concluido !== undefined) {
                filtro.concluido = req.query.concluido === "true";
            }

            if (req.query.projetoId) {
                const projeto = await Projeto.findById(req.query.projetoId);

                if (!projeto) {
                    return res.status(404).json({ erro: "Projeto não encontrado" });
                }

                if (projeto.usuario.toString() !== usuarioId) {
                    return res.status(403).json({ erro: "Acesso negado" });
                }

                filtro.projeto = req.query.projetoId;
            }

            const tarefas = await Tarefa.find(filtro);

            res.json(tarefas);

        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    },

    async listarPorIdProjeto(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const projetoId = req.query.projetoId;

            const projeto = await Projeto.findById(projetoId);

            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            const tarefas = await Tarefa.find({
                projeto: projetoId,
                usuario: usuarioId  
            }).sort({ createdAt: -1 });

            res.json(tarefas);

        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    },

    async buscarPorId(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const tarefa = await Tarefa.findById(req.params.id);

            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const projeto = await Projeto.findById(tarefa.projeto);

            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            res.json(tarefa);

        } catch (error) {
            res.status(400).json({ erro: "ID inválido" });
        }
    },

    async atualizar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const id = req.params.id;

            let tarefa = await Tarefa.findById(id);
            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const projeto = await Projeto.findById(tarefa.projeto);
            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            tarefa = await Tarefa.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            res.json(tarefa);

        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    },

    async deletar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const tarefa = await Tarefa.findById(req.params.id);

            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const projeto = await Projeto.findById(tarefa.projeto);
            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            await tarefa.deleteOne();

            res.json({ mensagem: "Tarefa deletada com sucesso" });

        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    },

    async concluir(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const id = req.params.id;

            let tarefa = await Tarefa.findById(id);

            if (!tarefa) {
                return res.status(404).json({ erro: "Tarefa não encontrada" });
            }

            const projeto = await Projeto.findById(tarefa.projeto);

            if (projeto.usuario.toString() !== usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            tarefa.concluido = true;
            await tarefa.save();

            return res.status(200).json(tarefa);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao concluir tarefa" });
        }
    },

    async listarPendentesPorUsuario(req, res) {
        try {
            const usuarioId = req.usuarioId; 

            const tarefas = await Tarefa.find({ 
                usuario: usuarioId, 
                concluido: false 
            }).populate('projeto', 'nome');

            return res.json(tarefas);

        } catch (error) {
            console.error("Erro no Controller de tarefas:", error);
            return res.status(500).json({ error: 'Erro ao buscar tarefas do usuário.' });
        }
    }
};
