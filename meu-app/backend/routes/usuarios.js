const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

router.post('/', usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/', usuarioController.buscarPorId);
router.put('/', usuarioController.atualizar);
router.delete('/', usuarioController.deletar);

module.exports = router;