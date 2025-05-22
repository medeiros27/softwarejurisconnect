# Plano de Testes do Sistema de Gestão de Correspondentes Jurídicos

Este documento descreve o plano de testes para validação das funcionalidades principais do Sistema de Gestão de Correspondentes Jurídicos.

## Objetivos

- Validar todas as funcionalidades principais do sistema
- Garantir que os fluxos de trabalho estejam funcionando corretamente
- Identificar e corrigir possíveis bugs ou problemas de usabilidade
- Verificar a integração entre os diferentes módulos do sistema
- Assegurar que os requisitos funcionais e não funcionais foram atendidos

## Escopo dos Testes

### Testes de Unidade

Validação isolada de componentes e funções específicas:

1. **Autenticação e Segurança**
   - Registro de usuários
   - Login e geração de token JWT
   - Recuperação de senha
   - Controle de acesso baseado em perfis

2. **Gestão de Empresas**
   - Cadastro e edição de empresas
   - Aprovação/rejeição de cadastros
   - Listagem e filtragem de empresas

3. **Gestão de Correspondentes**
   - Cadastro e edição de correspondentes
   - Aprovação/rejeição de cadastros
   - Listagem e filtragem de correspondentes

4. **Gestão de Solicitações**
   - Criação de solicitações
   - Atribuição de correspondentes
   - Confirmação de presença
   - Entrega de documentação
   - Auditoria e avaliação

### Testes de Integração

Validação da interação entre diferentes módulos:

1. **Fluxo de Solicitação Completo**
   - Criação pela empresa
   - Aprovação pelo administrador
   - Atribuição de correspondente
   - Aceitação pelo correspondente
   - Confirmação de presença
   - Entrega de documentação
   - Auditoria e avaliação
   - Pagamento

2. **Integração entre Perfis**
   - Comunicação entre empresa e administrador
   - Comunicação entre administrador e correspondente
   - Notificações e alertas

### Testes de Interface

Validação da experiência do usuário:

1. **Responsividade**
   - Funcionamento em diferentes tamanhos de tela
   - Adaptação para dispositivos móveis

2. **Usabilidade**
   - Facilidade de navegação
   - Clareza das informações
   - Feedback visual para ações

3. **Acessibilidade**
   - Contraste adequado
   - Navegação por teclado
   - Compatibilidade com leitores de tela

### Testes de Desempenho

Validação do comportamento do sistema sob carga:

1. **Tempo de Resposta**
   - Carregamento de páginas
   - Execução de operações críticas

2. **Escalabilidade**
   - Comportamento com múltiplos usuários simultâneos
   - Gestão de grande volume de solicitações

## Metodologia de Testes

### Testes Automatizados

1. **Backend**
   - Testes unitários com Jest
   - Testes de API com Supertest
   - Cobertura mínima de 80% do código

2. **Frontend**
   - Testes de componentes com React Testing Library
   - Testes de integração com Cypress
   - Validação de fluxos principais

### Testes Manuais

1. **Testes Exploratórios**
   - Navegação livre pelo sistema
   - Identificação de problemas de usabilidade
   - Validação de fluxos alternativos

2. **Testes de Aceitação**
   - Validação com usuários reais
   - Verificação de atendimento aos requisitos
   - Feedback qualitativo

## Casos de Teste Principais

### Perfil Administrador

1. **Login e Dashboard**
   - Login com credenciais válidas
   - Visualização do dashboard administrativo
   - Acesso a todas as funcionalidades

2. **Gestão de Empresas**
   - Listagem de empresas cadastradas
   - Aprovação de novo cadastro de empresa
   - Edição de dados de empresa
   - Desativação de empresa

3. **Gestão de Correspondentes**
   - Listagem de correspondentes cadastrados
   - Aprovação de novo cadastro de correspondente
   - Edição de dados de correspondente
   - Desativação de correspondente

4. **Gestão de Solicitações**
   - Listagem de solicitações
   - Definição de valor para solicitação
   - Atribuição de correspondente
   - Acompanhamento de status
   - Auditoria de serviço concluído

5. **Relatórios e Financeiro**
   - Geração de relatório de solicitações
   - Visualização de métricas financeiras
   - Registro de pagamentos

### Perfil Empresa

1. **Login e Dashboard**
   - Login com credenciais válidas
   - Visualização do dashboard da empresa
   - Acesso às funcionalidades permitidas

2. **Solicitações**
   - Criação de nova solicitação
   - Acompanhamento de solicitações existentes
   - Cancelamento de solicitação
   - Visualização de documentação entregue

3. **Relatórios**
   - Visualização de histórico de solicitações
   - Exportação de relatórios

### Perfil Correspondente

1. **Login e Dashboard**
   - Login com credenciais válidas
   - Visualização do dashboard do correspondente
   - Acesso às funcionalidades permitidas

2. **Atribuições**
   - Visualização de novas atribuições
   - Aceitação/rejeição de atribuição
   - Visualização de agenda de serviços

3. **Execução de Serviços**
   - Confirmação de presença
   - Upload de documentação
   - Visualização de avaliações recebidas

## Scripts de Teste

### Backend

```javascript
// Exemplo de teste de autenticação
const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Teste Empresa',
        email: 'teste@empresa.com',
        password: 'senha123',
        role: 'company',
        document: '12.345.678/0001-99',
        company_name: 'Empresa Teste Ltda',
        business_type: 'law_firm',
        contact_name: 'Contato Teste'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste@empresa.com',
        password: 'senha123'
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

// Exemplo de teste de solicitações
describe('Service Request API', () => {
  let token;
  let requestId;

  beforeAll(async () => {
    // Login para obter token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@jurisconnect.com.br',
        password: 'admin123'
      });
    
    token = res.body.token;
  });

  it('should create a new service request', async () => {
    const res = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_id: '1',
        service_type: 'audiencia_conciliacao',
        location: { city: 'São Paulo', state: 'SP' },
        date_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        details: 'Teste de solicitação'
      });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('serviceRequest');
    requestId = res.body.serviceRequest.id;
  });

  it('should set value for a service request', async () => {
    const res = await request(app)
      .patch(`/api/service-requests/${requestId}/value`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_value: 300.00
      });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.serviceRequest.status).toEqual('approved');
  });
});
```

## Ambiente de Testes

1. **Ambiente de Desenvolvimento**
   - Banco de dados local
   - Dados de teste controlados
   - Execução de testes automatizados

2. **Ambiente de Homologação**
   - Configuração similar à produção
   - Dados representativos do mundo real
   - Testes de aceitação com usuários

## Critérios de Aceitação

1. **Funcionalidade**
   - Todas as funcionalidades principais devem funcionar conforme especificado
   - Fluxos de trabalho completos devem ser executados sem erros

2. **Usabilidade**
   - Interface deve ser intuitiva e fácil de usar
   - Feedback adequado para todas as ações do usuário

3. **Desempenho**
   - Tempo de resposta aceitável para operações comuns
   - Sistema deve suportar múltiplos usuários simultâneos

4. **Segurança**
   - Controle de acesso efetivo
   - Proteção de dados sensíveis

## Cronograma de Testes

1. **Semana 1: Testes Unitários**
   - Implementação de testes automatizados
   - Validação de componentes isolados

2. **Semana 2: Testes de Integração**
   - Validação de fluxos completos
   - Testes de API end-to-end

3. **Semana 3: Testes de Interface e Usabilidade**
   - Validação da experiência do usuário
   - Testes exploratórios

4. **Semana 4: Testes de Aceitação**
   - Validação com usuários reais
   - Ajustes finais baseados em feedback

## Relatórios de Teste

Os resultados dos testes serão documentados em relatórios contendo:

1. **Resumo Executivo**
   - Visão geral dos testes realizados
   - Métricas principais (taxa de sucesso, cobertura)

2. **Detalhamento de Testes**
   - Lista de casos de teste executados
   - Resultados obtidos
   - Evidências (screenshots, logs)

3. **Bugs e Problemas**
   - Descrição detalhada de problemas encontrados
   - Severidade e prioridade
   - Status de correção

4. **Recomendações**
   - Sugestões de melhorias
   - Áreas que necessitam atenção

## Próximos Passos

Após a conclusão dos testes:

1. Correção de bugs e problemas identificados
2. Refinamento da interface baseado em feedback
3. Preparação para implantação em produção
4. Elaboração de documentação final e materiais de treinamento
