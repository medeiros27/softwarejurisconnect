/**
 * Testes unitários para o controlador de autenticação
 * 
 * Este arquivo contém testes para validar as funcionalidades de autenticação do sistema.
 */

const request = require('supertest');
const app = require('../app');
const { User, Company, Correspondent } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock do modelo User para testes
jest.mock('../models', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };
  
  const mockCompany = {
    findOne: jest.fn(),
    create: jest.fn()
  };
  
  const mockCorrespondent = {
    findOne: jest.fn(),
    create: jest.fn()
  };
  
  return {
    User: mockUser,
    Company: mockCompany,
    Correspondent: mockCorrespondent
  };
});

describe('Auth Controller', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new company user', async () => {
      // Configurar mock para simular que o usuário não existe
      User.findOne.mockResolvedValue(null);
      
      // Configurar mock para simular criação de usuário
      const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
      User.create.mockResolvedValue({
        id: mockUserId,
        name: 'Empresa Teste',
        email: 'empresa@teste.com',
        role: 'company',
        status: 'pending'
      });
      
      // Configurar mock para simular criação de empresa
      Company.create.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: mockUserId,
        document: '12.345.678/0001-99',
        company_name: 'Empresa Teste Ltda',
        business_type: 'law_firm'
      });
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Empresa Teste',
          email: 'empresa@teste.com',
          password: 'senha123',
          role: 'company',
          document: '12.345.678/0001-99',
          company_name: 'Empresa Teste Ltda',
          business_type: 'law_firm',
          contact_name: 'João Silva'
        });
      
      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', mockUserId);
      expect(response.body.user).toHaveProperty('role', 'company');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'empresa@teste.com' } });
      expect(User.create).toHaveBeenCalled();
      expect(Company.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: mockUserId,
        document: '12.345.678/0001-99',
        company_name: 'Empresa Teste Ltda'
      }));
    });
    
    it('should return error if user already exists', async () => {
      // Configurar mock para simular que o usuário já existe
      User.findOne.mockResolvedValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'empresa@teste.com'
      });
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Empresa Teste',
          email: 'empresa@teste.com',
          password: 'senha123',
          role: 'company'
        });
      
      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Usuário já existe com este e-mail');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'empresa@teste.com' } });
      expect(User.create).not.toHaveBeenCalled();
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      // Hash de senha para teste
      const passwordHash = await bcrypt.hash('senha123', 10);
      
      // Configurar mock para simular usuário encontrado
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Empresa Teste',
        email: 'empresa@teste.com',
        password_hash: passwordHash,
        role: 'company',
        status: 'active',
        update: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'empresa@teste.com',
          password: 'senha123'
        });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', mockUser.id);
      expect(response.body.user).toHaveProperty('role', 'company');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'empresa@teste.com' } });
      expect(mockUser.update).toHaveBeenCalledWith({ last_login: expect.any(Date) });
    });
    
    it('should return error with invalid credentials', async () => {
      // Hash de senha para teste (diferente da que será enviada)
      const passwordHash = await bcrypt.hash('senha_correta', 10);
      
      // Configurar mock para simular usuário encontrado
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'empresa@teste.com',
        password_hash: passwordHash,
        role: 'company',
        status: 'active'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'empresa@teste.com',
          password: 'senha_errada'
        });
      
      // Verificar resultado
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });
    
    it('should return error if account is not active', async () => {
      // Hash de senha para teste
      const passwordHash = await bcrypt.hash('senha123', 10);
      
      // Configurar mock para simular usuário encontrado mas pendente
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'empresa@teste.com',
        password_hash: passwordHash,
        role: 'company',
        status: 'pending'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'empresa@teste.com',
          password: 'senha123'
        });
      
      // Verificar resultado
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Conta pendente de aprovação ou inativa');
    });
  });
  
  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset instructions', async () => {
      // Configurar mock para simular usuário encontrado
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'empresa@teste.com'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'empresa@teste.com'
        });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Instruções de recuperação enviadas para o e-mail');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'empresa@teste.com' } });
    });
    
    it('should return error if user not found', async () => {
      // Configurar mock para simular usuário não encontrado
      User.findOne.mockResolvedValue(null);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'naoexiste@teste.com'
        });
      
      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });
  
  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // Criar token válido para teste
      const token = jwt.sign(
        { id: '123e4567-e89b-12d3-a456-426614174000' },
        process.env.JWT_SECRET || 'correspondentes_juridicos_secret',
        { expiresIn: '1h' }
      );
      
      // Configurar mock para simular usuário encontrado
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'empresa@teste.com',
        update: jest.fn().mockResolvedValue(true)
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          password: 'nova_senha123'
        });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Senha redefinida com sucesso');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(mockUser.update).toHaveBeenCalledWith({ password_hash: expect.any(String) });
    });
    
    it('should return error with invalid token', async () => {
      // Token inválido para teste
      const token = 'token_invalido';
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          password: 'nova_senha123'
        });
      
      // Verificar resultado
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token inválido ou expirado');
    });
  });
});
