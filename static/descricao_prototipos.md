# Protótipos de Interface do Sistema de Gestão de Correspondentes Jurídicos

## Introdução

Este documento apresenta a descrição detalhada dos protótipos de interface para o Sistema de Gestão de Correspondentes Jurídicos, seguindo o padrão visual e informacional do JurisConnect. Os protótipos foram desenvolvidos para atender aos requisitos levantados e à arquitetura definida, garantindo uma experiência de usuário intuitiva e eficiente para os três perfis principais: administrador, empresas contratantes e correspondentes jurídicos.

## Diretrizes de Design

Para manter a consistência com o JurisConnect, os protótipos seguem as seguintes diretrizes:

### Paleta de Cores
- Cor primária: Azul marinho (#1A2A3A) - Fundo principal e elementos de destaque
- Cor secundária: Azul claro (#3D8BCD) - Botões e elementos interativos
- Cor de destaque: Dourado (#D4AF37) - Elementos de ênfase e chamadas à ação
- Cor de texto: Branco (#FFFFFF) para fundos escuros e cinza escuro (#333333) para fundos claros
- Cores de status: Verde (#4CAF50) para sucesso, vermelho (#F44336) para erro, amarelo (#FFC107) para alerta

### Tipografia
- Fonte principal: Roboto para textos e elementos de interface
- Títulos: Montserrat em peso semibold para destaque
- Tamanhos: 24px para títulos principais, 18px para subtítulos, 14px para texto regular, 12px para informações secundárias

### Elementos de Interface
- Cards com cantos levemente arredondados para agrupamento de informações
- Botões com efeito de elevação sutil para indicar interatividade
- Ícones minimalistas para representar ações e categorias
- Espaçamento generoso para melhorar a legibilidade e hierarquia visual

## Protótipos por Perfil de Usuário

### 1. Interface do Administrador

#### 1.1 Dashboard Administrativo

O dashboard administrativo é a tela principal para o administrador do sistema, oferecendo uma visão geral das operações e métricas importantes.

**Elementos principais:**
- Cabeçalho com logo do sistema e menu de navegação principal
- Barra lateral com acesso rápido aos módulos do sistema
- Seção de métricas principais com cards para:
  - Total de solicitações ativas
  - Faturamento mensal
  - Margem de lucro média
  - Correspondentes ativos
- Gráfico de solicitações por status (Pendentes, Em andamento, Concluídas, Canceladas)
- Gráfico de faturamento mensal comparativo
- Lista das últimas solicitações recebidas com status e valores
- Seção de alertas para prazos próximos e pendências importantes
- Mapa de calor mostrando a distribuição geográfica de solicitações

**Fluxo de interação:**
O administrador visualiza as métricas principais e pode clicar em qualquer card para acessar informações detalhadas. Os gráficos são interativos, permitindo filtrar por período. A lista de solicitações recentes permite acesso direto a cada item para gerenciamento.

#### 1.2 Gestão de Solicitações

Esta tela permite ao administrador gerenciar todas as solicitações de serviços recebidas das empresas contratantes.

**Elementos principais:**
- Filtros avançados por status, tipo de serviço, localidade e data
- Tabela de solicitações com colunas para:
  - ID da solicitação
  - Empresa solicitante
  - Tipo de serviço
  - Localidade
  - Data e hora
  - Status atual
  - Valor cobrado da empresa
  - Valor a pagar ao correspondente
  - Margem de lucro
  - Ações disponíveis
- Botão de "Nova Solicitação" para cadastro manual
- Painel lateral para visualização rápida de detalhes ao selecionar uma solicitação
- Botões de ação para atribuir correspondente, definir valores, cancelar ou finalizar solicitação

**Fluxo de interação:**
O administrador pode filtrar as solicitações conforme necessário, visualizar detalhes ao clicar em uma linha da tabela, e realizar ações como atribuir um correspondente ou definir valores. Ao clicar em "Atribuir Correspondente", o sistema exibe uma lista de correspondentes disponíveis na localidade, com informações de avaliação e valores praticados.

#### 1.3 Atribuição de Correspondente

Esta tela é exibida quando o administrador seleciona uma solicitação e deseja atribuí-la a um correspondente.

**Elementos principais:**
- Informações da solicitação no topo (empresa, tipo de serviço, localidade, data)
- Campo para definição do valor a ser cobrado da empresa
- Lista de correspondentes disponíveis com:
  - Nome e foto
  - Avaliação média
  - Especialidades
  - Valor praticado
  - Histórico de serviços realizados
  - Disponibilidade confirmada
- Filtros para refinar a busca de correspondentes
- Campo para definição do valor a ser pago ao correspondente selecionado
- Cálculo automático da margem de lucro
- Área para inclusão de orientações específicas para o correspondente
- Botões para confirmar ou cancelar a atribuição

**Fluxo de interação:**
O administrador visualiza os correspondentes disponíveis, podendo filtrar por critérios como avaliação ou valor. Ao selecionar um correspondente, define o valor a ser pago, visualiza a margem de lucro calculada automaticamente, adiciona orientações específicas e confirma a atribuição. O sistema então notifica o correspondente selecionado.

#### 1.4 Gestão de Correspondentes

Esta tela permite ao administrador gerenciar o cadastro e avaliação dos correspondentes jurídicos.

**Elementos principais:**
- Filtros por localidade, especialidade, status e avaliação
- Tabela de correspondentes com:
  - Nome e foto
  - Localidades de atuação
  - Especialidades
  - Avaliação média
  - Quantidade de serviços realizados
  - Status (Ativo, Inativo, Pendente de aprovação)
  - Ações disponíveis
- Botão para adicionar novo correspondente
- Painel lateral para visualização rápida de detalhes ao selecionar um correspondente
- Gráfico de desempenho do correspondente selecionado
- Histórico de avaliações recebidas

**Fluxo de interação:**
O administrador pode filtrar a lista de correspondentes, visualizar detalhes completos ao selecionar um perfil, aprovar novos cadastros pendentes, ou desativar correspondentes com baixo desempenho. Ao clicar em um correspondente, o sistema exibe seu histórico completo de serviços e avaliações.

#### 1.5 Gestão Financeira

Esta tela permite ao administrador gerenciar os aspectos financeiros do sistema, incluindo valores a receber e a pagar.

**Elementos principais:**
- Dashboard financeiro com métricas de:
  - Faturamento total
  - Valores a receber
  - Valores a pagar
  - Lucro líquido
- Gráficos de desempenho financeiro por período
- Tabela de transações financeiras com:
  - ID da transação
  - Tipo (Recebimento ou Pagamento)
  - Valor
  - Entidade (Empresa ou Correspondente)
  - Solicitação relacionada
  - Status (Pendente, Pago, Atrasado)
  - Data de vencimento
  - Ações disponíveis
- Filtros por período, tipo de transação e status
- Botões para registrar pagamentos recebidos ou realizados
- Relatórios financeiros exportáveis

**Fluxo de interação:**
O administrador visualiza o panorama financeiro geral, pode filtrar transações específicas, registrar pagamentos recebidos das empresas ou realizados aos correspondentes, e gerar relatórios financeiros por período ou entidade.

#### 1.6 Auditoria e Qualidade

Esta tela permite ao administrador gerenciar a auditoria dos serviços realizados e a qualidade dos correspondentes.

**Elementos principais:**
- Filtros por correspondente, tipo de serviço e período
- Tabela de serviços concluídos aguardando auditoria
- Formulário de avaliação com:
  - Critérios objetivos (pontualidade, qualidade da documentação, etc.)
  - Campo para feedback detalhado
  - Upload de documentos auditados
  - Classificação geral (1 a 5 estrelas)
- Histórico de auditorias realizadas
- Ranking de correspondentes por qualidade
- Alertas para correspondentes com avaliações abaixo do mínimo aceitável

**Fluxo de interação:**
O administrador seleciona um serviço concluído, verifica a documentação enviada pelo correspondente, preenche o formulário de avaliação, adiciona feedback detalhado e finaliza a auditoria. O sistema atualiza automaticamente a avaliação média do correspondente e notifica-o sobre o feedback recebido.

### 2. Interface da Empresa Contratante

#### 2.1 Dashboard da Empresa

O dashboard da empresa oferece uma visão geral das solicitações e serviços contratados.

**Elementos principais:**
- Cabeçalho com logo do sistema e menu de navegação simplificado
- Cards com métricas principais:
  - Solicitações ativas
  - Solicitações concluídas no mês
  - Valor total investido
  - Economia estimada (comparado a deslocamentos próprios)
- Lista das solicitações recentes com status e próximos passos
- Calendário de audiências e diligências programadas
- Notificações de serviços concluídos e documentos disponíveis
- Acesso rápido para nova solicitação

**Fluxo de interação:**
A empresa visualiza suas métricas e solicitações ativas, podendo clicar em qualquer item para ver detalhes. O botão de "Nova Solicitação" é destacado para facilitar o acesso à funcionalidade principal.

#### 2.2 Nova Solicitação

Esta tela permite à empresa criar uma nova solicitação de serviço.

**Elementos principais:**
- Formulário de solicitação com campos para:
  - Tipo de serviço (dropdown com categorias e subcategorias)
  - Localidade (cidade/UF)
  - Data e hora do serviço
  - Detalhes específicos do serviço
  - Campo para upload de documentos relevantes
  - Instruções especiais para o correspondente
  - Prazo para entrega de relatórios/documentação
- Estimativa de valor baseada em histórico e tipo de serviço
- Termos e condições de contratação
- Botões para salvar rascunho ou enviar solicitação

**Fluxo de interação:**
A empresa preenche o formulário com todos os detalhes necessários, faz upload de documentos relevantes, visualiza a estimativa de valor (que será confirmada pelo administrador), concorda com os termos e envia a solicitação. O sistema confirma o recebimento e informa que o administrador entrará em contato para confirmar valores e detalhes.

#### 2.3 Acompanhamento de Solicitações

Esta tela permite à empresa acompanhar o status de todas as suas solicitações.

**Elementos principais:**
- Filtros por status, tipo de serviço e período
- Tabela de solicitações com:
  - ID da solicitação
  - Tipo de serviço
  - Localidade
  - Data e hora
  - Status atual com indicador visual
  - Valor
  - Ações disponíveis
- Timeline visual do progresso de cada solicitação
- Painel de detalhes ao selecionar uma solicitação
- Área para comunicação direta com o administrador
- Acesso aos documentos e relatórios entregues

**Fluxo de interação:**
A empresa filtra suas solicitações conforme necessário, visualiza o status atual de cada uma, e pode acessar detalhes completos ao selecionar um item específico. Para solicitações concluídas, pode baixar documentos e relatórios entregues pelo correspondente.

#### 2.4 Histórico e Relatórios

Esta tela permite à empresa visualizar seu histórico completo de contratações e gerar relatórios.

**Elementos principais:**
- Filtros avançados por período, tipo de serviço e localidade
- Gráficos de utilização de serviços por categoria e período
- Tabela de histórico completo de solicitações
- Métricas de economia estimada (comparado a deslocamentos próprios)
- Opções para exportar relatórios em diferentes formatos
- Análise de tendências e recomendações personalizadas

**Fluxo de interação:**
A empresa seleciona os filtros desejados, visualiza gráficos e tabelas com seu histórico de utilização, e pode exportar relatórios detalhados para análise interna. O sistema também oferece recomendações baseadas no padrão de utilização.

### 3. Interface do Correspondente Jurídico

#### 3.1 Dashboard do Correspondente

O dashboard do correspondente oferece uma visão geral das solicitações atribuídas e pendentes.

**Elementos principais:**
- Cabeçalho com logo do sistema e menu de navegação simplificado
- Cards com métricas principais:
  - Solicitações pendentes de aceitação
  - Serviços agendados para os próximos dias
  - Pagamentos pendentes
  - Avaliação média recebida
- Calendário de serviços agendados
- Lista de próximos serviços com detalhes essenciais
- Notificações de novas atribuições e feedback recebido
- Acesso rápido para confirmar presença em serviços próximos

**Fluxo de interação:**
O correspondente visualiza suas métricas e serviços agendados, podendo clicar em qualquer item para ver detalhes. As novas atribuições são destacadas para facilitar a aceitação rápida.

#### 3.2 Novas Atribuições

Esta tela exibe as solicitações atribuídas ao correspondente que aguardam aceitação.

**Elementos principais:**
- Lista de novas atribuições com:
  - Tipo de serviço
  - Localidade
  - Data e hora
  - Valor oferecido
  - Prazo para aceitação
  - Detalhes específicos do serviço
- Botões para aceitar ou recusar cada atribuição
- Campo para justificativa em caso de recusa
- Mapa com localização do serviço
- Acesso às orientações detalhadas

**Fluxo de interação:**
O correspondente visualiza os detalhes de cada nova atribuição, verifica sua disponibilidade e o valor oferecido, e decide aceitar ou recusar. Em caso de aceitação, o serviço é adicionado à sua agenda. Em caso de recusa, é solicitada uma justificativa para feedback ao administrador.

#### 3.3 Serviços Agendados

Esta tela exibe todos os serviços aceitos pelo correspondente e agendados para execução.

**Elementos principais:**
- Filtros por data e tipo de serviço
- Visualização em calendário ou lista
- Detalhes de cada serviço:
  - Tipo de serviço
  - Localidade com mapa
  - Data e hora
  - Valor
  - Orientações específicas
  - Documentos relacionados
- Botão para confirmar presença no local (ativo apenas no dia do serviço)
- Área para upload de documentação e relatório após a execução
- Histórico de comunicações relacionadas ao serviço

**Fluxo de interação:**
O correspondente visualiza seus serviços agendados, acessa orientações detalhadas para preparação, confirma presença no local através do aplicativo no dia do serviço, e após a execução, faz upload da documentação e relatório necessários.

#### 3.4 Confirmação de Presença

Esta tela é acessada no dia do serviço para que o correspondente confirme sua presença no local.

**Elementos principais:**
- Informações do serviço no topo
- Mapa com localização atual e destino
- Botão para confirmar presença (ativo apenas quando próximo ao local)
- Opção para adicionar observações sobre condições locais
- Contato de emergência do administrador
- Checklist de documentos e materiais necessários

**Fluxo de interação:**
No dia do serviço, o correspondente acessa esta tela, verifica sua localização em relação ao destino, e quando estiver no local correto (verificado por geolocalização), confirma sua presença. O sistema registra o horário de chegada e notifica o administrador.

#### 3.5 Entrega de Documentação

Esta tela permite ao correspondente enviar a documentação e relatório após a execução do serviço.

**Elementos principais:**
- Informações do serviço realizado
- Formulário para preenchimento de relatório estruturado
- Área para upload de documentos (atas, protocolos, etc.)
- Checklist de itens obrigatórios
- Opção para adicionar observações relevantes
- Botão para enviar documentação para auditoria
- Visualização prévia dos documentos anexados

**Fluxo de interação:**
Após realizar o serviço, o correspondente preenche o relatório detalhando as atividades realizadas, faz upload dos documentos necessários, verifica se todos os itens obrigatórios foram incluídos, e envia para auditoria. O sistema confirma o recebimento e informa que a equipe de auditoria analisará o material.

#### 3.6 Histórico e Pagamentos

Esta tela permite ao correspondente visualizar seu histórico de serviços e pagamentos.

**Elementos principais:**
- Filtros por período, tipo de serviço e status de pagamento
- Tabela de serviços realizados com:
  - Data e tipo de serviço
  - Valor
  - Status de pagamento
  - Avaliação recebida
  - Feedback do administrador
- Gráfico de rendimentos por período
- Seção de pagamentos pendentes com previsão de recebimento
- Histórico de pagamentos recebidos
- Extrato financeiro exportável

**Fluxo de interação:**
O correspondente visualiza seu histórico completo de serviços, filtrando conforme necessário, acompanha os pagamentos pendentes e recebidos, e pode exportar seu extrato financeiro para controle pessoal.

## Protótipos de Telas Compartilhadas

### 1. Tela de Login

A tela de login é o ponto de entrada para todos os usuários do sistema.

**Elementos principais:**
- Logo do sistema em destaque
- Campos para e-mail e senha
- Opção "Lembrar-me"
- Botão de login destacado
- Link para recuperação de senha
- Seleção de tipo de acesso (Administrador, Empresa, Correspondente)
- Botão para cadastro de novas empresas ou correspondentes
- Informações de contato para suporte

**Fluxo de interação:**
O usuário seleciona seu tipo de acesso, insere suas credenciais e clica em login. Em caso de erro, mensagens específicas são exibidas. Novos usuários podem acessar o formulário de cadastro através do botão correspondente.

### 2. Sistema de Mensagens

O sistema de mensagens é acessível para todos os perfis de usuário, permitindo comunicação direta entre administrador, empresas e correspondentes.

**Elementos principais:**
- Lista de conversas recentes
- Indicador de mensagens não lidas
- Área de conversa com histórico de mensagens
- Campo para digitação de nova mensagem
- Opção para anexar arquivos
- Filtros por tipo de contato (Administrador, Empresas, Correspondentes)
- Notificações de novas mensagens
- Busca por conteúdo ou contato

**Fluxo de interação:**
O usuário seleciona uma conversa existente ou inicia uma nova, visualiza o histórico de mensagens, digita sua mensagem e envia. Arquivos podem ser anexados quando necessário. Notificações são exibidas para novas mensagens recebidas.

### 3. Perfil e Configurações

Esta tela permite a todos os usuários gerenciar seu perfil e configurações pessoais.

**Elementos principais:**
- Informações de perfil (nome, foto, contato)
- Opções para edição de dados pessoais
- Configurações de notificação (e-mail, push, SMS)
- Alteração de senha
- Preferências de interface
- Configurações de privacidade
- Histórico de atividades recentes

**Fluxo de interação:**
O usuário visualiza suas informações atuais, pode editar dados pessoais, alterar configurações de notificação, e gerenciar preferências de interface. Alterações são salvas automaticamente ou mediante confirmação, dependendo da importância.

## Considerações de Usabilidade

Para garantir uma experiência de usuário otimizada, os protótipos incorporam as seguintes considerações:

1. **Responsividade**: Todas as interfaces são projetadas para funcionar em diferentes tamanhos de tela, desde desktops até dispositivos móveis.

2. **Acessibilidade**: Elementos de interface seguem diretrizes de acessibilidade, incluindo contraste adequado, textos alternativos para imagens, e navegação por teclado.

3. **Feedback Visual**: Ações do usuário recebem feedback visual imediato, como mudanças de estado em botões, mensagens de confirmação, e indicadores de progresso.

4. **Consistência**: Padrões de design consistentes são aplicados em todas as telas, facilitando o aprendizado e a navegação.

5. **Prevenção de Erros**: Formulários incluem validação em tempo real e confirmações para ações irreversíveis.

6. **Eficiência**: Fluxos de trabalho são otimizados para reduzir o número de cliques necessários para tarefas comuns.

## Próximos Passos

Após a validação destes protótipos, os próximos passos incluem:

1. Refinamento baseado em feedback dos stakeholders
2. Desenvolvimento de protótipos interativos para testes de usabilidade
3. Definição detalhada de componentes e estilos para implementação
4. Integração com a arquitetura backend definida
5. Implementação das interfaces seguindo o design system estabelecido

Os protótipos apresentados neste documento servirão como base para o desenvolvimento das interfaces do Sistema de Gestão de Correspondentes Jurídicos, garantindo uma experiência de usuário alinhada com as necessidades do negócio e o padrão visual do JurisConnect.
