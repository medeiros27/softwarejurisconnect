const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');

// Carrega variáveis de ambiente do .env
dotenv.config();

const app = express();

// Middleware para arquivos estáticos (logo, etc.)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware global CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Middleware para ler JSON
app.use(express.json());

// Sessão armazenada no MongoDB
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'minha_sessao_secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
      sameSite: 'lax',
      secure: false, // true apenas se https
    },
  })
);

// Conexão com MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Rotas de autenticação
app.use('/api/auth', require('./routes/authRoutes'));

// Rotas de empresas
app.use('/api/companies', require('./routes/companyRoutes'));

// Rotas de correspondentes
app.use('/api/correspondents', require('./routes/correspondentRoutes'));

// Rotas de solicitações de serviço
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});