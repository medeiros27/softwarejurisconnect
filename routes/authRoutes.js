const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  // Implemente lógica real de autenticação aqui
  res.json({ success: true, message: 'Login efetuado (mock)' });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  // Implemente lógica real de cadastro aqui
  res.json({ success: true, message: 'Registro efetuado (mock)' });
});

module.exports = router;