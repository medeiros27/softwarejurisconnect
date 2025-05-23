const ServiceRequest = require('../models/ServiceRequest');
const ErrorResponse = require('../utils/errorResponse');

// Listar todas as solicitações de serviço
exports.getServiceRequests = async (req, res, next) => {
  const serviceRequests = await ServiceRequest.find();
  res.json({ success: true, count: serviceRequests.length, data: serviceRequests });
};

// Obter solicitação por ID
exports.getServiceRequestById = async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) return next(new ErrorResponse('Solicitação não encontrada', 404));
  res.json({ success: true, data: serviceRequest });
};

// Criar solicitação
exports.createServiceRequest = async (req, res, next) => {
  const serviceRequest = await ServiceRequest.create(req.body);
  res.status(201).json({ success: true, data: serviceRequest });
};

// Atualizar solicitação
exports.updateServiceRequest = async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!serviceRequest) return next(new ErrorResponse('Solicitação não encontrada', 404));
  res.json({ success: true, data: serviceRequest });
};

// Excluir solicitação
exports.deleteServiceRequest = async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findByIdAndDelete(req.params.id);
  if (!serviceRequest) return next(new ErrorResponse('Solicitação não encontrada', 404));
  res.json({ success: true, message: 'Solicitação excluída' });
};