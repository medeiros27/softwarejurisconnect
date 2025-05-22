# Guia de Implantação no Google Cloud Run

Este guia simplificado vai ajudá-lo a implantar o Sistema de Gestão de Correspondentes Jurídicos no Google Cloud Run, mesmo sem experiência técnica avançada.

## Pré-requisitos

1. Uma conta no Google Cloud Platform (você pode criar uma em https://cloud.google.com/)
2. O Google Cloud SDK instalado no seu computador (instruções de instalação abaixo)

## Passo 1: Instalar o Google Cloud SDK

### Para Windows:
1. Baixe o instalador em: https://cloud.google.com/sdk/docs/install
2. Execute o instalador e siga as instruções na tela
3. Após a instalação, abra o "Google Cloud SDK Shell" no menu Iniciar

### Para Mac:
1. Baixe o instalador em: https://cloud.google.com/sdk/docs/install
2. Execute o instalador e siga as instruções na tela
3. Após a instalação, abra o Terminal

### Para Linux:
1. Abra o Terminal
2. Execute os seguintes comandos:
```
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
```

## Passo 2: Fazer login no Google Cloud

1. No terminal ou Google Cloud SDK Shell, execute:
```
gcloud auth login
```
2. Uma janela do navegador será aberta
3. Faça login com sua conta Google
4. Autorize o acesso quando solicitado

## Passo 3: Criar um projeto no Google Cloud (se ainda não tiver um)

1. Execute o comando:
```
gcloud projects create jurisconnect-app --name="JurisConnect"
```
2. Defina este projeto como padrão:
```
gcloud config set project jurisconnect-app
```

## Passo 4: Ativar o faturamento (necessário para usar o Cloud Run)

1. Acesse o Console do Google Cloud: https://console.cloud.google.com/
2. No menu lateral, vá para "Faturamento"
3. Vincule uma conta de faturamento ao seu projeto
   (O Google oferece $300 em créditos para novos usuários)

## Passo 5: Ativar as APIs necessárias

Execute os seguintes comandos:
```
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

## Passo 6: Implantar a aplicação

1. Navegue até a pasta onde você extraiu o pacote de implantação:
```
cd caminho/para/pacote_implantacao_cloud_run
```

2. Construa e implante a aplicação com um único comando:
```
gcloud run deploy jurisconnect --source . --platform managed --region us-central1 --allow-unauthenticated
```

3. Aguarde a conclusão do processo (pode levar alguns minutos)

4. Ao finalizar, você receberá uma URL para acessar sua aplicação (algo como https://jurisconnect-xxxx-xx.a.run.app)

## Passo 7: Configurar seu domínio personalizado

1. No Console do Google Cloud, acesse "Cloud Run" no menu lateral
2. Clique no serviço "jurisconnect" que você acabou de implantar
3. Vá para a aba "Domínios"
4. Clique em "Adicionar mapeamento"
5. Siga as instruções para adicionar seu domínio jurisconnect.com.br

## Solução de problemas comuns

### Erro de permissão:
Se encontrar erros de permissão, verifique se você ativou o faturamento e as APIs necessárias.

### Erro de implantação:
Se a implantação falhar, verifique os logs de erro executando:
```
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

### Aplicação não carrega:
Verifique os logs da aplicação no Console do Google Cloud > Cloud Run > jurisconnect > Logs

## Suporte

Se precisar de ajuda adicional, você pode:
1. Consultar a documentação oficial: https://cloud.google.com/run/docs
2. Entrar em contato com o suporte do Google Cloud: https://cloud.google.com/support
3. Buscar ajuda em fóruns como Stack Overflow com a tag "google-cloud-run"
