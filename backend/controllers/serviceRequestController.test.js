/**
 * Testes unitários para o controlador de solicitações de serviços
 * 
 * Este arquivo contém testes para validar as funcionalidades de gestão de solicitações do sistema.
 */

const request = require('supertest');
const app = require('../app');
const { User, Company, Correspondent, ServiceRequest } = require('../models');
const authController = require('../controllers/authController');

// Mock dos modelos para testes
jest.mock('../models', () => {
  const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn()
  };
  
  const mockCompany = {
    findOne: jest.fn(),
    findByPk: jest.fn()
  };
  
  const mockCorrespondent = {
    findOne: jest.fn(),
    findByPk: jest.fn()
  };
  
  const mockServiceRequest = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  };
  
  return {
    User: mockUser,
    Company: mockCompany,
    Correspondent: mockCorrespondent,
    ServiceRequest: mockServiceRequest
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

describe('Service Request Controller', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });
  
  describe('POST /api/service-requests', () => {
    it('should create a new service request as admin', async () => {
      // Configurar mocks para simular empresa encontrada
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001'
      };
      
      Company.findByPk.mockResolvedValue(mockCompany);
      
      // Configurar mock para simular criação de solicitação
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        company_id: mockCompany.id,
        service_type: 'audiencia_conciliacao',
        location: { city: 'São Paulo', state: 'SP' },
        date_time: new Date(),
        status: 'pending_approval'
      };
      
      ServiceRequest.create.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/service-requests')
        .set('Authorization', 'Bearer token_valido')
        .send({
          company_id: mockCompany.id,
          service_type: 'audiencia_conciliacao',
          location: { city: 'São Paulo', state: 'SP' },
          date_time: new Date(),
          details: 'Detalhes da solicitação'
        });
      
      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Solicitação criada com sucesso');
      expect(response.body).toHaveProperty('serviceRequest');
      expect(response.body.serviceRequest).toHaveProperty('id', mockServiceRequest.id);
      
      // Verificar se os mocks foram chamados corretamente
      expect(Company.findByPk).toHaveBeenCalledWith(mockCompany.id);
      expect(ServiceRequest.create).toHaveBeenCalledWith(expect.objectContaining({
        company_id: mockCompany.id,
        service_type: 'audiencia_conciliacao',
        status: 'pending_approval'
      }));
    });
    
    it('should create a new service request as company', async () => {
      // Alterar o mock de autenticação para simular usuário empresa
      authController.authenticate.mockImplementationOnce((req, res, next) => {
        req.user = {
          id: '123e4567-e89b-12d3-a456-426614174002',
          email: 'empresa@teste.com',
          role: 'company'
        };
        next();
      });
      
      // Configurar mocks para simular usuário e empresa encontrados
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174002'
      };
      
      const mockCompany = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        user_id: mockUser.id
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      Company.findOne.mockResolvedValue(mockCompany);
      
      // Configurar mock para simular criação de solicitação
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        company_id: mockCompany.id,
        service_type: 'audiencia_conciliacao',
        location: { city: 'São Paulo', state: 'SP' },
        date_time: new Date(),
        status: 'pending_approval'
      };
      
      ServiceRequest.create.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .post('/api/service-requests')
        .set('Authorization', 'Bearer token_valido')
        .send({
          service_type: 'audiencia_conciliacao',
          location: { city: 'São Paulo', state: 'SP' },
          date_time: new Date(),
          details: 'Detalhes da solicitação'
        });
      
      // Verificar resultado
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Solicitação criada com sucesso');
      expect(response.body).toHaveProperty('serviceRequest');
      
      // Verificar se os mocks foram chamados corretamente
      expect(User.findByPk).toHaveBeenCalledWith(mockUser.id);
      expect(Company.findOne).toHaveBeenCalledWith({ where: { user_id: mockUser.id } });
      expect(ServiceRequest.create).toHaveBeenCalledWith(expect.objectContaining({
        company_id: mockCompany.id,
        service_type: 'audiencia_conciliacao',
        status: 'pending_approval'
      }));
    });
  });
  
  describe('GET /api/service-requests', () => {
    it('should list all service requests for admin', async () => {
      // Configurar mock para simular lista de solicitações
      const mockServiceRequests = [
        {
          id: '123e4567-e89b-12d3-a456-426614174005',
          company_id: '123e4567-e89b-12d3-a456-426614174001',
          correspondent_id: '123e4567-e89b-12d3-a456-426614174003',
          service_type: 'audiencia_conciliacao',
          location: { city: 'São Paulo', state: 'SP' },
          date_time: new Date(),
          status: 'assigned',
          Company: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            company_name: 'Empresa Teste',
            User: {
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Usuário Empresa',
              email: 'empresa@teste.com'
            }
          },
          Correspondent: {
            id: '123e4567-e89b-12d3-a456-426614174003',
            User: {
              id: '123e4567-e89b-12d3-a456-426614174004',
              name: 'Usuário Correspondente',
              email: 'correspondente@teste.com'
            }
          }
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174006',
          company_id: '123e4567-e89b-12d3-a456-426614174001',
          service_type: 'copia_processos',
          location: { city: 'Rio de Janeiro', state: 'RJ' },
          date_time: new Date(),
          status: 'pending_approval',
          Company: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            company_name: 'Empresa Teste',
            User: {
              id: '123e4567-e89b-12d3-a456-426614174002',
              name: 'Usuário Empresa',
              email: 'empresa@teste.com'
            }
          }
        }
      ];
      
      ServiceRequest.findAll.mockResolvedValue(mockServiceRequests);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/service-requests')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', mockServiceRequests[0].id);
      expect(response.body[1]).toHaveProperty('id', mockServiceRequests[1].id);
      
      // Verificar se os mocks foram chamados corretamente
      expect(ServiceRequest.findAll).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/service-requests/:id', () => {
    it('should get service request details', async () => {
      // Configurar mock para simular solicitação encontrada
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        company_id: '123e4567-e89b-12d3-a456-426614174001',
        correspondent_id: '123e4567-e89b-12d3-a456-426614174003',
        service_type: 'audiencia_conciliacao',
        location: { city: 'São Paulo', state: 'SP' },
        date_time: new Date(),
        status: 'assigned',
        Company: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          company_name: 'Empresa Teste',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Usuário Empresa',
            email: 'empresa@teste.com'
          }
        },
        Correspondent: {
          id: '123e4567-e89b-12d3-a456-426614174003',
          User: {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Usuário Correspondente',
            email: 'correspondente@teste.com'
          }
        },
        Documents: []
      };
      
      ServiceRequest.findByPk.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/service-requests/123e4567-e89b-12d3-a456-426614174005')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', mockServiceRequest.id);
      expect(response.body).toHaveProperty('Company');
      expect(response.body).toHaveProperty('Correspondent');
      
      // Verificar se os mocks foram chamados corretamente
      expect(ServiceRequest.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174005', expect.any(Object));
    });
    
    it('should return error if service request not found', async () => {
      // Configurar mock para simular solicitação não encontrada
      ServiceRequest.findByPk.mockResolvedValue(null);
      
      // Executar requisição de teste
      const response = await request(app)
        .get('/api/service-requests/id_inexistente')
        .set('Authorization', 'Bearer token_valido');
      
      // Verificar resultado
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Solicitação não encontrada');
    });
  });
  
  describe('PATCH /api/service-requests/:id/value', () => {
    it('should set value for a service request', async () => {
      // Configurar mock para simular solicitação encontrada
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        status: 'pending_approval',
        update: jest.fn().mockResolvedValue(true)
      };
      
      ServiceRequest.findByPk.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .patch('/api/service-requests/123e4567-e89b-12d3-a456-426614174005/value')
        .set('Authorization', 'Bearer token_valido')
        .send({ company_value: 300.00 });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Valor definido e solicitação aprovada com sucesso');
      
      // Verificar se os mocks foram chamados corretamente
      expect(ServiceRequest.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174005');
      expect(mockServiceRequest.update).toHaveBeenCalledWith({
        company_value: 300.00,
        status: 'approved'
      });
    });
    
    it('should return error if service request not in pending status', async () => {
      // Configurar mock para simular solicitação já aprovada
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        status: 'approved'
      };
      
      ServiceRequest.findByPk.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .patch('/api/service-requests/123e4567-e89b-12d3-a456-426614174005/value')
        .set('Authorization', 'Bearer token_valido')
        .send({ company_value: 300.00 });
      
      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Apenas solicitações pendentes podem ter valor definido');
    });
  });
  
  describe('PATCH /api/service-requests/:id/assign', () => {
    it('should assign correspondent to a service request', async () => {
      // Configurar mocks para simular solicitação e correspondente encontrados
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        status: 'approved',
        company_value: 300.00,
        update: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: '123e4567-e89b-12d3-a456-426614174005',
          status: 'assigned',
          company_value: 300.00,
          correspondent_id: '123e4567-e89b-12d3-a456-426614174003',
          correspondent_value: 150.00,
          profit_margin: 150.00
        })
      };
      
      const mockCorrespondent = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        user_id: '123e4567-e89b-12d3-a456-426614174004'
      };
      
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174004',
        name: 'Usuário Correspondente',
        email: 'correspondente@teste.com',
        status: 'active'
      };
      
      ServiceRequest.findByPk.mockResolvedValue(mockServiceRequest);
      Correspondent.findByPk.mockResolvedValue(mockCorrespondent);
      User.findByPk.mockResolvedValue(mockUser);
      
      // Executar requisição de teste
      const response = await request(app)
        .patch('/api/service-requests/123e4567-e89b-12d3-a456-426614174005/assign')
        .set('Authorization', 'Bearer token_valido')
        .send({
          correspondent_id: mockCorrespondent.id,
          correspondent_value: 150.00,
          instructions: 'Instruções para o correspondente'
        });
      
      // Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Correspondente atribuído com sucesso');
      expect(response.body).toHaveProperty('serviceRequest');
      
      // Verificar se os mocks foram chamados corretamente
      expect(ServiceRequest.findByPk).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174005');
      expect(Correspondent.findByPk).toHaveBeenCalledWith(mockCorrespondent.id);
      expect(User.findByPk).toHaveBeenCalledWith(mockCorrespondent.user_id);
      expect(mockServiceRequest.update).toHaveBeenCalledWith(expect.objectContaining({
        correspondent_id: mockCorrespondent.id,
        correspondent_value: 150.00,
        profit_margin: 150.00,
        status: 'assigned'
      }));
    });
    
    it('should return error if service request not in approved status', async () => {
      // Configurar mock para simular solicitação em status inadequado
      const mockServiceRequest = {
        id: '123e4567-e89b-12d3-a456-426614174005',
        status: 'pending_approval'
      };
      
      ServiceRequest.findByPk.mockResolvedValue(mockServiceRequest);
      
      // Executar requisição de teste
      const response = await request(app)
        .patch('/api/service-requests/123e4567-e89b-12d3-a456-426614174005/assign')
        .set('Authorization', 'Bearer token_valido')
        .send({
          correspondent_id: '123e4567-e89b-12d3-a456-426614174003',
          correspondent_value: 150.00
        });
      
      // Verificar resultado
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Apenas solicitações aprovadas podem receber a
(Content truncated due to size limit. Use line ranges to read in chunks)