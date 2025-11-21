const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Armazena temporariamente os tokens de redefinição 
let resetTokens = {};

module.exports = {

    async criar(req, res){
        try{
            if (!req.body.nome || !req.body.email || !req.body.senha)  {
            return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });
            }

            const usuario = await Usuario.create({
                nome: req.body.nome,
                email: req.body.email,
                senha: req.body.senha
            });

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
            res.json(usuarios);
        } catch(err){
            res.status(500).json({erro: err.message});
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
        res.status(400).json({erro: "id invalido"});
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
    },

    async getDadosUsuario(req, res){
        try{
            const userId = req.usuarioId;
            const usuario = await Usuario.findById(userId).select('-senha');
            
            if(!usuario){
                return res.status(404).json({erro: "Usuario não encontrado"});
            }
            return res.status(200).json(usuario);

        }catch(error){
            res.status(500).json({erro : "Erro ao buscar os dados do usuario"});
        }
    },

    //Recuperar senha

    async recuperarSenha(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "E-mail é obrigatório." });
        }

        try {
            const usuario = await Usuario.findOne({ email });

            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            // Gera token seguro
            const token = crypto.randomBytes(32).toString("hex");

            // Salva temporário
            resetTokens[email] = token;

            const link = `http://localhost:3001/resetar-senha?email=${email}&token=${token}`;

            // Configura nodemailer
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "SEU_EMAIL@gmail.com",
                    pass: "SENHA_DO_APP"
                }
            });

            await transporter.sendMail({
                from: "Seu App <no-reply@seuapp.com>",
                to: email,
                subject: "Recuperação de senha",
                html: `
                <h2>Recuperar Senha</h2>
                <p>Clique no link abaixo para redefinir sua senha:</p>
                <a href="${link}">${link}</a>
                `
            });

            res.json({ message: "Um link de recuperação foi enviado ao seu e-mail." });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao enviar e-mail." });
        }
    },

    //Resetar senha 

    async resetarSenha(req, res) {
        const { email, token, novaSenha } = req.body;

        if (!email || !token || !novaSenha) {
            return res.status(400).json({ message: "Dados incompletos." });
        }

        // Confere token
        if (resetTokens[email] !== token) {
            return res.status(400).json({ message: "Token inválido ou expirado." });
        }

        try {
            // Atualiza a senha no banco
            const usuario = await Usuario.findOne({ email });

            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            usuario.senha = novaSenha;
            await usuario.save();

            // Remove token usado
            delete resetTokens[email];

            res.json({ message: "Senha redefinida com sucesso!" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao redefinir senha." });
        }
    }
};
