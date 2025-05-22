# Documentação de Uso dos Logotipos

Este documento descreve como os logotipos do JurisConnect estão organizados e como devem ser utilizados no sistema.

## Versões dos Logotipos

Todas as versões dos logotipos estão armazenadas no diretório `/src/static/img/logos/` com os seguintes nomes:

1. **Logo versão 1 (logo_v1.png)** - Símbolo + texto, fundo escuro
   - Uso: Site, redes sociais, apresentações
   - Localização no sistema: Cabeçalho de login/cadastro, rodapé do site

2. **Logo versão 2 (logo_v2.png)** - Símbolo + texto, fundo claro
   - Uso: Documentos, papel timbrado, contratos, cabeçalho do site
   - Localização no sistema: Cabeçalho do dashboard e páginas internas

3. **Logo versão 3 (logo_v3.png)** - Ícone isolado, fundo escuro
   - Uso: Favicon do site, avatar de redes sociais
   - Localização no sistema: Favicon em todas as páginas

4. **Logo versão 4 (logo_v4.png)** - Ícone isolado, fundo claro
   - Uso: Marca d'água, ícones, assinaturas digitais
   - Localização no sistema: Rodapé como marca d'água, assinaturas de documentos

## Implementação nos Templates

Os logotipos foram implementados nos seguintes templates:

- **index.html**: Logo v2 no cabeçalho, Logo v1 no rodapé, Logo v3 como favicon
- **auth/login.html**: Logo v1 no cabeçalho, Logo v4 como marca d'água no rodapé, Logo v3 como favicon
- **auth/register.html**: Logo v1 no cabeçalho, Logo v4 como marca d'água no rodapé, Logo v3 como favicon
- **admin/dashboard.html**: Logo v1 na sidebar, Logo v2 no cabeçalho, Logo v4 no rodapé, Logo v3 como favicon

## Diretrizes para Manutenção

Ao atualizar ou criar novos templates, siga estas diretrizes:

1. Use Logo v3 como favicon em todas as páginas
2. Use Logo v1 (fundo escuro) em áreas com fundo escuro ou colorido
3. Use Logo v2 (fundo claro) em áreas com fundo branco ou claro
4. Use Logo v4 como marca d'água ou em elementos sutis

## Código de Referência

Para incluir o favicon:
```html
<link rel="icon" type="image/png" href="{{ url_for('static', filename='img/logos/logo_v3.png') }}">
```

Para incluir o logotipo no cabeçalho:
```html
<img src="{{ url_for('static', filename='img/logos/logo_v2.png') }}" alt="Logo JurisConnect" height="60">
```

Para incluir o logotipo no rodapé:
```html
<img src="{{ url_for('static', filename='img/logos/logo_v1.png') }}" alt="Logo JurisConnect" height="80" class="mb-3">
```

Para incluir a marca d'água:
```html
<img src="{{ url_for('static', filename='img/logos/logo_v4.png') }}" alt="Logo JurisConnect" height="40" class="opacity-50">
```
