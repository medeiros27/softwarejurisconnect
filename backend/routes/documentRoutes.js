const express = require('express');
const router = express.Router();

// GET /api/documents
router.get('/', (req, res) => {
  res.json([{ id: 1, titulo: 'Documento Exemplo' }]);
});

module.exports = router;