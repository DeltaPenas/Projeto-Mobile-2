const express = require('express');
const router = express.Router();
const projetoController = require('../controller/projetoController');
const auth = require('../middleware/auth');

router.post('/', auth, projetoController.criar);
router.get('/', auth, projetoController.listar);
router.get('/usuario', auth, projetoController.listarPorUsuarioLogado);
router.get('/:id', auth, projetoController.buscarPorId);
router.put('/:id', auth, projetoController.atualizar);
router.put('/concluir/:id', auth, projetoController.concluir);
router.delete('/:id', auth, projetoController.deletar);

module.exports = router;