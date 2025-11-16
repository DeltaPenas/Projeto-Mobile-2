const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

module.exports = {

    async criar(req, res){
        try{
            if (!req.body.nome || !req.body.email || !req.body.senha)  {
            return res.status(400).json({ erro: "usuarioId é obrigatório" });
            }

            const usuario = await Usuario.create({
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha

            })
            res.status(201).json(usuario);
        } catch (err){
            if (err.code === 11000) {
                 return res.status(400).json({ erro: 'Email já cadastrado' });
            }
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
                return res.status(404).json({ erro: "Usuário não encontrado" });
            }
            res.json(usuario);
        }catch(err){
        res.status(400).json({erro: "id invalido"})
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
                return res.status(404).json({erro: "Usuario não encontrado"});
            }
            res.json(usuario);

        }catch(err){
            res.status(400).json({ erro: err.message });
        }
    },
    async deletar(req, res){
        try{
            const usuario = await Usuario.findByIdAndDelete(req.params.id);
            if(!usuario){
                return res.status(404).json({erro: "usuario não encontrado"});

            }
            res.json({mensagem: "usuario deletado"});
        }catch(err){
            res.status(400).json({erro: err.message});
        }
    },
    async login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(400).json({ erro: 'Usuário não encontrado' });
        }

        const senhaValida = await usuario.compararSenha(senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha inválida!' });
        }

        const payload = { id: usuario._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.json({
            message: 'Login bem-sucedido',
            token,
            usuario: usuario.toJSON()
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ erro: err.message });
    }
}
}