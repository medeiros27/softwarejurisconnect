// Middleware de tratamento centralizado de erros

const ErrorResponse = require('../utils/errorResponse');

module.exports = function (err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Se for um erro customizado
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Erro de Mongoose: ID mal formatado
  if (err.name === 'CastError') {
    error = new ErrorResponse('Recurso não encontrado', 404);
  }

  // Erro de Mongoose: Duplicidade
  if (err.code === 11000) {
    error = new ErrorResponse('Valor duplicado', 400);
  }

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Erro padrão
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro no servidor'
  });
};