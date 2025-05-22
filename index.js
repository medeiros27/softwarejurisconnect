/**
 * Modelos de dados para o Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo define os modelos principais do banco de dados usando Sequelize ORM.
 */

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  // Modelo de Usuário
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Company, { foreignKey: 'user_id' });
      User.hasOne(models.Correspondent, { foreignKey: 'user_id' });
      User.hasMany(models.Message, { foreignKey: 'sender_id', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'company', 'correspondent'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'pending',
    },
    phone: {
      type: DataTypes.STRING,
    },
    last_login: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  });

  // Modelo de Empresa
  class Company extends Model {
    static associate(models) {
      Company.belongsTo(models.User, { foreignKey: 'user_id' });
      Company.hasMany(models.ServiceRequest, { foreignKey: 'company_id' });
    }
  }
  
  Company.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    document: {
      type: DataTypes.STRING, // CPF ou CNPJ
      allowNull: false,
      unique: true,
    },
    company_name: {
      type: DataTypes.STRING,
    },
    business_type: {
      type: DataTypes.ENUM('law_firm', 'company', 'autonomous_lawyer'),
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monthly_volume: {
      type: DataTypes.ENUM('1_to_10', 'above_10'),
    },
    locations: {
      type: DataTypes.JSONB, // Array de localidades de atuação
    },
    products_of_interest: {
      type: DataTypes.JSONB, // Array de produtos de interesse
    },
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
  });

  // Modelo de Correspondente
  class Correspondent extends Model {
    static associate(models) {
      Correspondent.belongsTo(models.User, { foreignKey: 'user_id' });
      Correspondent.hasMany(models.ServiceRequest, { foreignKey: 'correspondent_id' });
      Correspondent.hasMany(models.Audit, { foreignKey: 'correspondent_id' });
    }
  }
  
  Correspondent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    document: {
      type: DataTypes.STRING, // CPF
      allowNull: false,
      unique: true,
    },
    oab_number: {
      type: DataTypes.STRING,
    },
    specialties: {
      type: DataTypes.JSONB, // Array de especialidades
    },
    locations: {
      type: DataTypes.JSONB, // Array de localidades de atuação
    },
    rates: {
      type: DataTypes.JSONB, // Valores por tipo de serviço
    },
    bank_info: {
      type: DataTypes.JSONB, // Informações bancárias
    },
    average_rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_services: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Correspondent',
    tableName: 'correspondents',
  });

  // Modelo de Solicitação de Serviço
  class ServiceRequest extends Model {
    static associate(models) {
      ServiceRequest.belongsTo(models.Company, { foreignKey: 'company_id' });
      ServiceRequest.belongsTo(models.Correspondent, { foreignKey: 'correspondent_id' });
      ServiceRequest.hasMany(models.Document, { foreignKey: 'service_request_id' });
      ServiceRequest.hasMany(models.Payment, { foreignKey: 'service_request_id' });
      ServiceRequest.hasOne(models.Audit, { foreignKey: 'service_request_id' });
    }
  }
  
  ServiceRequest.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id',
      },
    },
    correspondent_id: {
      type: DataTypes.UUID,
      references: {
        model: 'correspondents',
        key: 'id',
      },
    },
    service_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.JSONB, // Cidade/UF
      allowNull: false,
    },
    date_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending_approval', 
        'approved', 
        'assigned', 
        'accepted', 
        'rejected', 
        'in_progress', 
        'completed', 
        'cancelled'
      ),
      defaultValue: 'pending_approval',
    },
    company_value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    correspondent_value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    profit_margin: {
      type: DataTypes.DECIMAL(10, 2),
    },
    details: {
      type: DataTypes.TEXT,
    },
    instructions: {
      type: DataTypes.TEXT,
    },
    deadline: {
      type: DataTypes.DATE,
    },
    presence_confirmed_at: {
      type: DataTypes.DATE,
    },
    completed_at: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'ServiceRequest',
    tableName: 'service_requests',
  });

  // Modelo de Documento
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.ServiceRequest, { foreignKey: 'service_request_id' });
    }
  }
  
  Document.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    service_request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_requests',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
    },
    uploaded_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'documents',
  });

  // Modelo de Pagamento
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.ServiceRequest, { foreignKey: 'service_request_id' });
    }
  }
  
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    service_request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_requests',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('receivable', 'payable'),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      defaultValue: 'pending',
    },
    due_date: {
      type: DataTypes.DATE,
    },
    payment_date: {
      type: DataTypes.DATE,
    },
    payment_method: {
      type: DataTypes.STRING,
    },
    transaction_id: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  });

  // Modelo de Auditoria
  class Audit extends Model {
    static associate(models) {
      Audit.belongsTo(models.ServiceRequest, { foreignKey: 'service_request_id' });
      Audit.belongsTo(models.Correspondent, { foreignKey: 'correspondent_id' });
      Audit.belongsTo(models.User, { foreignKey: 'auditor_id' });
    }
  }
  
  Audit.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    service_request_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'service_requests',
        key: 'id',
      },
    },
    correspondent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'correspondents',
        key: 'id',
      },
    },
    auditor_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER, // 1-5
    },
    punctuality: {
      type: DataTypes.INTEGER, // 1-5
    },
    documentation_quality: {
      type: DataTypes.INTEGER, // 1-5
    },
    communication: {
      type: DataTypes.INTEGER, // 1-5
    },
    feedback: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'Audit',
    tableName: 'audits',
  });

  // Modelo de Mensagem
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
      Message.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'receiver' });
    }
  }
  
  Message.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
    },
    attachment: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
  });

  return {
    User,
    Company,
    Correspondent,
    ServiceRequest,
    Document,
    Payment,
    Audit,
    Message,
  };
};
