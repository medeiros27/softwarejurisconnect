/**
 * models/Correspondent.js - Modelo de correspondente jurídico
 * 
 * Este modelo representa um correspondente jurídico que executa serviços
 * solicitados pelas empresas contratantes.
 * Está vinculado a um usuário com role 'correspondent'.
 */

const mongoose = require('mongoose');

const CorrespondentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Por favor, informe o nome completo'],
    trim: true,
    maxlength: [200, 'Nome não pode ter mais de 200 caracteres']
  },
  cpf: {
    type: String,
    required: [true, 'Por favor, informe o CPF'],
    unique: true,
    match: [
      /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
      'Por favor, informe um CPF válido no formato XXX.XXX.XXX-XX'
    ]
  },
  oab: {
    number: {
      type: String,
      required: [true, 'Por favor, informe o número da OAB']
    },
    state: {
      type: String,
      required: [true, 'Por favor, informe o estado da OAB'],
      maxlength: [2, 'Use a sigla do estado com 2 caracteres']
    },
    validUntil: Date
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
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Por favor, informe o telefone']
    },
    alternativePhone: String,
    email: {
      type: String,
      required: [true, 'Por favor, informe o email']
    }
  },
  bankInfo: {
    bank: {
      type: String,
      required: [true, 'Por favor, informe o banco']
    },
    agency: {
      type: String,
      required: [true, 'Por favor, informe a agência']
    },
    account: {
      type: String,
      required: [true, 'Por favor, informe a conta']
    },
    accountType: {
      type: String,
      enum: ['corrente', 'poupança'],
      required: [true, 'Por favor, informe o tipo de conta']
    },
    pixKey: String
  },
  expertise: [{
    type: String,
    enum: [
      'civil', 'trabalhista', 'criminal', 'tributário', 'administrativo',
      'previdenciário', 'ambiental', 'consumidor', 'empresarial', 'família',
      'imobiliário', 'propriedade_intelectual', 'outro'
    ]
  }],
  serviceAreas: [{
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      maxlength: [2, 'Use a sigla do estado com 2 caracteres']
    },
    radius: {
      type: Number,
      default: 50 // raio em km
    }
  }],
  documents: [{
    type: {
      type: String,
      enum: ['identidade', 'cpf', 'carteira_oab', 'comprovante_residencia', 'outro'],
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
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  availability: {
    type: String,
    enum: ['disponível', 'parcial', 'indisponível'],
    default: 'disponível'
  },
  availabilityNotes: String,
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

// Virtual para obter todos os serviços atribuídos ao correspondente
CorrespondentSchema.virtual('assignedServices', {
  ref: 'ServiceRequest',
  localField: '_id',
  foreignField: 'correspondent',
  justOne: false
});

// Middleware para atualizar o timestamp de atualização
CorrespondentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para verificar se o correspondente está disponível para uma determinada cidade/estado
CorrespondentSchema.methods.isAvailableFor = function(city, state) {
  if (this.availability === 'indisponível') {
    return false;
  }

  return this.serviceAreas.some(area =>
    area.state === state &&
    (area.city.toLowerCase() === city.toLowerCase() || area.radius > 0)
  );
};

module.exports = mongoose.model('Correspondent', CorrespondentSchema);