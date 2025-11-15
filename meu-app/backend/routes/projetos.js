const express = require('express');
const router = express.Router();
const projetoController = require('../controller/projetoController');

router.post('/', projetoController.criar);
router.get('/', projetoController.listarPorIdUsuario);
router.get('/:id', projetoController.buscarPorId);
router.put('/:id', projetoController.atualizar);
router.delete('/:id',projetoController.deletar);




module.exports = router;