const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Cadastro
router.post('/signup', authController.signup);

// Login, logout, me
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

// Recuperação de senha
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;