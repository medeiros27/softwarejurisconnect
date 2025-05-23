const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const asyncHandler = require('../middleware/async');
const requireLogin = require('../middleware/auth');

// Listar e criar solicitações
router.get('/', asyncHandler(serviceRequestController.getServiceRequests));
router.post('/', requireLogin, asyncHandler(serviceRequestController.createServiceRequest));

// Obter, atualizar, excluir por ID
router.get('/:id', asyncHandler(serviceRequestController.getServiceRequestById));
router.put('/:id', requireLogin, asyncHandler(serviceRequestController.updateServiceRequest));
router.delete('/:id', requireLogin, asyncHandler(serviceRequestController.deleteServiceRequest));

module.exports = router;