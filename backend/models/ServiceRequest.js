/**
 * models/ServiceRequest.js - Modelo de solicitação de serviço
 * 
 * Este modelo representa uma solicitação de serviço jurídico feita por uma empresa
 * e que pode ser atribuída a um correspondente jurídico.
 */

const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  correspondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Correspondent',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Por favor, informe o título da solicitação'],
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor, informe a descrição da solicitação'],
    maxlength: [5000, 'Descrição não pode ter mais de 5000 caracteres']
  },
  serviceType: {
    type: String,
    enum: [
      'audiencia', 'protocolo', 'diligencia', 'copia_processo',
      'despacho', 'distribuicao', 'outro'
    ],
    required: [true, 'Por favor, informe o tipo de serviço']
  },
  serviceArea: {
    city: {
      type: String,
      required: [true, 'Por favor, informe a cidade']
    },
    state: {
      type: String,
      required: [true, 'Por favor, informe o estado'],
      maxlength: [2, 'Use a sigla do estado com 2 caracteres']
    },
    court: String,
    courtSection: String,
    address: String
  },
  processNumber: {
    type: String,
    match: [
      /^\d{7}\-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/,
      'Por favor, informe um número de processo válido no formato NNNNNNN-DD.AAAA.J.TR.OOOO'
    ]
  },
  clientName: String,
  clientDocument: String,
  opposingParty: String,
  urgency: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  deadline: {
    type: Date,
    required: [true, 'Por favor, informe a data limite']
  },
  scheduledDate: Date,
  scheduledTime: String,
  status: {
    type: String,
    enum: [
      'aberta', 'em_analise', 'atribuida', 'em_andamento', 
      'concluida', 'cancelada', 'rejeitada'
    ],
    default: 'aberta'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'aberta', 'em_analise', 'atribuida', 'em_andamento', 
        'concluida', 'cancelada', 'rejeitada'
      ],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['procuracao', 'peticao', 'documento', 'outro'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  companyValue: {
    type: Number,
    required: [true, 'Por favor, informe o valor a ser pago pela empresa']
  },
  correspondentValue: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pendente', 'processando', 'pago', 'cancelado'],
    default: 'pendente'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['pix', 'transferencia', 'boleto', 'credito', 'outro']
  },
  paymentNotes: String,
  completionReport: {
    content: String,
    submissionDate: Date,
    attachments: [{
      name: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }],
    approved: {
      type: Boolean,
      default: false
    },
    approvalDate: Date,
    approvalNotes: String
  },
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: Date
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar o timestamp de atualização
ServiceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Adiciona histórico de status se o status foi alterado
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      date: Date.now(),
      notes: `Status alterado para ${this.status}`
    });
  }

  next();
});

// Método para calcular a margem de lucro
ServiceRequestSchema.methods.calculateProfit = function() {
  return this.companyValue - this.correspondentValue;
};

// Método para verificar se o serviço está atrasado
ServiceRequestSchema.methods.isOverdue = function() {
  if (['concluida', 'cancelada', 'rejeitada'].includes(this.status)) {
    return false;
  }

  return new Date() > this.deadline;
};

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);