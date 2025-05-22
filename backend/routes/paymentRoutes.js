const express = require('express');
const router = express.Router();

// GET /api/payments
router.get('/', (req, res) => {
  res.json([
    { id: 1, valor: 100.00, status: 'Pago', data: '2025-05-20' },
    { id: 2, valor: 150.00, status: 'Pendente', data: '2025-05-21' }
  ]);
});

module.exports = router;