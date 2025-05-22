const express = require('express');
const router = express.Router();

// GET /api/companies
router.get('/', (req, res) => {
  res.json([{ id: 1, nome: 'Empresa Exemplo' }]);
});

module.exports = router;