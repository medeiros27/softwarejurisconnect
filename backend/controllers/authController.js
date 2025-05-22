/**
 * Controladores de autenticação para o Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém os controladores para registro, login e gerenciamento de autenticação.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Company, Correspondent } = require('../models');

// Configuração do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'correspondentes_juridicos_secret';
const JWT_EXPIRES_IN = '7d';

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Controlador de registro
exports.register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      document, 
      company_name, 
      business_type,
      contact_name,
      monthly_volume,
      locations,
      products_of_interest,
      oab_number,
      specialties,
      rates
    } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe com este e-mail' });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password_hash,
      role,
      status: role === 'admin' ? 'active' : 'pending',
      phone: req.body.phone || null
    });

    // Criar perfil específico baseado no role
    if (role === 'company') {
      await Company.create({
        user_id: user.id,
        document,
        company_name,
        business_type,
        contact_name,
        monthly_volume,
        locations,
        products_of_interest
      });
    } else if (role === 'correspondent') {
      await Correspondent.create({
        user_id: user.id,
        document,
        oab_number,
        specialties,
        locations,
        rates
      });
    }

    // Gerar token JWT
    const token = generateToken(user);

    // Retornar dados do usuário sem a senha
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Controlador de login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar status do usuário
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Conta pendente de aprovação ou inativa' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    await user.update({ last_login: new Date() });

    // Gerar token JWT
    const token = generateToken(user);

    // Retornar dados do usuário sem a senha
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return res.status(200).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Controlador para recuperação de senha
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar token de recuperação (expira em 1 hora)
    const resetToken = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Aqui seria implementado o envio de e-mail com o link de recuperação
    // contendo o token gerado

    return res.status(200).json({ 
      message: 'Instruções de recuperação enviadas para o e-mail'
    });
  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Controlador para redefinição de senha
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Atualizar senha
    await user.update({ password_hash });

    return res.status(200).json({ 
      message: 'Senha redefinida com sucesso' 
    });
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Middleware para verificação de token
exports.authenticate = async (req, res, next) => {
  try {
    // Verificar header de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }

    // Extrair token
    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar usuário
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Verificar status do usuário
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Conta inativa ou pendente de aprovação' });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware para verificação de permissões
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Acesso não autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso proibido' });
    }

    next();
  };
};
