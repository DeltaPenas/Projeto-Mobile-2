const express = require('express');
const router = express.Router();
const usuarioController = require('../controller/usuarioController');

router.post('/', usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.put('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.deletar);

module.exports = router;