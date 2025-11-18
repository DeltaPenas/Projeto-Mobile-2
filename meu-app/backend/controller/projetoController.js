const Projeto = require('../models/Projeto');

module.exports = {

    async criar(req, res) {
        try {
            const usuarioId = req.usuarioId;

            const projeto = await Projeto.create({
                nome: req.body.nome,
                descricao: req.body.descricao,
                concluido: req.body.concluido || false,
                usuario: usuarioId
            });

            return res.status(201).json(projeto);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao criar o projeto" });
        }
    },

    // 🔥 Lista apenas os projetos do usuário logado
    async listar(req, res) {
        try {
            const usuarioId = req.usuarioId;
            const filtro = { usuario: usuarioId };

            // Filtro opcional (ex: ?concluido=true)
            if (req.query.concluido !== undefined) {
                filtro.concluido = req.query.concluido === "true";
            }

            const projetos = await Projeto.find(filtro);
            res.json(projetos);

        } catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },

    // 🔥 Rota dedicada para retornar projetos do usuário logado
    async listarPorUsuarioLogado(req, res) {
        try {
            const usuarioId = req.usuarioId;

            const projetos = await Projeto.find({ usuario: usuarioId })
                .sort({ createdAt: -1 });

            return res.json(projetos);

        } catch (err) {
            res.status(500).json({ erro: err.message });
        }
    },


    async buscarPorId(req, res) {
        try {
            const projeto = await Projeto.findById(req.params.id);

            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== req.usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            res.json(projeto);

        } catch (err) {
            res.status(400).json({ erro: "ID inválido" });
        }
    },

    async atualizar(req, res) {
        try {
            const id = req.params.id;

            let projeto = await Projeto.findById(id);

            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== req.usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            projeto = await Projeto.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            res.json(projeto);

        } catch (err) {
            res.status(400).json({ erro: err.message });
        }
    },

    async deletar(req, res) {
        try {
            const projeto = await Projeto.findById(req.params.id);

            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== req.usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            await projeto.deleteOne();

            res.json({ mensagem: "Projeto deletado com sucesso" });

        } catch (err) {
            res.status(400).json({ erro: err.message });
        }
    },

    async concluir(req, res) {
        try {
            const id = req.params.id;

            let projeto = await Projeto.findById(id);

            if (!projeto) {
                return res.status(404).json({ erro: "Projeto não encontrado" });
            }

            if (projeto.usuario.toString() !== req.usuarioId) {
                return res.status(403).json({ erro: "Acesso negado" });
            }

            projeto.concluido = true;
            await projeto.save();

            return res.status(200).json(projeto);

        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro ao concluir projeto" });
        }
    }
};
