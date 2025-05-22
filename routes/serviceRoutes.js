const express = require('express');
const router = express.Router();

// GET /api/services
router.get('/', (req, res) => {
  res.json([{ id: 1, nome: 'Serviço Exemplo' }]);
});

module.exports = router;