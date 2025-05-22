/**
 * Rotas de API para gerenciamento de correspondentes no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo define as rotas da API para operações relacionadas aos correspondentes jurídicos.
 */

const express = require('express');
const router = express.Router();
const correspondentController = require('../controllers/correspondentController');
const authController = require('../controllers/authController');

// Middleware de autenticação para todas as rotas
router.use(authController.authenticate);

// Rotas para administradores
router.get(
  '/',
  authController.authorize('admin'),
  correspondentController.getAllCorrespondents
);

router.get(
  '/pending',
  authController.authorize('admin'),
  correspondentController.getPendingCorrespondents
);

router.patch(
  '/:id/status',
  authController.authorize('admin'),
  correspondentController.updateCorrespondentStatus
);

router.delete(
  '/:id',
  authController.authorize('admin'),
  correspondentController.deleteCorrespondent
);

// Rotas para busca de correspondentes (acessíveis por administradores e empresas)
router.get(
  '/search/location',
  authController.authorize('admin', 'company'),
  correspondentController.getCorrespondentsByLocation
);

router.get(
  '/search/specialty',
  authController.authorize('admin', 'company'),
  correspondentController.getCorrespondentsBySpecialty
);

// Rotas para administradores e correspondentes (próprio perfil)
router.get(
  '/:id',
  authController.authorize('admin', 'correspondent'),
  correspondentController.getCorrespondentById
);

router.put(
  '/:id',
  authController.authorize('admin', 'correspondent'),
  correspondentController.updateCorrespondent
);

module.exports = router;
