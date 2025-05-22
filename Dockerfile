# Use a imagem oficial do Python
FROM python:3.9-slim

# Define o diretório de trabalho
WORKDIR /app

# Copie os arquivos de requisitos primeiro (para aproveitar o cache do Docker)
COPY requirements.txt .

# Instale as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copie o restante do código
COPY . .

# Exponha a porta que a aplicação usará
EXPOSE 8080

# Configure variáveis de ambiente
ENV FLASK_APP=src
ENV PYTHONUNBUFFERED=1

# Comando para iniciar a aplicação
CMD exec gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 "src:app"
