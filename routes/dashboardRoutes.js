const express = require('express');
const router = express.Router();

// GET /api/dashboard
router.get('/', (req, res) => {
  res.json({
    totalUsuarios: 10,
    totalEmpresas: 3,
    totalCorrespondentes: 7,
    totalServicos: 15
  });
});

module.exports = router;