const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas!'))
  .catch(err => console.error('Erro ao conectar:', err));


app.get('/', (req, res) => {
  res.send('server e banco rodando');
});

const usuariosRouter = require('./routes/usuarios');
app.use('/usuarios', usuariosRouter);
const projetosRouter = require('./routes/projetos');
app.use('/projetos', projetosRouter )
const tarefasRouter = require('./routes/tarefas');
app.use('/tarefas', tarefasRouter)


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));