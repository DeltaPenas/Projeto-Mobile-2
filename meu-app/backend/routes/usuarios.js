const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');
const auth = require('../middleware/auth');

router.post('/', usuarioController.criar);
router.get('/',auth, usuarioController.listar);
router.get('/me', auth,usuarioController.getDadosUsuario);
router.get('/:id',auth, usuarioController.buscarPorId);
router.put('/:id',auth, usuarioController.atualizar);
router.delete('/:id',auth, usuarioController.deletar);
router.post('/login', usuarioController.login);
router.post("/recuperar", usuarioController.recuperarSenha);

module.exports = router;