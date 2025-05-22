/**
 * Testes unitários para o controlador de empresas
 * 
 * Este arquivo contém testes para validar as funcionalidades de gestão de empresas do sistema.
 */

const request = require('supertest');
const app = require('../app');
const { User, Company } = require('../models');
const authController = require('../controllers/authController');

// Mock do modelo User e Company para testes
jest.mock('../models', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  const mockCompany = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };
  
  return {
    User: mockUser,
    Company: mockCompany
  };
});

// Mock do middleware de autenticação
jest.mock('../controllers/authController', () => {
  return {
    authenticate: jest.fn((req, res, next) => {
      req.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@teste.com',
        role: 'admin'
      };
      next();
    }),
    authorize: jest.fn(() => (req, res, next) => next())
  };
});

describe('Company Controller', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  describe('GET /api/companies', () => {
    it('should list all companies', async () => {
      // Configurar mock para simular lista de empresas
      const mockCompanies = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: '123e4567-e89b-12d3-a456-426614174002',
          document: '12.345.678/0001-99',
          company_name: 'Empresa Teste 1',
          business_type: 'law_firm',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Usuário Empresa 1',
            email: 'empresa1@teste.com',
            status: 'active'
          }
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          user_id: '123e4567-e89b-12d3-a456-426614174004',
          document: '98.765.432/0001-10',
          company_name: 'Empresa Teste 2',
          business_type: 'company',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Usuário Empresa 2',
            email: 'empresa2@teste.com',
            status: 'active'
          }
        }
      ];
      
      Company.findAll.mockResolvedValue(mockCompanies);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/companies')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', mockCompanies[0].id);
      expect(response.body[1]).toHaveProperty('id', mockCompanies[1].id);
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findAll).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/companies/:id', () => {
    it('should get company details', async () => {
      // Configurar mock para simular empresa encontrada
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        document: '12.345.678/0001-99',
        company_name: 'Empresa Teste',
        business_type: 'law_firm',
        User: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Usuário Empresa',
          email: 'empresa@teste.com',
          status: 'active'
        }
      };
      
      Company.findOne.mockResolvedValue(mockCompany);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/companies/123e4567-e89b-12d3-a456-426614174001')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockCompany.id);
      expect(response.body).toHaveProperty('company_name', mockCompany.company_name);
      expect(response.body).toHaveProperty('User');
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174001' },
        include: [expect.any(Object)]
      });
    });
    
    it('should return error if company not found', async () => {
      // Configurar mock para simular empresa não encontrada
      Company.findOne.mockResolvedValue(null);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/companies/id_inexistente')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Empresa não encontrada');
    });
  });
  
  describe('PUT /api/companies/:id', () => {
    it('should update company data', async () => {
      // Configurar mocks para simular empresa e usuário encontrados
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        company_name: 'Empresa Antiga',
        business_type: 'law_firm',
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: '123e4567-e89b-12d3-a456-426614174002',
          company_name: 'Empresa Atualizada',
          business_type: 'company'
        })
      };
      
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Usuário Empresa',
        email: 'empresa@teste.com',
        status: 'active',
        phone: '11999998888',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Company.findByPk.mockResolvedValue(mockCompany);
      User.findByPk.mockResolvedValue(mockUser);
      
      // Dados para atualização
      const updateData = {
        company_name: 'Empresa Atualizada',
        business_type: 'company',
        contact_name: 'Novo Contato',
        phone: '11999997777'
      };
      
      // Executar requisição de teste
      const response = await request(app)
        .put('/api/companies/123e4567-e89b-12d3-a456-426614174001')
        .set('Authorization', 'Bearer token_valido')
        .send(updateData);
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Empresa atualizada com sucesso');
      expect(response.body).toHaveProperty('company');
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
      expect(User.findByPk).toHaveBeenCalledWith(mockCompany.user_id);
      expect(mockCompany.update).toHaveBeenCalledWith(expect.objectContaining({
        company_name: 'Empresa Atualizada',
        business_type: 'company',
        contact_name: 'Novo Contato'
      }));
      expect(mockUser.update).toHaveBeenCalledWith({ phone: '11999997777' });
    });
    
    it('should return error if company not found', async () => {
      // Configurar mock para simular empresa não encontrada
      Company.findByPk.mockResolvedValue(null);
      
      // Executar requisição de teste
      const response = await request(app)
        .put('/api/companies/id_inexistente')
        .set('Authorization', 'Bearer token_valido')
        .send({
          company_name: 'Empresa Atualizada'
        });
      
      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Empresa não encontrada');
    });
  });
  
  describe('PATCH /api/companies/:id/status', () => {
    it('should update company status', async () => {
      // Configurar mocks para simular empresa e usuário encontrados
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        toJSON: jest.fn().mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: '123e4567-e89b-12d3-a456-426614174002'
        })
      };
      
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        status: 'pending',
        update: jest.fn().mockResolvedValue(true)
      };
      
      Company.findByPk.mockResolvedValue(mockCompany);
      User.findByPk.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .patch('/api/companies/123e4567-e89b-12d3-a456-426614174001/status')
        .set('Authorization', 'Bearer token_valido')
        .send({ status: 'active' });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Status da empresa atualizado para active');
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
      expect(User.findByPk).toHaveBeenCalledWith(mockCompany.user_id);
      expect(mockUser.update).toHaveBeenCalledWith({ status: 'active' });
    });
    
    it('should return error with invalid status', async () => {
      // Executar requisição de teste com status inválido
      const response = await request(app)
        .patch('/api/companies/123e4567-e89b-12d3-a456-426614174001/status')
        .set('Authorization', 'Bearer token_valido')
        .send({ status: 'status_invalido' });
      
      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Status inválido');
    });
  });
  
  describe('DELETE /api/companies/:id', () => {
    it('should delete a company', async () => {
      // Configurar mocks para simular empresa e usuário encontrados
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Company.findByPk.mockResolvedValue(mockCompany);
      User.findByPk.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .delete('/api/companies/123e4567-e89b-12d3-a456-426614174001')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Empresa excluída com sucesso');
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174001');
      expect(User.findByPk).toHaveBeenCalledWith(mockCompany.user_id);
      expect(mockCompany.destroy).toHaveBeenCalled();
      expect(mockUser.destroy).toHaveBeenCalled();
    });
    
    it('should return error if company not found', async () => {
      // Configurar mock para simular empresa não encontrada
      Company.findByPk.mockResolvedValue(null);
      
      // Executar requisição de teste
      const response = await request(app)
        .delete('/api/companies/id_inexistente')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Empresa não encontrada');
    });
  });
  
  describe('GET /api/companies/pending', () => {
    it('should list pending companies', async () => {
      // Configurar mock para simular lista de empresas pendentes
      const mockPendingCompanies = [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          user_id: '123e4567-e89b-12d3-a456-426614174002',
          document: '12.345.678/0001-99',
          company_name: 'Empresa Pendente 1',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Usuário Pendente 1',
            email: 'pendente1@teste.com',
            status: 'pending'
          }
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174003',
          user_id: '123e4567-e89b-12d3-a456-426614174004',
          document: '98.765.432/0001-10',
          company_name: 'Empresa Pendente 2',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Usuário Pendente 2',
            email: 'pendente2@teste.com',
            status: 'pending'
          }
        }
      ];
      
      Company.findAll.mockResolvedValue(mockPendingCompanies);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/companies/pending')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', mockPendingCompanies[0].id);
      expect(response.body[1]).toHaveProperty('id', mockPendingCompanies[1].id);
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findAll).toHaveBeenCalledWith({
        include: [
          {
            model: User,
            where: { status: 'pending' },
            attributes: expect.any(Array)
          }
        ]
      });
    });
  });
});
