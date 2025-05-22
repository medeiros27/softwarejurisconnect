require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Conexão com MongoDB
connectDB();

// Rotas
const userRoutes = require('./routes/user');
app.use('/api/usuarios', userRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.send('API online!');
});

// Porta
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});