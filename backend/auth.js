/**
 * config/auth.js - Configuração de autenticação JWT
 * 
 * Este arquivo configura as opções para geração e validação de tokens JWT.
 */

module.exports = {
  // Tempo de expiração do token JWT (em segundos)
  jwtExpiration: 3600, // 1 hora
  
  // Tempo de expiração do token de refresh (em segundos)
  jwtRefreshExpiration: 86400, // 24 horas
  
  // Opções para o cookie de autenticação
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  },
  
  // Configurações de senha
  passwordOptions: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: false
  }
};
