/**
 * server.js - Arquivo principal do servidor do Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo configura e inicia o servidor Express, carrega middlewares,
 * conecta ao banco de dados e registra as rotas da API.
 */

// Importação de dependências
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/database');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o aplicativo Express
const app = express();

// Conecta ao banco de dados
connectDB();

// Configuração de middlewares
app.use(helmet()); // Segurança
app.use(cors()); // Permite requisições cross-origin
app.use(express.json()); // Parse de JSON
app.use(express.urlencoded({ extended: true })); // Parse de URL-encoded
app.use(morgan('dev')); // Logging de requisições

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Definição das rotas da API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/correspondents', require('./routes/correspondentRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Rota para verificar status da API
app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date()
  });
});

// Rota para servir o frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use(errorHandler);

// Definição da porta
const PORT = process.env.PORT || 5000;

// Inicia o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando em ${process.env.NODE_ENV} na porta ${PORT}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error(`Erro não tratado: ${err.message}`);
  // Fecha o servidor e encerra o processo
  server.close(() => process.exit(1));
});

module.exports = server; // Exporta para testes
