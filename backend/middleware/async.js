/**
 * middleware/async.js - Middleware para tratamento assíncrono
 * 
 * Este middleware simplifica o tratamento de erros em funções assíncronas,
 * eliminando a necessidade de blocos try/catch em cada controlador.
 */

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
