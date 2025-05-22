/**
 * Rotas de API para o Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo define as rotas da API para autenticação e gerenciamento de usuários.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rotas de autenticação
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Rota protegida de exemplo
router.get('/profile', authController.authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Rotas protegidas por perfil
router.get(
  '/admin/dashboard', 
  authController.authenticate, 
  authController.authorize('admin'), 
  (req, res) => {
    res.json({ message: 'Acesso ao dashboard administrativo' });
  }
);

router.get(
  '/company/dashboard', 
  authController.authenticate, 
  authController.authorize('company'), 
  (req, res) => {
    res.json({ message: 'Acesso ao dashboard da empresa' });
  }
);

router.get(
  '/correspondent/dashboard', 
  authController.authenticate, 
  authController.authorize('correspondent'), 
  (req, res) => {
    res.json({ message: 'Acesso ao dashboard do correspondente' });
  }
);

module.exports = router;
