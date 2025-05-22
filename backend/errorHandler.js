/**
 * middleware/errorHandler.js - Middleware para tratamento de erros
 * 
 * Este middleware centraliza o tratamento de erros da aplicação,
 * formatando as respostas de erro de forma consistente.
 */

const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desenvolvimento
  console.error(err);

  // Erro de ID do Mongoose
  if (err.name === 'CastError') {
    const message = `Recurso não encontrado com id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Erro de campo duplicado
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Valor duplicado para o campo ${field}`;
    error = new ErrorResponse(message, 400);
  }

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro no servidor'
  });
};

module.exports = errorHandler;
