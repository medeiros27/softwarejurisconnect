/**
 * models/Payment.js - Modelo de pagamento
 * 
 * Este modelo representa um pagamento relacionado a uma solicitação de serviço,
 * seja da empresa para o sistema ou do sistema para o correspondente.
 */

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  paymentType: {
    type: String,
    enum: ['entrada', 'saida'],
    required: [true, 'Por favor, informe o tipo de pagamento']
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.paymentType === 'entrada';
    }
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.paymentType === 'saida';
    }
  },
  amount: {
    type: Number,
    required: [true, 'Por favor, informe o valor do pagamento'],
    min: [0, 'O valor não pode ser negativo']
  },
  status: {
    type: String,
    enum: ['pendente', 'processando', 'concluido', 'falha', 'cancelado'],
    default: 'pendente'
  },
  paymentMethod: {
    type: String,
    enum: ['pix', 'transferencia', 'boleto', 'credito', 'debito', 'outro'],
    required: [true, 'Por favor, informe o método de pagamento']
  },
  transactionId: String,
  transactionDate: Date,
  dueDate: Date,
  paymentDate: Date,
  paymentProof: {
    name: String,
    path: String,
    uploadDate: Date
  },
  notes: String,
  statusHistory: [{
    status: {
      type: String,
      enum: ['pendente', 'processando', 'concluido', 'falha', 'cancelado'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
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
PaymentSchema.pre('save', function(next) {
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

// Método para verificar se o pagamento está atrasado
PaymentSchema.methods.isOverdue = function() {
  if (['concluido', 'cancelado'].includes(this.status)) {
    return false;
  }
  
  if (!this.dueDate) {
    return false;
  }
  
  return new Date() > this.dueDate;
};

module.exports = mongoose.model('Payment', PaymentSchema);
