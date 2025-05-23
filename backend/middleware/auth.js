// Middleware de autenticação para rotas protegidas

module.exports = function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Não autenticado.' });
  }
  next();
};

// Caso precise de autorização por papel (admin/company/correspondent):
module.exports.requireRole = function(role) {
  return function (req, res, next) {
    if (!req.session || !req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ success: false, message: 'Acesso restrito.' });
    }
    next();
  };
};