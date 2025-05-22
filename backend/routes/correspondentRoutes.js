const express = require('express');
const router = express.Router();

// GET /api/correspondents
router.get('/', (req, res) => {
  res.json([{ id: 1, nome: 'Correspondente Exemplo' }]);
});

module.exports = router;