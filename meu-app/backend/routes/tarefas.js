const express = require('express');
const router = express.Router();
const tarefaController = require('../controller/tarefaController');
const auth = require('../middleware/auth');

router.post('/', auth, tarefaController.criar);
router.get('/', auth, tarefaController.listar);
router.get('/projeto', auth, tarefaController.listarPorIdProjeto);
router.get('/:id', auth, tarefaController.buscarPorId);
router.put('/:id', auth, tarefaController.atualizar);
router.put('/concluir/:id', auth, tarefaController.concluir);
router.delete('/:id', auth, tarefaController.deletar);


module.exports = router;