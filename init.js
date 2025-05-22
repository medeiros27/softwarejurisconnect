/**
 * Scripts de inicialização do banco de dados para o Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém scripts para criar as tabelas do banco de dados e inserir dados iniciais.
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const dbConfig = require('../config/database');

// Inicializar conexão com o banco de dados
const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(dbConfig[env]);

// Importar modelos
const models = require('../models')(sequelize);

// Função para criar as tabelas
async function createTables() {
  try {
    // Sincronizar todos os modelos com o banco de dados
    await sequelize.sync({ force: true });
    console.log('Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return false;
  }
}

// Função para inserir dados iniciais
async function seedDatabase() {
  try {
    // Criar usuário administrador
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);
    
    const adminUser = await models.User.create({
      name: 'Administrador',
      email: 'admin@jurisconnect.com.br',
      password_hash,
      role: 'admin',
      status: 'active',
      phone: '(11) 99999-9999'
    });
    
    console.log('Usuário administrador criado com sucesso!');
    
    // Criar empresas de exemplo
    const companyUser1 = await models.User.create({
      name: 'Empresa Exemplo 1',
      email: 'empresa1@exemplo.com',
      password_hash: await bcrypt.hash('empresa123', salt),
      role: 'company',
      status: 'active',
      phone: '(11) 98888-8888'
    });
    
    await models.Company.create({
      user_id: companyUser1.id,
      document: '12.345.678/0001-90',
      company_name: 'Empresa Jurídica Exemplo Ltda',
      business_type: 'law_firm',
      contact_name: 'João Silva',
      monthly_volume: 'above_10',
      locations: [
        { city: 'São Paulo', state: 'SP' },
        { city: 'Rio de Janeiro', state: 'RJ' }
      ],
      products_of_interest: ['audiências', 'diligências', 'protocolos']
    });
    
    const companyUser2 = await models.User.create({
      name: 'Empresa Exemplo 2',
      email: 'empresa2@exemplo.com',
      password_hash: await bcrypt.hash('empresa123', salt),
      role: 'company',
      status: 'active',
      phone: '(21) 97777-7777'
    });
    
    await models.Company.create({
      user_id: companyUser2.id,
      document: '98.765.432/0001-10',
      company_name: 'Advocacia Corporativa S/A',
      business_type: 'law_firm',
      contact_name: 'Maria Oliveira',
      monthly_volume: '1_to_10',
      locations: [
        { city: 'Belo Horizonte', state: 'MG' },
        { city: 'Brasília', state: 'DF' }
      ],
      products_of_interest: ['audiências', 'cópias']
    });
    
    console.log('Empresas de exemplo criadas com sucesso!');
    
    // Criar correspondentes de exemplo
    const correspondentUser1 = await models.User.create({
      name: 'Correspondente Exemplo 1',
      email: 'correspondente1@exemplo.com',
      password_hash: await bcrypt.hash('corresp123', salt),
      role: 'correspondent',
      status: 'active',
      phone: '(11) 96666-6666'
    });
    
    await models.Correspondent.create({
      user_id: correspondentUser1.id,
      document: '123.456.789-00',
      oab_number: 'SP123456',
      specialties: ['cível', 'trabalhista'],
      locations: [
        { city: 'São Paulo', state: 'SP' },
        { city: 'Campinas', state: 'SP' }
      ],
      rates: {
        audiencia_conciliacao: 150.00,
        audiencia_instrucao: 250.00,
        copia_processos: 100.00,
        protocolo: 80.00
      },
      bank_info: {
        bank: 'Banco do Brasil',
        agency: '1234-5',
        account: '12345-6',
        account_type: 'corrente',
        document: '123.456.789-00'
      },
      average_rating: 4.8,
      total_services: 25
    });
    
    const correspondentUser2 = await models.User.create({
      name: 'Correspondente Exemplo 2',
      email: 'correspondente2@exemplo.com',
      password_hash: await bcrypt.hash('corresp123', salt),
      role: 'correspondent',
      status: 'active',
      phone: '(21) 95555-5555'
    });
    
    await models.Correspondent.create({
      user_id: correspondentUser2.id,
      document: '987.654.321-00',
      oab_number: 'RJ98765',
      specialties: ['cível', 'família'],
      locations: [
        { city: 'Rio de Janeiro', state: 'RJ' },
        { city: 'Niterói', state: 'RJ' }
      ],
      rates: {
        audiencia_conciliacao: 180.00,
        audiencia_instrucao: 280.00,
        copia_processos: 120.00,
        protocolo: 90.00
      },
      bank_info: {
        bank: 'Itaú',
        agency: '5678-9',
        account: '56789-0',
        account_type: 'corrente',
        document: '987.654.321-00'
      },
      average_rating: 4.5,
      total_services: 18
    });
    
    console.log('Correspondentes de exemplo criados com sucesso!');
    
    // Criar solicitações de exemplo
    const serviceRequest1 = await models.ServiceRequest.create({
      company_id: (await models.Company.findOne({ where: { user_id: companyUser1.id } })).id,
      correspondent_id: (await models.Correspondent.findOne({ where: { user_id: correspondentUser1.id } })).id,
      service_type: 'audiencia_conciliacao',
      location: { city: 'São Paulo', state: 'SP' },
      date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias no futuro
      status: 'assigned',
      company_value: 300.00,
      correspondent_value: 150.00,
      profit_margin: 150.00,
      details: 'Audiência de conciliação no processo nº 1234567-89.2023.8.26.0100',
      instructions: 'Comparecer com 30 minutos de antecedência. Levar documentos de identificação.',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 dias no futuro
    });
    
    const serviceRequest2 = await models.ServiceRequest.create({
      company_id: (await models.Company.findOne({ where: { user_id: companyUser2.id } })).id,
      service_type: 'copia_processos',
      location: { city: 'Belo Horizonte', state: 'MG' },
      date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias no futuro
      status: 'pending_approval',
      details: 'Obter cópia integral do processo nº 9876543-21.2023.8.13.0024',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 dias no futuro
    });
    
    console.log('Solicitações de exemplo criadas com sucesso!');
    
    // Criar documentos de exemplo
    await models.Document.create({
      service_request_id: serviceRequest1.id,
      type: 'instrucoes',
      file_name: 'instrucoes_audiencia.pdf',
      file_path: '/uploads/documents/instrucoes_audiencia.pdf',
      file_size: 1024 * 1024, // 1MB
      uploaded_by: adminUser.id,
      status: 'approved'
    });
    
    console.log('Documentos de exemplo criados com sucesso!');
    
    return true;
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error);
    return false;
  }
}

// Função principal para inicializar o banco de dados
async function initDatabase() {
  const tablesCreated = await createTables();
  
  if (tablesCreated) {
    const dataSeed = await seedDatabase();
    
    if (dataSeed) {
      console.log('Banco de dados inicializado com sucesso!');
    } else {
      console.error('Erro ao inserir dados iniciais.');
    }
  } else {
    console.error('Erro ao criar tabelas.');
  }
  
  // Fechar conexão
  await sequelize.close();
}

// Executar inicialização
initDatabase();

module.exports = {
  createTables,
  seedDatabase,
  initDatabase
};
