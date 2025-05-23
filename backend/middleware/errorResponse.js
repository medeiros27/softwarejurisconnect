// Classe para criar erros customizados e padronizados

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;