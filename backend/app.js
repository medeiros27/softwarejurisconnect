const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');

// Models e rotas
const User = require('./models/User');
const Company = require('./models/Company');
const Correspondent = require('./models/Correspondent');
const empresasRouter = require('./routes/empresas');

const app = express();

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/empresas', empresasRouter);

app.use(session({
    secret: process.env.SESSION_SECRET || 'jurisconnect_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ... (demais configurações, rotas e middlewares do seu app)

// Não coloque app.listen aqui!
// Exporte o app:
module.exports = app;