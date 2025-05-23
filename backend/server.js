// =======================
// JurisConnect Server.js
// =======================

// Importações e configurações iniciais
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const fs = require('fs');

const app = express();
const PORT = 3000;

// =======================
// CONFIGURAÇÕES MIDDLEWARE
// =======================

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sessão para autenticação e flash messages
app.use(session({
    secret: 'jurisconnect_secret_key_123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2h
}));
app.use(flash());

// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para passar mensagens flash para os templates (em caso de usar motor de template)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// =======================
// "BANCO DE DADOS" SIMULADO
// =======================

const DB_PATH = path.join(__dirname, 'db.json');
// Inicializa db.json se não existir
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], correspondents: [], companies: [] }, null, 2));
}
function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}
function writeDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// =======================
// ROTAS PRINCIPAIS
// =======================

// Home (página inicial)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =======================
// AUTENTICAÇÃO
// =======================

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login (POST)
app.post('/login', (req, res) => {
    const { email, password, user_type } = req.body;
    const db = readDB();

    let user;
    if (user_type === 'admin') {
        // Exemplo: usuário admin fixo
        user = db.users.find(u => u.email === email && u.password === password && u.role === 'admin');
    } else if (user_type === 'company') {
        user = db.companies.find(u => u.email === email && u.password === password);
    } else if (user_type === 'correspondent') {
        user = db.correspondents.find(u => u.email === email && u.password === password);
    }

    if (user) {
        req.session.user = {
            id: user.id,
            name: user.name,
            role: user.role || user_type,
            email: user.email
        };
        res.json({ success: true, redirect: '/dashboard' });
    } else {
        res.json({ success: false, message: 'Usuário ou senha inválidos!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// =======================
// CADASTRO DE USUÁRIO
// =======================

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
    const db = readDB();
    const { role, name, email, password, confirm_password, terms } = req.body;

    // Validações básicas
    if (!role || !name || !email || !password || !confirm_password || !terms) {
        return res.json({ success: false, message: 'Preencha todos os campos obrigatórios!' });
    }
    if (password !== confirm_password) {
        return res.json({ success: false, message: 'As senhas não coincidem.' });
    }
    if (db.users.find(u => u.email === email) ||
        db.companies.find(u => u.email === email) ||
        db.correspondents.find(u => u.email === email)
    ) {
        return res.json({ success: false, message: 'E-mail já cadastrado!' });
    }

    // Cadastro conforme o tipo
    let user = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: name,
        email: email,
        password: password,
        role: role
    };

    if (role === 'company') {
        user.cnpj = req.body.document;
        user.company_name = req.body.company_name;
        user.business_type = req.body.business_type;
        user.contact_name = req.body.contact_name;
        db.companies.push(user);
    } else if (role === 'correspondent') {
        user.cpf = req.body.document;
        user.oab_number = req.body.oab_number;
        user.specialties = Array.isArray(req.body.specialties)
            ? req.body.specialties
            : req.body.specialties
                ? [req.body.specialties]
                : [];
        db.correspondents.push(user);
    } else if (role === 'admin') {
        db.users.push(user);
    }

    writeDB(db);
    res.json({ success: true, message: 'Cadastro realizado com sucesso! Faça login.' });
});

// =======================
// DASHBOARD (proteção de rota)
// =======================

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    // Exemplo simples: retorna um HTML dinâmico ou pode servir um arquivo estático
    res.send(`
        <h2>Bem-vindo(a), ${req.session.user.name}!</h2>
        <p>Tipo de usuário: ${req.session.user.role}</p>
        <a href="/logout">Sair</a>
    `);
});

// =======================
// LISTAGEM DE USUÁRIOS (somente admin)
// =======================

app.get('/admin/users', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Acesso restrito.');
    }
    const db = readDB();
    res.json({
        users: db.users,
        companies: db.companies,
        correspondents: db.correspondents
    });
});

// =======================
// EXEMPLO DE ENDPOINT PARA TERMOS/POLÍTICAS
// =======================

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// =======================
// 404 PARA ROTAS NÃO ENCONTRADAS
// =======================

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// =======================
// INICIAR SERVIDOR
// =======================

app.listen(PORT, () => {
    console.log(`JurisConnect rodando em http://localhost:${PORT}`);
    console.log('Se necessário, crie a pasta "public" e coloque seus arquivos HTML/CSS/JS lá.');
});

/*
=========================
NOTAS E INSTRUÇÕES:
=========================
- Coloque seus arquivos HTML, CSS, JS e imagens na pasta "public".
- O banco de dados é um arquivo db.json na raiz do projeto.
- Altere/adapte os endpoints conforme as necessidades do frontend.
- Para produção, troque o "banco" por um banco real (MongoDB, MySQL etc).
- Para ambientes reais, sempre criptografe as senhas!
*/