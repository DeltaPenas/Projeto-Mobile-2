const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const resetTokens = require("../helpers/resetTokens");

const CODE_EXPIRATION_MINUTES = parseInt(process.env.CODE_EXPIRATION_MINUTES || '10', 10);
console.log("RESET TOKENS DO CONTROLLER:", resetTokens);

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
            res.status(400).json({erro: err.message});
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
        } catch(err){
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
        } catch(err){
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
        } catch(err){
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
        try {
            const userId = req.usuarioId;
            const usuario = await Usuario.findById(userId).select('-senha');
            
            if(!usuario){
                return res.status(404).json({erro: "Usuario não encontrado"});
            }

            return res.status(200).json(usuario);

        } catch(error){
            res.status(500).json({erro : "Erro ao buscar os dados do usuario"});
        }
    },

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

            // Gera código de 6 dígitos
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();

            resetTokens.set(email, {
                codigo,
                expira: Date.now() + CODE_EXPIRATION_MINUTES * 60000,
                validated: false
            });

            console.log("Código salvo:", resetTokens.get(email)); // DEBUG IMPORTANTE!!!

            const transporter = nodemailer.createTransport({
                service: process.env.MAIL_SERVICE,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS
                }
            });

            await transporter.sendMail({
                from: "Projeto Mobile <no-reply@seuapp.com>",
                to: email,
                subject: "Código de recuperação de senha",
                html: `
                    <h2>Recuperação de senha</h2>
                    <p>Use o código abaixo para redefinir sua senha:</p>
                    <h1>${codigo}</h1>
                    <p>O código expira em 10 minutos.</p>
                `
            });

            return res.json({ message: "Código enviado para o e-mail informado." });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao enviar código." });
        }
    },


    async validarCodigo(req, res) {
        const { email, codigo } = req.body;

        if (!email || !codigo) {
            return res.status(400).json({ message: "Dados incompletos." });
        }

        const registro = resetTokens.get(email);

        console.log("🔎 Registro encontrado:", registro); // DEBUG

        if (!registro) {
            return res.status(400).json({ message: "Nenhum código gerado para este e-mail." });
        }

        if (Date.now() > registro.expira) {
            resetTokens.delete(email);
            return res.status(400).json({ message: "Código expirado." });
        }

        if (registro.codigo !== codigo.toString()) {
            return res.status(400).json({ message: "Código incorreto." });
        }

        // Marca como validado
        resetTokens.set(email, { ...registro, validated: true });

        return res.json({ message: "Código validado com sucesso." });
    },


    async resetarSenha(req, res) {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({ message: "Dados incompletos." });
        }

        const registro = resetTokens.get(email);

        if (!registro || !registro.validated) {
            return res.status(400).json({ message: "Código não validado." });
        }

        try {
            const usuario = await Usuario.findOne({ email });

            if (!usuario) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            usuario.senha = novaSenha;
            await usuario.save();

            resetTokens.delete(email);

            return res.json({ message: "Senha redefinida com sucesso!" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao redefinir senha." });
        }
    }

};