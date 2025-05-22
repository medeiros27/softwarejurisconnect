/**
 * Rotas de API para gerenciamento de solicitações de serviços no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo define as rotas da API para operações relacionadas às solicitações de serviços.
 */

const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const authController = require('../controllers/authController');

// Middleware de autenticação para todas as rotas
router.use(authController.authenticate);

// Rotas para criação de solicitações (empresas e admin)
router.post(
  '/',
  authController.authorize('company', 'admin'),
  serviceRequestController.createServiceRequest
);

// Rotas para administradores
router.get(
  '/',
  authController.authorize('admin'),
  serviceRequestController.getAllServiceRequests
);

router.patch(
  '/:id/value',
  authController.authorize('admin'),
  serviceRequestController.setServiceRequestValue
);

router.patch(
  '/:id/assign',
  authController.authorize('admin'),
  serviceRequestController.assignCorrespondent
);

// Rotas para empresas
router.get(
  '/company/:companyId?',
  authController.authorize('company', 'admin'),
  serviceRequestController.getCompanyServiceRequests
);

// Rotas para correspondentes
router.get(
  '/correspondent/:correspondentId?',
  authController.authorize('correspondent', 'admin'),
  serviceRequestController.getCorrespondentServiceRequests
);

router.patch(
  '/:id/presence',
  authController.authorize('correspondent'),
  serviceRequestController.confirmPresence
);

// Rotas compartilhadas
router.get(
  '/:id',
  authController.authorize('admin', 'company', 'correspondent'),
  serviceRequestController.getServiceRequestById
);

router.patch(
  '/:id/status',
  authController.authorize('admin', 'company', 'correspondent'),
  serviceRequestController.updateServiceRequestStatus
);

module.exports = router;
