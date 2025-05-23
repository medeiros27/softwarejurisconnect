const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// Cadastro (signup)
exports.signup = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorResponse('Preencha todos os campos obrigatórios', 400));
  }
  let userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('Email já cadastrado', 400));
  }
  // Em produção, use bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// Solicitar recuperação de senha (gera token e envia por email)
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('Usuário não encontrado com esse email', 404));
  }

  // Cria token de reset
  const resetToken = crypto.randomBytes(20).toString('hex');
  const resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hora

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = resetPasswordExpire;
  await user.save({ validateBeforeSave: false });

  // Aqui, envie o resetToken por email ao usuário (exemplo: console.log ou integrando com nodemailer)
  console.log(`Token de redefinição de senha: ${resetToken}`);

  res.json({ success: true, message: 'Token de redefinição enviado para o email (simulado)' });
};

// Redefinir senha
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Busca usuário com token válido e não expirado
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Token inválido ou expirado', 400));
  }

  // Em produção, use bcrypt.hash(password, 10)
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Senha redefinida com sucesso' });
};