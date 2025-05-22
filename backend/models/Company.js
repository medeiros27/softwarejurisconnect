/**
 * models/Company.js - Modelo de empresa contratante
 * 
 * Este modelo representa uma empresa que contrata serviços de correspondentes jurídicos.
 * Está vinculado a um usuário com role 'company'.
 */

const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Por favor, informe o nome da empresa'],
    trim: true,
    maxlength: [200, 'Nome da empresa não pode ter mais de 200 caracteres']
  },
  cnpj: {
    type: String,
    required: [true, 'Por favor, informe o CNPJ'],
    unique: true,
    match: [
      /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
      'Por favor, informe um CNPJ válido no formato XX.XXX.XXX/XXXX-XX'
    ]
  },
  address: {
    street: {
      type: String,
      required: [true, 'Por favor, informe o endereço']
    },
    number: {
      type: String,
      required: [true, 'Por favor, informe o número']
    },
    complement: String,
    neighborhood: {
      type: String,
      required: [true, 'Por favor, informe o bairro']
    },
    city: {
      type: String,
      required: [true, 'Por favor, informe a cidade']
    },
    state: {
      type: String,
      required: [true, 'Por favor, informe o estado'],
      maxlength: [2, 'Use a sigla do estado com 2 caracteres']
    },
    zipCode: {
      type: String,
      required: [true, 'Por favor, informe o CEP'],
      match: [
        /^\d{5}\-\d{3}$/,
        'Por favor, informe um CEP válido no formato XXXXX-XXX'
      ]
    }
  },
  contactPerson: {
    name: {
      type: String,
      required: [true, 'Por favor, informe o nome do contato']
    },
    position: String,
    phone: String,
    email: String
  },
  legalRepresentative: {
    name: {
      type: String,
      required: [true, 'Por favor, informe o nome do representante legal']
    },
    cpf: {
      type: String,
      required: [true, 'Por favor, informe o CPF do representante legal'],
      match: [
        /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
        'Por favor, informe um CPF válido no formato XXX.XXX.XXX-XX'
      ]
    },
    phone: String,
    email: String
  },
  bankInfo: {
    bank: String,
    agency: String,
    account: String,
    accountType: {
      type: String,
      enum: ['corrente', 'poupança']
    },
    pixKey: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['contrato_social', 'procuracao', 'documento_identidade', 'outro'],
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
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pendente', 'em_analise', 'aprovado', 'rejeitado'],
    default: 'pendente'
  },
  verificationNotes: String,
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obter todas as solicitações de serviço da empresa
CompanySchema.virtual('serviceRequests', {
  ref: 'ServiceRequest',
  localField: '_id',
  foreignField: 'company',
  justOne: false
});

// Middleware para atualizar o timestamp de atualização
CompanySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Company', CompanySchema);
