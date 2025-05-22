# Estrutura de Pastas e Arquivos do Sistema de Gestão de Correspondentes Jurídicos

```
jurisconnect/
│
├── server.js                 # Arquivo principal do servidor
├── package.json              # Configurações e dependências do projeto
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos a serem ignorados pelo git
│
├── config/                   # Configurações do sistema
│   ├── database.js           # Configuração de conexão com o banco de dados
│   ├── auth.js               # Configuração de autenticação JWT
│   └── email.js              # Configuração de envio de emails
│
├── models/                   # Modelos de dados
│   ├── User.js               # Modelo de usuário (comum a todos os perfis)
│   ├── Company.js            # Modelo de empresa contratante
│   ├── Correspondent.js      # Modelo de correspondente jurídico
│   ├── ServiceRequest.js     # Modelo de solicitação de serviço
│   ├── Document.js           # Modelo de documentos
│   ├── Payment.js            # Modelo de pagamentos
│   └── Notification.js       # Modelo de notificações
│
├── controllers/              # Controladores da aplicação
│   ├── authController.js     # Controlador de autenticação
│   ├── userController.js     # Controlador de usuários
│   ├── companyController.js  # Controlador de empresas
│   ├── correspondentController.js # Controlador de correspondentes
│   ├── serviceController.js  # Controlador de solicitações de serviço
│   ├── documentController.js # Controlador de documentos
│   ├── paymentController.js  # Controlador de pagamentos
│   └── dashboardController.js # Controlador do dashboard
│
├── routes/                   # Rotas da API
│   ├── authRoutes.js         # Rotas de autenticação
│   ├── userRoutes.js         # Rotas de usuários
│   ├── companyRoutes.js      # Rotas de empresas
│   ├── correspondentRoutes.js # Rotas de correspondentes
│   ├── serviceRoutes.js      # Rotas de solicitações de serviço
│   ├── documentRoutes.js     # Rotas de documentos
│   ├── paymentRoutes.js      # Rotas de pagamentos
│   └── dashboardRoutes.js    # Rotas do dashboard
│
├── middleware/               # Middlewares da aplicação
│   ├── auth.js               # Middleware de autenticação
│   ├── validation.js         # Middleware de validação de dados
│   ├── errorHandler.js       # Middleware de tratamento de erros
│   └── upload.js             # Middleware de upload de arquivos
│
├── utils/                    # Utilitários
│   ├── validators.js         # Funções de validação
│   ├── emailTemplates.js     # Templates de email
│   ├── pdfGenerator.js       # Gerador de PDFs
│   └── logger.js             # Sistema de logs
│
├── public/                   # Arquivos estáticos
│   ├── css/                  # Estilos CSS
│   ├── js/                   # Scripts JavaScript
│   ├── img/                  # Imagens
│   │   └── logos/            # Logotipos do sistema
│   └── uploads/              # Uploads de arquivos
│       ├── documents/        # Documentos enviados
│       └── profiles/         # Fotos de perfil
│
├── views/                    # Views (para renderização no servidor)
│   ├── emails/               # Templates de email
│   └── pdf/                  # Templates de PDF
│
└── database/                 # Scripts de banco de dados
    ├── migrations/           # Migrações do banco de dados
    └── seeds/                # Seeds para popular o banco com dados iniciais
```

Esta estrutura segue as melhores práticas para aplicações Node.js, organizando o código de forma modular e escalável. Cada componente tem uma responsabilidade específica, facilitando a manutenção e expansão do sistema.
