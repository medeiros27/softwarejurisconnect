require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MONGODB CONFIG
// =======================
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro MongoDB:', err));

const User = require('./models/User');
const Company = require('./models/Company');
const Correspondent = require('./models/Correspondent');
const empresasRouter = require('./routes/empresas');

// =======================
// MIDDLEWARES
// =======================
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

// =======================
// MULTER CONFIG (UPLOADS)
// =======================
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// =======================
// NODEMAILER CONFIG (E-MAIL)
// =======================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// =======================
// MIDDLEWARES DE AUTENTICAÇÃO
// =======================
function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login.html');
    next();
}
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).send('Acesso restrito.');
    next();
}

// =======================
// ROTAS PRINCIPAIS
// =======================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html')));

// =======================
// CADASTRO DE USUÁRIO COM E-MAIL DE CONFIRMAÇÃO
// =======================
app.post('/cadastro', async (req, res) => {
    const { role, name, email, password, confirm_password, terms } = req.body;
    if (!role || !name || !email || !password || !confirm_password || !terms) {
        return res.json({ success: false, message: 'Preencha todos os campos obrigatórios!' });
    }
    if (password !== confirm_password) {
        return res.json({ success: false, message: 'As senhas não coincidem.' });
    }
    // Verifica se já existe
    const exists = await User.findOne({ email }) ||
                   await Company.findOne({ email }) ||
                   await Correspondent.findOne({ email });
    if (exists) {
        return res.json({ success: false, message: 'E-mail já cadastrado!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    if (role === 'company') {
        user = new Company({ ...req.body, password: hashedPassword });
        await user.save();
    } else if (role === 'correspondent') {
        user = new Correspondent({ ...req.body, password: hashedPassword });
        await user.save();
    } else if (role === 'admin') {
        user = new User({ ...req.body, password: hashedPassword, role: 'admin' });
        await user.save();
    }

    // Envia e-mail de boas-vindas
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Bem-vindo ao JurisConnect',
        text: `Olá, ${name}!\nSeu cadastro foi realizado com sucesso.`
    });

    res.json({ success: true, message: 'Cadastro realizado! Verifique seu e-mail.' });
});

// =======================
// LOGIN
// =======================
app.post('/login', async (req, res) => {
    const { email, password, user_type } = req.body;
    let user;
    if (user_type === 'admin') {
        user = await User.findOne({ email, role: 'admin' });
    } else if (user_type === 'company') {
        user = await Company.findOne({ email });
    } else if (user_type === 'correspondent') {
        user = await Correspondent.findOne({ email });
    }
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = {
            id: user._id,
            name: user.name,
            role: user.role || user_type,
            email: user.email
        };
        res.json({ success: true, redirect: '/dashboard.html' });
    } else {
        res.json({ success: false, message: 'Usuário ou senha inválidos!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});

// =======================
// UPLOAD DE ARQUIVOS (EXEMPLO)
// =======================
app.post('/upload', requireLogin, upload.single('arquivo'), (req, res) => {
    // O campo do formulário deve ser <input type="file" name="arquivo" />
    if (req.file) {
        res.json({ success: true, filename: req.file.filename, url: '/uploads/' + req.file.filename });
    } else {
        res.json({ success: false, message: 'Nenhum arquivo enviado!' });
    }
});

// =======================
// DASHBOARD PROTEGIDO
// =======================
app.get('/dashboard.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// =======================
// 404
// =======================
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// =======================
// INICIA SERVIDOR
// =======================
app.listen(3000, () => console.log('Servidor rodando!'));

/*
Crie um arquivo .env assim:
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/jurisconnect?retryWrites=true&w=majority
SESSION_SECRET=algumasecret
MAIL_USER=seuemail@gmail.com
MAIL_PASS=suaSenhaOuAppPassword
*/
