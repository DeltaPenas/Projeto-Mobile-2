const Usuario = require('../models/Usuario');

module.exports = {

    async criar(req, res){
        try{
            const usuario = await Usuario.create(req.body);
            res.status(201).json(usuario);
        } catch (err){
            res.status(400).json({erro: err.message})
        }
    },
    async listar(req, res){
        try{
            const usuarios = await Usuario.find();
            res.json(usuarios)
        } catch(err){
            res.status(500).json({erro: err.message})
        }
    },
    async buscarPorId(req, res){
        try{
            const usuario = await Usuario.findById(req.params.id);
            if(!usuario){
                return res.status(404).json({ erro: "Usuário não encontrado dog" });
            }
            res.json(usuario);
        }catch(err){
        res.status(400).json({erro: "id invalido dog"})
        }
    },
    async atualizar(req, res){
        try{
            const usuario = await Usuario.findByIdAndUpdate(
                req.params.id,
                req.body,
                {new: true, runValidators: true}
            );
            if(!usuario){
                return res.status(404).json({erro: "Usuario não encontrado dog"});
            }
            res.json(usuario);

        }catch(err){
            res.status(400).json({ erro: err.message });
        }
    },
    async deletar(req, res){
        try{
            const usuario = Usuario.findByIdAndDelete(req.params.id);
            if(!usuario){
                return res.status(404).json({erro: "usuario não encontrado dog"});

            }
            res.json({mensagem: "usuario deletado dog"});
        }catch(err){
            res.status(400).json({erro: err.message});
        }
    } 
}