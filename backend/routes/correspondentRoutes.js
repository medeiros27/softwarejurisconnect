const express = require('express');
const router = express.Router();
const correspondentController = require('../controllers/correspondentController');
const asyncHandler = require('../middleware/async');
const requireLogin = require('../middleware/auth');

// Listar e criar correspondentes
router.get('/', asyncHandler(correspondentController.getCorrespondents));
router.post('/', requireLogin, asyncHandler(correspondentController.createCorrespondent));

// Obter, atualizar, excluir por ID
router.get('/:id', asyncHandler(correspondentController.getCorrespondentById));
router.put('/:id', requireLogin, asyncHandler(correspondentController.updateCorrespondent));
router.delete('/:id', requireLogin, asyncHandler(correspondentController.deleteCorrespondent));

module.exports = router;