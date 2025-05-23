import axios from 'axios';

// Exemplo: login
export async function login(email: string, password: string) {
  const { data } = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
  return data.user;
}

// Exemplo: criar empresa
export async function createCompany(name: string, cnpj: string) {
  await axios.post('/api/companies', { name, cnpj }, { withCredentials: true });
}

// Exemplo: listar empresas
export async function getCompanies() {
  const { data } = await axios.get('/api/companies', { withCredentials: true });
  return data.data;
}

// Repita o padrão para correspondentes e solicitações de serviço