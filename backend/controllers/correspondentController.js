const Correspondent = require('../models/Correspondent');
const ErrorResponse = require('../utils/errorResponse');

// Listar todos os correspondentes
exports.getCorrespondents = async (req, res, next) => {
  const correspondents = await Correspondent.find();
  res.json({ success: true, count: correspondents.length, data: correspondents });
};

// Obter correspondente por ID
exports.getCorrespondentById = async (req, res, next) => {
  const correspondent = await Correspondent.findById(req.params.id);
  if (!correspondent) return next(new ErrorResponse('Correspondente não encontrado', 404));
  res.json({ success: true, data: correspondent });
};

// Criar correspondente
exports.createCorrespondent = async (req, res, next) => {
  const correspondent = await Correspondent.create(req.body);
  res.status(201).json({ success: true, data: correspondent });
};

// Atualizar correspondente
exports.updateCorrespondent = async (req, res, next) => {
  const correspondent = await Correspondent.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!correspondent) return next(new ErrorResponse('Correspondente não encontrado', 404));
  res.json({ success: true, data: correspondent });
};

// Excluir correspondente
exports.deleteCorrespondent = async (req, res, next) => {
  const correspondent = await Correspondent.findByIdAndDelete(req.params.id);
  if (!correspondent) return next(new ErrorResponse('Correspondente não encontrado', 404));
  res.json({ success: true, message: 'Correspondente excluído' });
};