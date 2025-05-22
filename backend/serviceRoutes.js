/**
 * routes/serviceRoutes.js - Rotas de solicitações de serviço
 * 
 * Este arquivo define as rotas relacionadas às solicitações de serviço,
 * como criação, atribuição a correspondentes, atualização de status, etc.
 */

const express = require('express');
const {
  getServiceRequests,
  getServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  assignServiceRequest,
  cancelServiceRequest,
  approveCompletionReport,
  getServiceStats
} = require('../controllers/serviceController');

const ServiceRequest = require('../models/ServiceRequest');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de proteção a todas as rotas
router.use(protect);

// Rotas para estatísticas (apenas admin)
router.get(
  '/stats',
  authorize('admin'),
  getServiceStats
);

// Rotas para listar e criar solicitações
router.route('/')
  .get(
    advancedResults(ServiceRequest, [
      { path: 'company', select: 'companyName cnpj' },
      { path: 'correspondent', select: 'fullName oab' }
    ]),
    getServiceRequests
  )
  .post(
    authorize('company'),
    createServiceRequest
  );

// Rotas para operações em solicitações específicas
router.route('/:id')
  .get(getServiceRequest)
  .put(updateServiceRequest);

// Rota para cancelar solicitação
router.put('/:id/cancel', cancelServiceRequest);

// Rota para aprovar relatório de conclusão
router.put('/:id/approve-report', authorize('company', 'admin'), approveCompletionReport);

// Rota para atribuir solicitação a correspondente (apenas admin)
router.put(
  '/:id/assign/:correspondentId',
  authorize('admin'),
  assignServiceRequest
);

module.exports = router;
