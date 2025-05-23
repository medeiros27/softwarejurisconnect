const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const asyncHandler = require('../middleware/async');
const requireLogin = require('../middleware/auth');

// Listar e criar empresas
router.get('/', asyncHandler(companyController.getCompanies));
router.post('/', requireLogin, asyncHandler(companyController.createCompany));

// Obter, atualizar, excluir por ID
router.get('/:id', asyncHandler(companyController.getCompanyById));
router.put('/:id', requireLogin, asyncHandler(companyController.updateCompany));
router.delete('/:id', requireLogin, asyncHandler(companyController.deleteCompany));

module.exports = router;