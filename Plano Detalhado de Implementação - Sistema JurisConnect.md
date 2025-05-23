# Plano Detalhado de Implementação - Sistema JurisConnect

Este documento fornece instruções passo a passo para implementar todas as funcionalidades pendentes e corrigir os links inoperantes no Sistema JurisConnect. O plano está organizado por componentes e inclui exemplos de código para facilitar a implementação.

## Índice

1. [Configuração do Ambiente](#1-configuração-do-ambiente)
2. [Backend - Configuração do MongoDB](#2-backend---configuração-do-mongodb)
3. [Backend - Sistema de Autenticação](#3-backend---sistema-de-autenticação)
4. [Backend - APIs de Gestão](#4-backend---apis-de-gestão)
5. [Frontend - Componentes de Interface](#5-frontend---componentes-de-interface)
6. [Frontend - Sistema de Rotas](#6-frontend---sistema-de-rotas)
7. [Frontend - Integração com Backend](#7-frontend---integração-com-backend)
8. [Implementação dos Logotipos](#8-implementação-dos-logotipos)
9. [Correção de Links](#9-correção-de-links)
10. [Testes e Validação](#10-testes-e-validação)

## 1. Configuração do Ambiente

### 1.1. Configuração do Backend

1. Navegue até a pasta do backend:
   ```bash
   cd /caminho/para/softwarejurisconnect/backend
   ```

2. Instale as dependências necessárias:
   ```bash
   npm install express mongoose jsonwebtoken bcryptjs cors dotenv morgan helmet
   ```

3. Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jurisconnect
   JWT_SECRET=sua_chave_secreta_aqui
   JWT_EXPIRE=30d
   ```

### 1.2. Configuração do Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd /caminho/para/softwarejurisconnect/jurisconnect-frontend
   ```

2. Instale as dependências necessárias:
   ```bash
   npm install react-router-dom axios formik yup react-toastify
   ```

3. Atualize o arquivo `src/config.js` com a URL da API:
   ```javascript
   export const API_URL = 'http://localhost:5000/api';
   ```

## 2. Backend - Configuração do MongoDB

### 2.1. Configuração da Conexão

1. Edite o arquivo `database.js` na pasta `backend/config`:

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 2.2. Modelos de Dados

1. Crie/atualize o modelo de Usuário em `models/User.js`:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, adicione um nome']
  },
  email: {
    type: String,
    required: [true, 'Por favor, adicione um email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, adicione um email válido'
    ]
  },
  role: {
    type: String,
    enum: ['admin', 'company', 'correspondent'],
    default: 'company'
  },
  password: {
    type: String,
    required: [true, 'Por favor, adicione uma senha'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Criptografar senha usando bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Assinar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Verificar senha
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

2. Crie/atualize o modelo de Empresa em `models/Company.js`:

```javascript
const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Por favor, adicione um nome']
  },
  cnpj: {
    type: String,
    required: [true, 'Por favor, adicione um CNPJ'],
    unique: true,
    match: [
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
      'Por favor, adicione um CNPJ válido'
    ]
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  contactName: String,
  contactPhone: String,
  contactEmail: String,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', CompanySchema);
```

3. Crie/atualize o modelo de Correspondente em `models/Correspondent.js`:

```javascript
const mongoose = require('mongoose');

const CorrespondentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Por favor, adicione um nome']
  },
  document: {
    type: String,
    required: [true, 'Por favor, adicione um CPF ou OAB'],
    unique: true
  },
  documentType: {
    type: String,
    enum: ['cpf', 'oab'],
    required: true
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  phone: String,
  email: String,
  specialties: [String],
  areas: [String],
  bankInfo: {
    bank: String,
    agency: String,
    account: String,
    accountType: String
  },
  active: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Correspondent', CorrespondentSchema);
```

4. Crie/atualize o modelo de Solicitação de Serviço em `models/ServiceRequest.js`:

```javascript
const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  correspondent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Correspondent'
  },
  title: {
    type: String,
    required: [true, 'Por favor, adicione um título']
  },
  description: {
    type: String,
    required: [true, 'Por favor, adicione uma descrição']
  },
  type: {
    type: String,
    enum: ['audiencia', 'diligencia', 'protocolo', 'copia', 'outro'],
    required: true
  },
  location: {
    city: String,
    state: String,
    address: String
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'atribuido', 'em_andamento', 'concluido', 'cancelado'],
    default: 'pendente'
  },
  companyValue: {
    type: Number,
    required: true
  },
  correspondentValue: {
    type: Number
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
```

## 3. Backend - Sistema de Autenticação

### 3.1. Middleware de Autenticação

1. Atualize o arquivo `middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Proteger rotas
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extrair token do Bearer
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Extrair token do cookie
    token = req.cookies.token;
  }

  // Verificar se o token existe
  if (!token) {
    return next(new ErrorResponse('Não autorizado para acessar esta rota', 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Não autorizado para acessar esta rota', 401));
  }
});

// Conceder acesso a roles específicas
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Usuário com papel ${req.user.role} não está autorizado a acessar esta rota`,
          403
        )
      );
    }
    next();
  };
};
```

2. Crie o arquivo `middleware/async.js`:

```javascript
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```

3. Crie o arquivo `middleware/errorHandler.js`:

```javascript
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para o console para desenvolvimento
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Recurso não encontrado`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Valor duplicado inserido';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro do servidor'
  });
};

module.exports = errorHandler;
```

4. Crie o arquivo `utils/errorResponse.js`:

```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
```

### 3.2. Controlador de Autenticação

1. Atualize o arquivo `controllers/authController.js`:

```javascript
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Criar usuário
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email e senha
  if (!email || !password) {
    return next(new ErrorResponse('Por favor, forneça um email e senha', 400));
  }

  // Verificar usuário
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  // Verificar se a senha corresponde
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout de usuário / limpar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// Função auxiliar para enviar token de resposta
const sendTokenResponse = (user, statusCode, res) => {
  // Criar token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
```

### 3.3. Rotas de Autenticação

1. Atualize o arquivo `routes/authRoutes.js`:

```javascript
const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
```

## 4. Backend - APIs de Gestão

### 4.1. Controlador de Empresas

1. Crie/atualize o arquivo `controllers/companyController.js`:

```javascript
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Company = require('../models/Company');

// @desc    Obter todas as empresas
// @route   GET /api/companies
// @access  Private/Admin
exports.getCompanies = asyncHandler(async (req, res, next) => {
  const companies = await Company.find();

  res.status(200).json({
    success: true,
    count: companies.length,
    data: companies
  });
});

// @desc    Obter uma empresa
// @route   GET /api/companies/:id
// @access  Private/Admin
exports.getCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Empresa não encontrada com id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Criar empresa
// @route   POST /api/companies
// @access  Private/Admin
exports.createCompany = asyncHandler(async (req, res, next) => {
  // Adicionar usuário ao corpo da requisição
  req.body.user = req.user.id;

  const company = await Company.create(req.body);

  res.status(201).json({
    success: true,
    data: company
  });
});

// @desc    Atualizar empresa
// @route   PUT /api/companies/:id
// @access  Private/Admin
exports.updateCompany = asyncHandler(async (req, res, next) => {
  let company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Empresa não encontrada com id ${req.params.id}`, 404)
    );
  }

  company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: company
  });
});

// @desc    Excluir empresa
// @route   DELETE /api/companies/:id
// @access  Private/Admin
exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    return next(
      new ErrorResponse(`Empresa não encontrada com id ${req.params.id}`, 404)
    );
  }

  await company.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
```

2. Crie/atualize o arquivo `routes/companyRoutes.js`:

```javascript
const express = require('express');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin'), getCompanies)
  .post(protect, authorize('admin'), createCompany);

router
  .route('/:id')
  .get(protect, authorize('admin'), getCompany)
  .put(protect, authorize('admin'), updateCompany)
  .delete(protect, authorize('admin'), deleteCompany);

module.exports = router;
```

### 4.2. Controlador de Correspondentes

1. Crie/atualize o arquivo `controllers/correspondentController.js`:

```javascript
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Correspondent = require('../models/Correspondent');

// @desc    Obter todos os correspondentes
// @route   GET /api/correspondents
// @access  Private/Admin
exports.getCorrespondents = asyncHandler(async (req, res, next) => {
  const correspondents = await Correspondent.find();

  res.status(200).json({
    success: true,
    count: correspondents.length,
    data: correspondents
  });
});

// @desc    Obter um correspondente
// @route   GET /api/correspondents/:id
// @access  Private/Admin
exports.getCorrespondent = asyncHandler(async (req, res, next) => {
  const correspondent = await Correspondent.findById(req.params.id);

  if (!correspondent) {
    return next(
      new ErrorResponse(`Correspondente não encontrado com id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: correspondent
  });
});

// @desc    Criar correspondente
// @route   POST /api/correspondents
// @access  Private/Admin
exports.createCorrespondent = asyncHandler(async (req, res, next) => {
  // Adicionar usuário ao corpo da requisição
  req.body.user = req.user.id;

  const correspondent = await Correspondent.create(req.body);

  res.status(201).json({
    success: true,
    data: correspondent
  });
});

// @desc    Atualizar correspondente
// @route   PUT /api/correspondents/:id
// @access  Private/Admin
exports.updateCorrespondent = asyncHandler(async (req, res, next) => {
  let correspondent = await Correspondent.findById(req.params.id);

  if (!correspondent) {
    return next(
      new ErrorResponse(`Correspondente não encontrado com id ${req.params.id}`, 404)
    );
  }

  correspondent = await Correspondent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: correspondent
  });
});

// @desc    Excluir correspondente
// @route   DELETE /api/correspondents/:id
// @access  Private/Admin
exports.deleteCorrespondent = asyncHandler(async (req, res, next) => {
  const correspondent = await Correspondent.findById(req.params.id);

  if (!correspondent) {
    return next(
      new ErrorResponse(`Correspondente não encontrado com id ${req.params.id}`, 404)
    );
  }

  await correspondent.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
```

2. Crie/atualize o arquivo `routes/correspondentRoutes.js`:

```javascript
const express = require('express');
const {
  getCorrespondents,
  getCorrespondent,
  createCorrespondent,
  updateCorrespondent,
  deleteCorrespondent
} = require('../controllers/correspondentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin'), getCorrespondents)
  .post(protect, authorize('admin'), createCorrespondent);

router
  .route('/:id')
  .get(protect, authorize('admin'), getCorrespondent)
  .put(protect, authorize('admin'), updateCorrespondent)
  .delete(protect, authorize('admin'), deleteCorrespondent);

module.exports = router;
```

### 4.3. Controlador de Solicitações de Serviço

1. Crie/atualize o arquivo `controllers/serviceRequestController.js`:

```javascript
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const ServiceRequest = require('../models/ServiceRequest');
const Company = require('../models/Company');
const Correspondent = require('../models/Correspondent');

// @desc    Obter todas as solicitações de serviço
// @route   GET /api/services
// @access  Private
exports.getServiceRequests = asyncHandler(async (req, res, next) => {
  let query;

  // Cópia dos parâmetros de consulta
  const reqQuery = { ...req.query };

  // Campos para excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Remover campos
  removeFields.forEach(param => delete reqQuery[param]);

  // Criar string de consulta
  let queryStr = JSON.stringify(reqQuery);

  // Criar operadores ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Encontrar recursos
  if (req.user.role === 'admin') {
    // Administradores podem ver todas as solicitações
    query = ServiceRequest.find(JSON.parse(queryStr));
  } else if (req.user.role === 'company') {
    // Empresas só podem ver suas próprias solicitações
    const company = await Company.findOne({ user: req.user.id });
    
    if (!company) {
      return next(
        new ErrorResponse(`Nenhuma empresa encontrada para este usuário`, 404)
      );
    }
    
    query = ServiceRequest.find({ 
      ...JSON.parse(queryStr),
      company: company._id 
    });
  } else if (req.user.role === 'correspondent') {
    // Correspondentes só podem ver solicitações atribuídas a eles
    const correspondent = await Correspondent.findOne({ user: req.user.id });
    
    if (!correspondent) {
      return next(
        new ErrorResponse(`Nenhum correspondente encontrado para este usuário`, 404)
      );
    }
    
    query = ServiceRequest.find({ 
      ...JSON.parse(queryStr),
      correspondent: correspondent._id 
    });
  }

  // Seleção de campos
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Ordenação
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Paginação
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await ServiceRequest.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executar consulta
  const serviceRequests = await query;

  // Resposta de paginação
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: serviceRequests.length,
    pagination,
    data: serviceRequests
  });
});

// @desc    Obter uma solicitação de serviço
// @route   GET /api/services/:id
// @access  Private
exports.getServiceRequest = asyncHandler(async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(
      new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para ver esta solicitação
  if (req.user.role !== 'admin') {
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company.toString() !== company._id.toString()) {
        return next(
          new ErrorResponse(`Não autorizado a acessar esta solicitação`, 403)
        );
      }
    } else if (req.user.role === 'correspondent') {
      const correspondent = await Correspondent.findOne({ user: req.user.id });
      
      if (!correspondent || 
          (serviceRequest.correspondent && 
           serviceRequest.correspondent.toString() !== correspondent._id.toString())) {
        return next(
          new ErrorResponse(`Não autorizado a acessar esta solicitação`, 403)
        );
      }
    }
  }

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

// @desc    Criar solicitação de serviço
// @route   POST /api/services
// @access  Private/Company
exports.createServiceRequest = asyncHandler(async (req, res, next) => {
  // Verificar se o usuário é uma empresa
  if (req.user.role !== 'company' && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a criar solicitações`, 403)
    );
  }

  // Se for uma empresa, obter o ID da empresa
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user.id });
    
    if (!company) {
      return next(
        new ErrorResponse(`Nenhuma empresa encontrada para este usuário`, 404)
      );
    }
    
    // Adicionar empresa ao corpo da requisição
    req.body.company = company._id;
  }

  const serviceRequest = await ServiceRequest.create(req.body);

  res.status(201).json({
    success: true,
    data: serviceRequest
  });
});

// @desc    Atualizar solicitação de serviço
// @route   PUT /api/services/:id
// @access  Private
exports.updateServiceRequest = asyncHandler(async (req, res, next) => {
  let serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(
      new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para atualizar esta solicitação
  if (req.user.role !== 'admin') {
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company.toString() !== company._id.toString()) {
        return next(
          new ErrorResponse(`Não autorizado a atualizar esta solicitação`, 403)
        );
      }
    } else if (req.user.role === 'correspondent') {
      const correspondent = await Correspondent.findOne({ user: req.user.id });
      
      if (!correspondent || 
          (serviceRequest.correspondent && 
           serviceRequest.correspondent.toString() !== correspondent._id.toString())) {
        return next(
          new ErrorResponse(`Não autorizado a atualizar esta solicitação`, 403)
        );
      }
      
      // Correspondentes só podem atualizar o status
      const allowedUpdates = ['status'];
      const requestedUpdates = Object.keys(req.body);
      
      const isValidOperation = requestedUpdates.every(update => 
        allowedUpdates.includes(update)
      );
      
      if (!isValidOperation) {
        return next(
          new ErrorResponse(`Correspondentes só podem atualizar o status`, 400)
        );
      }
    }
  }

  serviceRequest = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

// @desc    Excluir solicitação de serviço
// @route   DELETE /api/services/:id
// @access  Private/Admin/Company
exports.deleteServiceRequest = asyncHandler(async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(
      new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário tem permissão para excluir esta solicitação
  if (req.user.role !== 'admin') {
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company.toString() !== company._id.toString()) {
        return next(
          new ErrorResponse(`Não autorizado a excluir esta solicitação`, 403)
        );
      }
    } else {
      return next(
        new ErrorResponse(`Usuário não autorizado a excluir solicitações`, 403)
      );
    }
  }

  await serviceRequest.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Atribuir correspondente a uma solicitação
// @route   PUT /api/services/:id/assign
// @access  Private/Admin
exports.assignCorrespondent = asyncHandler(async (req, res, next) => {
  const { correspondentId, correspondentValue } = req.body;

  if (!correspondentId || !correspondentValue) {
    return next(
      new ErrorResponse(`Por favor, forneça o ID do correspondente e o valor`, 400)
    );
  }

  let serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(
      new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404)
    );
  }

  // Verificar se o usuário é um administrador
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Usuário não autorizado a atribuir correspondentes`, 403)
    );
  }

  // Verificar se o correspondente existe
  const correspondent = await Correspondent.findById(correspondentId);

  if (!correspondent) {
    return next(
      new ErrorResponse(`Correspondente não encontrado com id ${correspondentId}`, 404)
    );
  }

  // Atualizar a solicitação
  serviceRequest = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    {
      correspondent: correspondentId,
      correspondentValue,
      status: 'atribuido'
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});
```

2. Crie/atualize o arquivo `routes/serviceRequestRoutes.js`:

```javascript
const express = require('express');
const {
  getServiceRequests,
  getServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  deleteServiceRequest,
  assignCorrespondent
} = require('../controllers/serviceRequestController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getServiceRequests)
  .post(protect, authorize('company', 'admin'), createServiceRequest);

router
  .route('/:id')
  .get(protect, getServiceRequest)
  .put(protect, updateServiceRequest)
  .delete(protect, authorize('company', 'admin'), deleteServiceRequest);

router
  .route('/:id/assign')
  .put(protect, authorize('admin'), assignCorrespondent);

module.exports = router;
```

## 5. Frontend - Componentes de Interface

### 5.1. Componente de Login

1. Atualize o arquivo `jurisconnect-frontend/src/components/Login.js`:

```jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import logo from "../logo-v1-dark.png";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const resp = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await resp.json();

      if (resp.ok) {
        onLogin(data); // Salva token, usuário etc
        navigate("/dashboard");
      } else {
        setErro(data.msg || "Login inválido");
      }
    } catch (err) {
      setErro("Erro na conexão com o servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="JurisConnect Logo" className="login-logo" />
          <h2>Login</h2>
        </div>
        
        {erro && <div className="alert alert-danger">{erro}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="form-control"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            Entrar
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Não tem uma conta? <Link to="/register">Registre-se</Link>
          </p>
          <p>
            <Link to="/forgot-password">Esqueceu sua senha?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

### 5.2. Componente de Registro

1. Atualize o arquivo `jurisconnect-frontend/src/components/Register.js`:

```jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import logo from "../logo-v1-dark.png";

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    tipo: "empresa", // empresa ou correspondente
  });
  
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const { nome, email, senha, confirmarSenha, tipo } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    // Validar senha
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/usuarios/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          tipo,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        onLogin(data); // Salva token, usuário etc
        navigate("/complete-profile");
      } else {
        setErro(data.msg || "Erro ao registrar");
      }
    } catch (err) {
      setErro("Erro na conexão com o servidor");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={logo} alt="JurisConnect Logo" className="register-logo" />
          <h2>Cadastro</h2>
        </div>
        
        {erro && <div className="alert alert-danger">{erro}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={nome}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={senha}
              onChange={handleChange}
              required
              minLength="6"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              name="confirmarSenha"
              value={confirmarSenha}
              onChange={handleChange}
              required
              minLength="6"
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Tipo de Conta</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="tipo"
                  value="empresa"
                  checked={tipo === "empresa"}
                  onChange={handleChange}
                />
                Empresa
              </label>
              <label>
                <input
                  type="radio"
                  name="tipo"
                  value="correspondente"
                  checked={tipo === "correspondente"}
                  onChange={handleChange}
                />
                Correspondente Jurídico
              </label>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            Cadastrar
          </button>
        </form>
        
        <div className="register-footer">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
```

### 5.3. Componente de Header

1. Atualize o arquivo `jurisconnect-frontend/src/components/Header.js`:

```jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo-v2-light.png";

const Header = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="JurisConnect" />
            </Link>
          </div>

          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">Início</Link>
              </li>
              <li>
                <Link to="/sobre">Sobre</Link>
              </li>
              <li>
                <Link to="/servicos">Serviços</Link>
              </li>
              <li>
                <Link to="/contato">Contato</Link>
              </li>
            </ul>
          </nav>

          <div className="auth-buttons">
            {isAuthenticated ? (
              <>
                <div className="user-menu">
                  <span className="user-name">Olá, {user.nome}</span>
                  <div className="dropdown-menu">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/perfil">Meu Perfil</Link>
                    {user.tipo === "admin" && (
                      <Link to="/admin">Administração</Link>
                    )}
                    <button onClick={handleLogout}>Sair</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### 5.4. Componente de Footer

1. Atualize o arquivo `jurisconnect-frontend/src/components/Footer.js`:

```jsx
import React from "react";
import { Link } from "react-router-dom";
import logo from "../logo-v1-dark.png";
import logoIcon from "../logo-v4-icon-light.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src={logo} alt="JurisConnect" />
            <p>
              Conectando empresas e correspondentes jurídicos em todo o Brasil.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h3>Links Rápidos</h3>
              <ul>
                <li>
                  <Link to="/">Início</Link>
                </li>
                <li>
                  <Link to="/sobre">Sobre</Link>
                </li>
                <li>
                  <Link to="/servicos">Serviços</Link>
                </li>
                <li>
                  <Link to="/contato">Contato</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Serviços</h3>
              <ul>
                <li>
                  <Link to="/servicos/audiencias">Audiências</Link>
                </li>
                <li>
                  <Link to="/servicos/diligencias">Diligências</Link>
                </li>
                <li>
                  <Link to="/servicos/protocolos">Protocolos</Link>
                </li>
                <li>
                  <Link to="/servicos/copias">Cópias</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Contato</h3>
              <ul>
                <li>
                  <a href="mailto:contato@jurisconnect.com.br">
                    contato@jurisconnect.com.br
                  </a>
                </li>
                <li>
                  <a href="tel:+551199999999">(11) 9999-9999</a>
                </li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>
              &copy; {currentYear} JurisConnect. Todos os direitos reservados.
            </p>
          </div>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
          <div className="footer-watermark">
            <img src={logoIcon} alt="JurisConnect" className="watermark-logo" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

## 6. Frontend - Sistema de Rotas

### 6.1. Configuração do React Router

1. Atualize o arquivo `jurisconnect-frontend/src/App.js`:

```jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";
import NotFound from "./components/NotFound";
import "./App.css";

const App = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  // Verificar se o usuário já está autenticado ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setAuth({
        isAuthenticated: true,
        user,
        token,
      });
    }
  }, []);

  // Função para lidar com o login
  const handleLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setAuth({
      isAuthenticated: true,
      user: data.user,
      token: data.token,
    });
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  // Componente para rotas protegidas
  const PrivateRoute = ({ element, allowedRoles }) => {
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      return <Navigate to="/dashboard" />;
    }

    return element;
  };

  return (
    <Router>
      <div className="app">
        <Header
          isAuthenticated={auth.isAuthenticated}
          user={auth.user}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <Routes>
            {/* Rotas públicas */}
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <Features />
                </>
              }
            />
            <Route
              path="/login"
              element={
                auth.isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            <Route
              path="/register"
              element={
                auth.isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Register onLogin={handleLogin} />
                )
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute
                  element={<Dashboard user={auth.user} token={auth.token} />}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute
                  element={<Profile user={auth.user} token={auth.token} />}
                />
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute
                  element={<AdminPanel user={auth.user} token={auth.token} />}
                  allowedRoles={["admin"]}
                />
              }
            />

            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
```

## 7. Frontend - Integração com Backend

### 7.1. Configuração da API

1. Atualize o arquivo `jurisconnect-frontend/src/config.js`:

```javascript
// Configuração da API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Endpoints da API
export const ENDPOINTS = {
  // Autenticação
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Empresas
  COMPANIES: '/api/companies',
  
  // Correspondentes
  CORRESPONDENTS: '/api/correspondents',
  
  // Solicitações de Serviço
  SERVICE_REQUESTS: '/api/services',
};

// Função auxiliar para obter cabeçalhos com token
export const getAuthHeaders = (token) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};
```

### 7.2. Serviços de API

1. Crie o arquivo `jurisconnect-frontend/src/services/api.js`:

```javascript
import axios from 'axios';
import { API_URL, ENDPOINTS, getAuthHeaders } from '../config';

// Criar instância do axios
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, { email, password });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.get(ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get(ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Serviços de empresas
export const companyService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.COMPANIES);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.COMPANIES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  create: async (companyData) => {
    try {
      const response = await api.post(ENDPOINTS.COMPANIES, companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  update: async (id, companyData) => {
    try {
      const response = await api.put(`${ENDPOINTS.COMPANIES}/${id}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.COMPANIES}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Serviços de correspondentes
export const correspondentService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.CORRESPONDENTS);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.CORRESPONDENTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  create: async (correspondentData) => {
    try {
      const response = await api.post(ENDPOINTS.CORRESPONDENTS, correspondentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  update: async (id, correspondentData) => {
    try {
      const response = await api.put(`${ENDPOINTS.CORRESPONDENTS}/${id}`, correspondentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.CORRESPONDENTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Serviços de solicitações de serviço
export const serviceRequestService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get(ENDPOINTS.SERVICE_REQUESTS, { params });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.SERVICE_REQUESTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  create: async (serviceRequestData) => {
    try {
      const response = await api.post(ENDPOINTS.SERVICE_REQUESTS, serviceRequestData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  update: async (id, serviceRequestData) => {
    try {
      const response = await api.put(`${ENDPOINTS.SERVICE_REQUESTS}/${id}`, serviceRequestData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.SERVICE_REQUESTS}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
  
  assignCorrespondent: async (id, correspondentId, correspondentValue) => {
    try {
      const response = await api.put(`${ENDPOINTS.SERVICE_REQUESTS}/${id}/assign`, {
        correspondentId,
        correspondentValue,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default api;
```

## 8. Implementação dos Logotipos

### 8.1. Uso Correto dos Logotipos

1. Atualize o arquivo `jurisconnect-frontend/src/App.css` para incluir estilos para os logotipos:

```css
/* Estilos para logotipos */

/* Logo versão 1 (símbolo + texto, fundo escuro) */
.logo-dark {
  max-width: 150px;
  height: auto;
}

/* Logo versão 2 (símbolo + texto, fundo claro) */
.logo-light {
  max-width: 150px;
  height: auto;
}

/* Logo versão 3 (ícone isolado, fundo escuro) */
.logo-icon-dark {
  width: 32px;
  height: 32px;
}

/* Logo versão 4 (ícone isolado, fundo claro) */
.logo-icon-light {
  width: 32px;
  height: 32px;
  opacity: 0.2; /* Para uso como marca d'água */
}

/* Favicon */
link[rel="icon"] {
  /* Estilos aplicados via HTML */
}

/* Marca d'água */
.watermark {
  position: absolute;
  opacity: 0.05;
  z-index: -1;
  pointer-events: none;
}

/* Estilos específicos para componentes */

/* Header */
.header .logo img {
  max-height: 50px;
}

/* Footer */
.footer-logo img {
  max-width: 180px;
  margin-bottom: 15px;
}

.footer-watermark {
  position: relative;
}

.watermark-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100px;
  opacity: 0.1;
  z-index: -1;
}

/* Login e Register */
.login-logo,
.register-logo {
  max-width: 200px;
  margin-bottom: 20px;
}
```

2. Atualize o arquivo `jurisconnect-frontend/public/index.html` para incluir o favicon:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="JurisConnect - Conectando empresas e correspondentes jurídicos em todo o Brasil"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>JurisConnect</title>
    <!-- Font Awesome para ícones -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
  </head>
  <body>
    <noscript>Você precisa habilitar JavaScript para executar este aplicativo.</noscript>
    <div id="root"></div>
  </body>
</html>
```

3. Copie os arquivos de logotipo para a pasta `jurisconnect-frontend/public`:

```bash
cp jurisconnect-frontend/src/logo-v3-icon-dark.png jurisconnect-frontend/public/favicon.ico
cp jurisconnect-frontend/src/logo-v3-icon-dark.png jurisconnect-frontend/public/logo192.png
cp jurisconnect-frontend/src/logo-v3-icon-dark.png jurisconnect-frontend/public/logo512.png
```

## 9. Correção de Links

### 9.1. Verificação e Correção de Links

1. Verifique todos os links no componente `Header.js`:

```jsx
// Dentro do componente Header.js
<nav className="main-nav">
  <ul>
    <li>
      <Link to="/">Início</Link>
    </li>
    <li>
      <Link to="/sobre">Sobre</Link>
    </li>
    <li>
      <Link to="/servicos">Serviços</Link>
    </li>
    <li>
      <Link to="/contato">Contato</Link>
    </li>
  </ul>
</nav>

<div className="auth-buttons">
  {isAuthenticated ? (
    <>
      <div className="user-menu">
        <span className="user-name">Olá, {user.nome}</span>
        <div className="dropdown-menu">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/perfil">Meu Perfil</Link>
          {user.tipo === "admin" && (
            <Link to="/admin">Administração</Link>
          )}
          <button onClick={handleLogout}>Sair</button>
        </div>
      </div>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-outline">
        Login
      </Link>
      <Link to="/register" className="btn btn-primary">
        Cadastre-se
      </Link>
    </>
  )}
</div>
```

2. Verifique todos os links no componente `Footer.js`:

```jsx
// Dentro do componente Footer.js
<div className="footer-links">
  <div className="footer-section">
    <h3>Links Rápidos</h3>
    <ul>
      <li>
        <Link to="/">Início</Link>
      </li>
      <li>
        <Link to="/sobre">Sobre</Link>
      </li>
      <li>
        <Link to="/servicos">Serviços</Link>
      </li>
      <li>
        <Link to="/contato">Contato</Link>
      </li>
    </ul>
  </div>

  <div className="footer-section">
    <h3>Serviços</h3>
    <ul>
      <li>
        <Link to="/servicos/audiencias">Audiências</Link>
      </li>
      <li>
        <Link to="/servicos/diligencias">Diligências</Link>
      </li>
      <li>
        <Link to="/servicos/protocolos">Protocolos</Link>
      </li>
      <li>
        <Link to="/servicos/copias">Cópias</Link>
      </li>
    </ul>
  </div>
</div>
```

3. Verifique todos os links no componente `Login.js`:

```jsx
// Dentro do componente Login.js
<div className="login-footer">
  <p>
    Não tem uma conta? <Link to="/register">Registre-se</Link>
  </p>
  <p>
    <Link to="/forgot-password">Esqueceu sua senha?</Link>
  </p>
</div>
```

4. Verifique todos os links no componente `Register.js`:

```jsx
// Dentro do componente Register.js
<div className="register-footer">
  <p>
    Já tem uma conta? <Link to="/login">Faça login</Link>
  </p>
</div>
```

## 10. Testes e Validação

### 10.1. Testes de Backend

1. Crie o arquivo `backend/tests/auth.test.js`:

```javascript
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const mongoose = require('mongoose');

// Conectar ao banco de dados de teste
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Limpar banco de dados após os testes
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Testes de Autenticação', () => {
  // Teste de registro
  test('Deve registrar um novo usuário', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'senha123',
        role: 'company',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  // Teste de login
  test('Deve fazer login com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@exemplo.com',
        password: 'senha123',
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  // Teste de login com credenciais inválidas
  test('Não deve fazer login com credenciais inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@exemplo.com',
        password: 'senhaerrada',
      });
    
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });

  // Teste de obter usuário atual
  test('Deve obter o usuário atual com token válido', async () => {
    // Primeiro fazer login para obter o token
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@exemplo.com',
        password: 'senha123',
      });
    
    const token = login.body.token;
    
    // Usar o token para obter o usuário atual
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('email', 'teste@exemplo.com');
  });
});
```

### 10.2. Testes de Frontend

1. Crie o arquivo `jurisconnect-frontend/src/components/Login.test.js`:

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock do useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock da API
jest.mock('../config', () => ({
  API_URL: 'http://localhost:5000',
}));

describe('Componente Login', () => {
  test('Renderiza o formulário de login corretamente', () => {
    render(
      <BrowserRouter>
        <Login onLogin={() => {}} />
      </BrowserRouter>
    );
    
    // Verificar se os elementos estão presentes
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });

  test('Exibe erro quando os campos estão vazios', async () => {
    render(
      <BrowserRouter>
        <Login onLogin={() => {}} />
      </BrowserRouter>
    );
    
    // Clicar no botão sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar se a validação HTML5 é acionada
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInvalid();
    });
  });

  test('Chama a função onLogin quando o login é bem-sucedido', async () => {
    // Mock da função fetch
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token', user: { name: 'Test User' } }),
      })
    );
    
    const onLoginMock = jest.fn();
    
    render(
      <BrowserRouter>
        <Login onLogin={onLoginMock} />
      </BrowserRouter>
    );
    
    // Preencher o formulário
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha123' },
    });
    
    // Enviar o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verificar se a função onLogin foi chamada
    await waitFor(() => {
      expect(onLoginMock).toHaveBeenCalled();
    });
    
    // Limpar o mock
    global.fetch.mockClear();
    delete global.fetch;
  });
});
```

### 10.3. Validação de Responsividade

1. Adicione estilos responsivos ao arquivo `jurisconnect-frontend/src/App.css`:

```css
/* Estilos responsivos */

/* Dispositivos pequenos (telefones em modo retrato, menos de 576px) */
@media (max-width: 575.98px) {
  .container {
    padding: 0 15px;
  }
  
  .header-content {
    flex-direction: column;
    padding: 10px 0;
  }
  
  .main-nav ul {
    flex-direction: column;
    align-items: center;
  }
  
  .main-nav li {
    margin: 5px 0;
  }
  
  .auth-buttons {
    margin-top: 10px;
  }
  
  .footer-content {
    flex-direction: column;
  }
  
  .footer-links {
    flex-direction: column;
    margin-top: 20px;
  }
  
  .footer-section {
    margin-bottom: 20px;
  }
}

/* Dispositivos médios (tablets em modo retrato, 576px e acima) */
@media (min-width: 576px) and (max-width: 767.98px) {
  .container {
    max-width: 540px;
  }
  
  .header-content {
    flex-wrap: wrap;
  }
  
  .main-nav {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }
  
  .footer-links {
    flex-wrap: wrap;
  }
  
  .footer-section {
    flex: 0 0 50%;
    margin-bottom: 20px;
  }
}

/* Dispositivos grandes (tablets em modo paisagem, 768px e acima) */
@media (min-width: 768px) and (max-width: 991.98px) {
  .container {
    max-width: 720px;
  }
}

/* Dispositivos extra grandes (desktops, 992px e acima) */
@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

/* Dispositivos extra extra grandes (desktops grandes, 1200px e acima) */
@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}
```

## Conclusão

Este plano detalhado fornece todas as instruções necessárias para implementar as funcionalidades pendentes e corrigir os links inoperantes no Sistema JurisConnect. Seguindo este guia passo a passo, você poderá:

1. Configurar o ambiente de desenvolvimento
2. Implementar o backend com MongoDB
3. Implementar o sistema de autenticação
4. Criar as APIs de gestão
5. Desenvolver os componentes de interface do frontend
6. Configurar o sistema de rotas
7. Integrar o frontend com o backend
8. Implementar corretamente os logotipos
9. Corrigir todos os links inoperantes
10. Realizar testes e validação

Após a implementação, você terá um sistema completo e funcional para gestão de correspondentes jurídicos, seguindo as melhores práticas de desenvolvimento e atendendo a todos os requisitos especificados.
