// Middleware para lidar com funções async e repassar erros para o handler
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};