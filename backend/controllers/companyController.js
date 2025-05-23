const Company = require('../models/Company');
const ErrorResponse = require('../utils/errorResponse');

// Listar todas as empresas (com paginação e filtros opcionais)
exports.getCompanies = async (req, res, next) => {
  const companies = await Company.find();
  res.json({ success: true, count: companies.length, data: companies });
};

// Obter empresa por ID
exports.getCompanyById = async (req, res, next) => {
  const company = await Company.findById(req.params.id);
  if (!company) return next(new ErrorResponse('Empresa não encontrada', 404));
  res.json({ success: true, data: company });
};

// Criar nova empresa
exports.createCompany = async (req, res, next) => {
  const company = await Company.create(req.body);
  res.status(201).json({ success: true, data: company });
};

// Atualizar empresa
exports.updateCompany = async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!company) return next(new ErrorResponse('Empresa não encontrada', 404));
  res.json({ success: true, data: company });
};

// Excluir empresa
exports.deleteCompany = async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return next(new ErrorResponse('Empresa não encontrada', 404));
  res.json({ success: true, message: 'Empresa excluída' });
};