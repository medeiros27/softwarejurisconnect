const express = require('express');
const router = express.Router();

// GET /api/service-requests
router.get('/', (req, res) => {
  res.json([
    { id: 1, descricao: 'Pedido de diligência', status: 'Aberto' },
    { id: 2, descricao: 'Acompanhamento de processo', status: 'Concluído' }
  ]);
});

// POST /api/service-requests
router.post('/', (req, res) => {
  // Exemplo de criação simulada
  const novoPedido = req.body;
  novoPedido.id = Date.now();
  res.status(201).json(novoPedido);
});

module.exports = router;