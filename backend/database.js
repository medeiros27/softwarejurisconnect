/**
 * Configuração do banco de dados para o Sistema de Gestão de Correspondentes Jurídicos
 * 
 * Este arquivo contém as configurações de conexão com o banco de dados PostgreSQL
 * e as configurações do Sequelize ORM.
 */

module.exports = {
  development: {
    username: 'postgres',
    password: 'postgres',
    database: 'correspondentes_juridicos_dev',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
  test: {
    username: 'postgres',
    password: 'postgres',
    database: 'correspondentes_juridicos_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
