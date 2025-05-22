/**
 * controllers/serviceController.js - Controlador de solicitações de serviço
 * 
 * Este controlador gerencia as operações relacionadas às solicitações de serviço,
 * como criação, atribuição a correspondentes, atualização de status, etc.
 */

const ServiceRequest = require('../models/ServiceRequest');
const Company = require('../models/Company');
const Correspondent = require('../models/Correspondent');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const mongoose = require('mongoose');

/**
 * @desc    Obtém todas as solicitações de serviço
 * @route   GET /api/services
 * @access  Private/Admin
 */
exports.getServiceRequests = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Obtém uma solicitação de serviço específica
 * @route   GET /api/services/:id
 * @access  Private
 */
exports.getServiceRequest = asyncHandler(async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id)
    .populate({
      path: 'company',
      select: 'companyName cnpj contactPerson',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    })
    .populate({
      path: 'correspondent',
      select: 'fullName oab contactInfo',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    });

  if (!serviceRequest) {
    return next(new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404));
  }

  // Verifica permissão de acesso
  if (req.user.role !== 'admin') {
    // Se for empresa, verifica se a solicitação pertence a ela
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company._id.toString() !== company._id.toString()) {
        return next(new ErrorResponse('Não autorizado a acessar esta solicitação', 403));
      }
    }
    
    // Se for correspondente, verifica se a solicitação está atribuída a ele
    if (req.user.role === 'correspondent') {
      const correspondent = await Correspondent.findOne({ user: req.user.id });
      
      if (!correspondent || 
          !serviceRequest.correspondent || 
          serviceRequest.correspondent._id.toString() !== correspondent._id.toString()) {
        return next(new ErrorResponse('Não autorizado a acessar esta solicitação', 403));
      }
    }
  }

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

/**
 * @desc    Cria uma nova solicitação de serviço
 * @route   POST /api/services
 * @access  Private/Company
 */
exports.createServiceRequest = asyncHandler(async (req, res, next) => {
  // Verifica se o usuário é uma empresa
  if (req.user.role !== 'company') {
    return next(new ErrorResponse('Apenas empresas podem criar solicitações de serviço', 403));
  }

  // Obtém a empresa do usuário
  const company = await Company.findOne({ user: req.user.id });
  if (!company) {
    return next(new ErrorResponse('Perfil de empresa não encontrado', 404));
  }

  // Adiciona a empresa à solicitação
  req.body.company = company._id;

  // Cria a solicitação
  const serviceRequest = await ServiceRequest.create(req.body);

  // Adiciona o histórico de status inicial
  serviceRequest.statusHistory.push({
    status: 'aberta',
    date: Date.now(),
    notes: 'Solicitação criada',
    updatedBy: req.user.id
  });

  await serviceRequest.save();

  // Notifica administradores sobre a nova solicitação
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    try {
      await sendEmail({
        email: admin.email,
        subject: 'Nova solicitação de serviço - JurisConnect',
        message: `Uma nova solicitação de serviço foi criada pela empresa ${company.companyName}. ID da solicitação: ${serviceRequest._id}`
      });
    } catch (err) {
      console.error(`Erro ao enviar email para ${admin.email}:`, err);
    }
  }

  res.status(201).json({
    success: true,
    data: serviceRequest
  });
});

/**
 * @desc    Atualiza uma solicitação de serviço
 * @route   PUT /api/services/:id
 * @access  Private
 */
exports.updateServiceRequest = asyncHandler(async (req, res, next) => {
  let serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404));
  }

  // Verifica permissão de acesso
  if (req.user.role !== 'admin') {
    // Se for empresa, verifica se a solicitação pertence a ela
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company.toString() !== company._id.toString()) {
        return next(new ErrorResponse('Não autorizado a atualizar esta solicitação', 403));
      }
      
      // Empresas só podem atualizar solicitações em determinados status
      if (!['aberta', 'em_analise'].includes(serviceRequest.status)) {
        return next(new ErrorResponse('Não é possível atualizar uma solicitação que já foi atribuída ou concluída', 400));
      }
      
      // Limita os campos que a empresa pode atualizar
      const allowedFields = ['title', 'description', 'serviceType', 'serviceArea', 'processNumber', 
                            'clientName', 'clientDocument', 'opposingParty', 'urgency', 'deadline', 
                            'scheduledDate', 'scheduledTime', 'notes'];
      
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
    }
    
    // Se for correspondente, verifica se a solicitação está atribuída a ele
    if (req.user.role === 'correspondent') {
      const correspondent = await Correspondent.findOne({ user: req.user.id });
      
      if (!correspondent || 
          !serviceRequest.correspondent || 
          serviceRequest.correspondent.toString() !== correspondent._id.toString()) {
        return next(new ErrorResponse('Não autorizado a atualizar esta solicitação', 403));
      }
      
      // Correspondentes só podem atualizar solicitações em determinados status
      if (!['atribuida', 'em_andamento'].includes(serviceRequest.status)) {
        return next(new ErrorResponse('Não é possível atualizar uma solicitação que não está atribuída a você', 400));
      }
      
      // Limita os campos que o correspondente pode atualizar
      const allowedFields = ['status', 'notes', 'completionReport'];
      
      Object.keys(req.body).forEach(key => {
        if (!allowedFields.includes(key)) {
          delete req.body[key];
        }
      });
      
      // Se estiver alterando o status para 'concluida', verifica se o relatório foi preenchido
      if (req.body.status === 'concluida' && (!req.body.completionReport || !req.body.completionReport.content)) {
        return next(new ErrorResponse('É necessário preencher o relatório de conclusão', 400));
      }
    }
  }

  // Se estiver alterando o status, adiciona ao histórico
  if (req.body.status && req.body.status !== serviceRequest.status) {
    req.body.statusHistory = serviceRequest.statusHistory || [];
    req.body.statusHistory.push({
      status: req.body.status,
      date: Date.now(),
      notes: req.body.statusNotes || `Status alterado para ${req.body.status}`,
      updatedBy: req.user.id
    });
  }

  // Atualiza a solicitação
  serviceRequest = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Envia notificações conforme o status
  if (req.body.status) {
    // Notifica a empresa se o status foi alterado para 'atribuida', 'concluida' ou 'rejeitada'
    if (['atribuida', 'concluida', 'rejeitada'].includes(req.body.status)) {
      const company = await Company.findById(serviceRequest.company).populate('user');
      
      if (company && company.user) {
        try {
          await sendEmail({
            email: company.user.email,
            subject: `Atualização de solicitação - JurisConnect`,
            message: `Sua solicitação "${serviceRequest.title}" foi atualizada para o status: ${req.body.status}`
          });
        } catch (err) {
          console.error(`Erro ao enviar email para ${company.user.email}:`, err);
        }
      }
    }
    
    // Notifica o correspondente se o status foi alterado para 'atribuida'
    if (req.body.status === 'atribuida' && serviceRequest.correspondent) {
      const correspondent = await Correspondent.findById(serviceRequest.correspondent).populate('user');
      
      if (correspondent && correspondent.user) {
        try {
          await sendEmail({
            email: correspondent.user.email,
            subject: `Nova solicitação atribuída - JurisConnect`,
            message: `Uma nova solicitação "${serviceRequest.title}" foi atribuída a você. Por favor, acesse o sistema para mais detalhes.`
          });
        } catch (err) {
          console.error(`Erro ao enviar email para ${correspondent.user.email}:`, err);
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

/**
 * @desc    Atribui uma solicitação a um correspondente
 * @route   PUT /api/services/:id/assign/:correspondentId
 * @access  Private/Admin
 */
exports.assignServiceRequest = asyncHandler(async (req, res, next) => {
  // Verifica se o usuário é admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Apenas administradores podem atribuir solicitações', 403));
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    return next(new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404));
  }

  // Verifica se a solicitação já está atribuída
  if (serviceRequest.correspondent) {
    return next(new ErrorResponse('Esta solicitação já está atribuída a um correspondente', 400));
  }

  // Verifica se o status permite atribuição
  if (!['aberta', 'em_analise'].includes(serviceRequest.status)) {
    return next(new ErrorResponse(`Não é possível atribuir uma solicitação com status ${serviceRequest.status}`, 400));
  }

  // Verifica se o correspondente existe
  const correspondent = await Correspondent.findById(req.params.correspondentId);
  if (!correspondent) {
    return next(new ErrorResponse(`Correspondente não encontrado com id ${req.params.correspondentId}`, 404));
  }

  // Verifica se o correspondente está disponível
  if (correspondent.availability === 'indisponível') {
    return next(new ErrorResponse('Este correspondente está indisponível no momento', 400));
  }

  // Verifica se o correspondente atende à área da solicitação
  if (!correspondent.isAvailableFor(serviceRequest.serviceArea.city, serviceRequest.serviceArea.state)) {
    return next(new ErrorResponse('Este correspondente não atende à área da solicitação', 400));
  }

  // Define o valor a ser pago ao correspondente
  const correspondentValue = req.body.correspondentValue;
  if (!correspondentValue || correspondentValue <= 0) {
    return next(new ErrorResponse('É necessário definir um valor válido para o correspondente', 400));
  }

  if (correspondentValue >= serviceRequest.companyValue) {
    return next(new ErrorResponse('O valor do correspondente não pode ser maior ou igual ao valor da empresa', 400));
  }

  // Atualiza a solicitação
  serviceRequest.correspondent = correspondent._id;
  serviceRequest.correspondentValue = correspondentValue;
  serviceRequest.status = 'atribuida';
  serviceRequest.statusHistory.push({
    status: 'atribuida',
    date: Date.now(),
    notes: `Solicitação atribuída ao correspondente ${correspondent.fullName}`,
    updatedBy: req.user.id
  });

  await serviceRequest.save();

  // Notifica o correspondente
  const correspondentUser = await User.findById(correspondent.user);
  if (correspondentUser) {
    try {
      await sendEmail({
        email: correspondentUser.email,
        subject: 'Nova solicitação atribuída - JurisConnect',
        message: `Uma nova solicitação "${serviceRequest.title}" foi atribuída a você. Por favor, acesse o sistema para mais detalhes.`
      });
    } catch (err) {
      console.error(`Erro ao enviar email para ${correspondentUser.email}:`, err);
    }
  }

  // Notifica a empresa
  const company = await Company.findById(serviceRequest.company);
  const companyUser = await User.findById(company.user);
  if (companyUser) {
    try {
      await sendEmail({
        email: companyUser.email,
        subject: 'Solicitação atribuída - JurisConnect',
        message: `Sua solicitação "${serviceRequest.title}" foi atribuída a um correspondente e está em andamento.`
      });
    } catch (err) {
      console.error(`Erro ao enviar email para ${companyUser.email}:`, err);
    }
  }

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

/**
 * @desc    Cancela uma solicitação de serviço
 * @route   PUT /api/services/:id/cancel
 * @access  Private
 */
exports.cancelServiceRequest = asyncHandler(async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404));
  }

  // Verifica permissão de acesso
  if (req.user.role !== 'admin') {
    // Se for empresa, verifica se a solicitação pertence a ela
    if (req.user.role === 'company') {
      const company = await Company.findOne({ user: req.user.id });
      
      if (!company || serviceRequest.company.toString() !== company._id.toString()) {
        return next(new ErrorResponse('Não autorizado a cancelar esta solicitação', 403));
      }
    } else {
      return next(new ErrorResponse('Apenas empresas e administradores podem cancelar solicitações', 403));
    }
  }

  // Verifica se a solicitação já está concluída ou cancelada
  if (['concluida', 'cancelada'].includes(serviceRequest.status)) {
    return next(new ErrorResponse(`Não é possível cancelar uma solicitação com status ${serviceRequest.status}`, 400));
  }

  // Atualiza o status para cancelada
  serviceRequest.status = 'cancelada';
  serviceRequest.statusHistory.push({
    status: 'cancelada',
    date: Date.now(),
    notes: req.body.notes || 'Solicitação cancelada',
    updatedBy: req.user.id
  });

  await serviceRequest.save();

  // Notifica o correspondente, se houver
  if (serviceRequest.correspondent) {
    const correspondent = await Correspondent.findById(serviceRequest.correspondent);
    const correspondentUser = await User.findById(correspondent.user);
    
    if (correspondentUser) {
      try {
        await sendEmail({
          email: correspondentUser.email,
          subject: 'Solicitação cancelada - JurisConnect',
          message: `A solicitação "${serviceRequest.title}" foi cancelada.`
        });
      } catch (err) {
        console.error(`Erro ao enviar email para ${correspondentUser.email}:`, err);
      }
    }
  }

  res.status(200).json({
    success: true,
    data: serviceRequest
  });
});

/**
 * @desc    Aprova o relatório de conclusão de uma solicitação
 * @route   PUT /api/services/:id/approve-report
 * @access  Private/Company
 */
exports.approveCompletionReport = asyncHandler(async (req, res, next) => {
  const serviceRequest = await ServiceRequest.findById(req.params.id);

  if (!serviceRequest) {
    return next(new ErrorResponse(`Solicitação não encontrada com id ${req.params.id}`, 404));
  }

  // Verifica permissão de acesso
  let isCompany = false;
  
  if (req.user.role === 'company') {
    const company = await Company.findOne({ user: req.user.id });
    
    if (!company || serviceRequest.company.toString() !== company._id.toString()) {
      return next(new ErrorResponse('Não autorizado a aprovar o relató
(Content truncated due to size limit. Use line ranges to read in chunks)