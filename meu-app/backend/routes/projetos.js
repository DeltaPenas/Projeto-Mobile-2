const express = require('express');
const router = express.Router();
const projetoController = require('../controller/projetoController');
const auth = require('../middleware/auth');

router.post('/', auth, projetoController.criar);
router.get('/', auth, projetoController.listarPorIdUsuario);
router.get('/:id', auth, projetoController.buscarPorId);
router.put('/:id', auth, projetoController.atualizar);
router.delete('/:id', auth, projetoController.deletar);




module.exports = router;