/**
 * middleware/advancedResults.js - Middleware para resultados avançados
 * 
 * Este middleware implementa funcionalidades avançadas de consulta,
 * como filtragem, ordenação, seleção de campos e paginação.
 */

const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copia req.query
  const reqQuery = { ...req.query };

  // Campos a excluir
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Remove campos da reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Cria string de consulta
  let queryStr = JSON.stringify(reqQuery);

  // Cria operadores ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Encontra recursos
  query = model.find(JSON.parse(queryStr));

  // Seleção de campos
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Ordenação
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Paginação
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // População
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(item => {
        query = query.populate(item);
      });
    } else {
      query = query.populate(populate);
    }
  }

  // Executa a consulta
  const results = await query;

  // Objeto de paginação
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
