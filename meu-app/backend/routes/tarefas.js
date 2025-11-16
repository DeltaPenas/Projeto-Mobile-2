const express = require('express');
const router = express.Router();
const tarefaController = require('../controller/tarefaController');
const auth = require('../middleware/auth');

router.post('/', tarefaController.criar);
router.get('/', tarefaController.listarPorIdProjeto);
router.get('/:id', tarefaController.buscarPorId);
router.put('/:id', tarefaController.atualizar);
router.delete('/:id', tarefaController.deletar);


module.exports = router;