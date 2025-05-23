const express = require('express');
const router = express.Router();
const Company = require('../models/Company'); // seu model Company já existe

// GET /api/empresas - Lista todas as empresas
router.get('/', async (req, res) => {
  try {
    const empresas = await Company.find();
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar empresas.' });
  }
});

// POST /api/empresas - Cria nova empresa
router.post('/', async (req, res) => {
  try {
    const empresa = new Company(req.body);
    await empresa.save();
    res.status(201).json(empresa);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar empresa.' });
  }
});

// PUT /api/empresas/:id - Edita empresa existente
router.put('/:id', async (req, res) => {
  try {
    const empresa = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada.' });
    res.json(empresa);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar empresa.' });
  }
});

// DELETE /api/empresas/:id - Remove empresa
router.delete('/:id', async (req, res) => {
  try {
    const empresa = await Company.findByIdAndDelete(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada.' });
    res.json({ removida: empresa });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao remover empresa.' });
  }
});

module.exports = router;