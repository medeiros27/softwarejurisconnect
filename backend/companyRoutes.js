/**
 * Rotas de API para gerenciamento de empresas no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo define as rotas da API para operações relacionadas às empresas contratantes.
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');

// Middleware de autenticação para todas as rotas
router.use(authController.authenticate);

// Rotas para administradores
router.get(
  '/',
  authController.authorize('admin'),
  companyController.getAllCompanies
);

router.get(
  '/pending',
  authController.authorize('admin'),
  companyController.getPendingCompanies
);

router.patch(
  '/:id/status',
  authController.authorize('admin'),
  companyController.updateCompanyStatus
);

router.delete(
  '/:id',
  authController.authorize('admin'),
  companyController.deleteCompany
);

// Rotas para administradores e empresas (próprio perfil)
router.get(
  '/:id',
  authController.authorize('admin', 'company'),
  companyController.getCompanyById
);

router.put(
  '/:id',
  authController.authorize('admin', 'company'),
  companyController.updateCompany
);

module.exports = router;
