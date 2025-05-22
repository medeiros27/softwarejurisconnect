/**
 * Controladores para gerenciamento de solicitações de serviços no Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém os controladores para operações relacionadas às solicitações de serviços.
 */

const { User, Company, Correspondent, ServiceRequest, Document } = require('../models');
const { Sequelize } = require('sequelize');

// Criar nova solicitação de serviço
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      service_type,
      location,
      date_time,
      details,
      deadline
    } = req.body;

    // Verificar se o usuário é uma empresa
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Buscar a empresa do usuário
    let company;
    if (req.user.role === 'company') {
      const user = await User.findByPk(req.user.id);
      company = await Company.findOne({ where: { user_id: user.id } });
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
    } else {
      // Se for admin, verificar se a empresa_id foi fornecida
      if (!req.body.company_id) {
        return res.status(400).json({ error: 'ID da empresa é obrigatório para administradores' });
      }
      
      company = await Company.findByPk(req.body.company_id);
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
    }

    // Criar a solicitação
    const serviceRequest = await ServiceRequest.create({
      company_id: company.id,
      service_type,
      location,
      date_time: new Date(date_time),
      status: 'pending_approval',
      details,
      deadline: deadline ? new Date(deadline) : null
    });

    return res.status(201).json({
      message: 'Solicitação criada com sucesso',
      serviceRequest
    });
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Listar todas as solicitações (para administrador)
exports.getAllServiceRequests = async (req, res) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Parâmetros de filtro opcionais
    const { status, service_type, start_date, end_date } = req.query;
    
    // Construir condições de filtro
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (service_type) {
      whereConditions.service_type = service_type;
    }
    
    if (start_date && end_date) {
      whereConditions.date_time = {
        [Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      whereConditions.date_time = {
        [Sequelize.Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      whereConditions.date_time = {
        [Sequelize.Op.lte]: new Date(end_date)
      };
    }

    // Buscar solicitações com filtros
    const serviceRequests = await ServiceRequest.findAll({
      where: whereConditions,
      include: [
        {
          model: Company,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        },
        {
          model: Correspondent,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(serviceRequests);
  } catch (error) {
    console.error('Erro ao listar solicitações:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Listar solicitações de uma empresa específica
exports.getCompanyServiceRequests = async (req, res) => {
  try {
    // Verificar se o usuário é uma empresa ou administrador
    if (req.user.role !== 'company' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Determinar a empresa
    let companyId;
    if (req.user.role === 'company') {
      const user = await User.findByPk(req.user.id);
      const company = await Company.findOne({ where: { user_id: user.id } });
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      companyId = company.id;
    } else {
      // Se for admin, usar o ID da empresa fornecido
      companyId = req.params.companyId;
      
      const company = await Company.findByPk(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
    }

    // Parâmetros de filtro opcionais
    const { status, service_type } = req.query;
    
    // Construir condições de filtro
    const whereConditions = {
      company_id: companyId
    };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (service_type) {
      whereConditions.service_type = service_type;
    }

    // Buscar solicitações da empresa
    const serviceRequests = await ServiceRequest.findAll({
      where: whereConditions,
      include: [
        {
          model: Correspondent,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(serviceRequests);
  } catch (error) {
    console.error('Erro ao listar solicitações da empresa:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Listar solicitações atribuídas a um correspondente
exports.getCorrespondentServiceRequests = async (req, res) => {
  try {
    // Verificar se o usuário é um correspondente ou administrador
    if (req.user.role !== 'correspondent' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Determinar o correspondente
    let correspondentId;
    if (req.user.role === 'correspondent') {
      const user = await User.findByPk(req.user.id);
      const correspondent = await Correspondent.findOne({ where: { user_id: user.id } });
      
      if (!correspondent) {
        return res.status(404).json({ error: 'Correspondente não encontrado' });
      }
      
      correspondentId = correspondent.id;
    } else {
      // Se for admin, usar o ID do correspondente fornecido
      correspondentId = req.params.correspondentId;
      
      const correspondent = await Correspondent.findByPk(correspondentId);
      if (!correspondent) {
        return res.status(404).json({ error: 'Correspondente não encontrado' });
      }
    }

    // Parâmetros de filtro opcionais
    const { status, service_type } = req.query;
    
    // Construir condições de filtro
    const whereConditions = {
      correspondent_id: correspondentId
    };
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (service_type) {
      whereConditions.service_type = service_type;
    }

    // Buscar solicitações do correspondente
    const serviceRequests = await ServiceRequest.findAll({
      where: whereConditions,
      include: [
        {
          model: Company,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      order: [['date_time', 'ASC']]
    });

    return res.status(200).json(serviceRequests);
  } catch (error) {
    console.error('Erro ao listar solicitações do correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Obter detalhes de uma solicitação específica
exports.getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar a solicitação com relacionamentos
    const serviceRequest = await ServiceRequest.findByPk(id, {
      include: [
        {
          model: Company,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: Correspondent,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: Document
        }
      ]
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar permissões de acesso
    if (req.user.role === 'company') {
      const user = await User.findByPk(req.user.id);
      const company = await Company.findOne({ where: { user_id: user.id } });
      
      if (serviceRequest.company_id !== company.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
    } else if (req.user.role === 'correspondent') {
      const user = await User.findByPk(req.user.id);
      const correspondent = await Correspondent.findOne({ where: { user_id: user.id } });
      
      if (serviceRequest.correspondent_id !== correspondent.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
    }

    return res.status(200).json(serviceRequest);
  } catch (error) {
    console.error('Erro ao buscar detalhes da solicitação:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Atualizar status de uma solicitação
exports.updateServiceRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar status válido
    const validStatuses = [
      'pending_approval', 
      'approved', 
      'assigned', 
      'accepted', 
      'rejected', 
      'in_progress', 
      'completed', 
      'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Buscar a solicitação
    const serviceRequest = await ServiceRequest.findByPk(id);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar permissões de acesso e regras de transição de status
    if (req.user.role === 'admin') {
      // Administrador pode alterar para qualquer status
    } else if (req.user.role === 'company') {
      // Empresa só pode cancelar suas próprias solicitações
      const user = await User.findByPk(req.user.id);
      const company = await Company.findOne({ where: { user_id: user.id } });
      
      if (serviceRequest.company_id !== company.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Empresas só podem cancelar solicitações' });
      }
      
      // Verificar se a solicitação pode ser cancelada
      if (['completed', 'cancelled'].includes(serviceRequest.status)) {
        return res.status(400).json({ error: 'Não é possível cancelar uma solicitação já finalizada ou cancelada' });
      }
    } else if (req.user.role === 'correspondent') {
      // Correspondente só pode aceitar, rejeitar ou completar suas atribuições
      const user = await User.findByPk(req.user.id);
      const correspondent = await Correspondent.findOne({ where: { user_id: user.id } });
      
      if (serviceRequest.correspondent_id !== correspondent.id) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }
      
      if (!['accepted', 'rejected', 'in_progress', 'completed'].includes(status)) {
        return res.status(403).json({ error: 'Status não permitido para correspondentes' });
      }
      
      // Verificar transições válidas
      if (serviceRequest.status === 'assigned' && !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Solicitação atribuída só pode ser aceita ou rejeitada' });
      }
      
      if (serviceRequest.status === 'accepted' && status !== 'in_progress') {
        return res.status(400).json({ error: 'Solicitação aceita só pode passar para em progresso' });
      }
      
      if (serviceRequest.status === 'in_progress' && status !== 'completed') {
        return res.status(400).json({ error: 'Solicitação em progresso só pode ser completada' });
      }
    }

    // Atualizar campos específicos baseados no status
    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    // Atualizar a solicitação
    await serviceRequest.update(updateData);

    return res.status(200).json({
      message: `Status da solicitação atualizado para ${status}`,
      serviceRequest
    });
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Atribuir correspondente a uma solicitação
exports.assignCorrespondent = async (req, res) => {
  try {
    const { id } = req.params;
    const { correspondent_id, correspondent_value, instructions } = req.body;

    // Verificar se o usuário é administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Validar dados obrigatórios
    if (!correspondent_id || !correspondent_value) {
      return res.status(400).json({ error: 'ID do correspondente e valor são obrigatórios' });
    }

    // Buscar a solicitação
    const serviceRequest = await ServiceRequest.findByPk(id);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar se a solicitação está em status adequado
    if (serviceRequest.status !== 'approved') {
      return res.status(400).json({ error: 'Apenas solicitações aprovadas podem receber atribuições' });
    }

    // Verificar se o correspondente existe
    const correspondent = await Correspondent.findByPk(correspondent_id);
    if (!correspondent) {
      return res.status(404).json({ error: 'Correspondente não encontrado' });
    }

    // Verificar se o correspondente está ativo
    const user = await User.findByPk(correspondent.user_id);
    if (user.status !== 'active') {
      return res.status(400).json({ error: 'Correspondente não está ativo' });
    }

    // Calcular margem de lucro
    const profit_margin = serviceRequest.company_value - correspondent_value;

    // Atualizar a solicitação
    await serviceRequest.update({
      correspondent_id,
      correspondent_value,
      profit_margin,
      instructions: instructions || serviceRequest.instructions,
      status: 'assigned'
    });

    return res.status(200).json({
      message: 'Correspondente atribuído com sucesso',
      serviceRequest: {
        ...serviceRequest.toJSON(),
        correspondent: {
          id: correspondent.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      }
    });
  } catch (error) {
    console.error('Erro ao atribuir correspondente:', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Confirmar presença em uma solicitação
exports.confirmPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    // Verificar se o usuário é um correspondente
    if (req.user.role !== 'correspondent') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    // Buscar a solicitação
    const serviceRequest = await ServiceRequest.findByPk(id);
    if (!serviceRequest) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    // Verificar se o correspondente está atribuído a esta solicitação
    const user = await User.fi
(Content truncated due to size limit. Use line ranges to read in chunks)