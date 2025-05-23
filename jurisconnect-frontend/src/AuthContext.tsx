import axios from "axios";

// Ajuste a BASE_URL conforme sua API
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Instância do axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTORES PARA TOKEN (opcional, se usar autenticação JWT) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- AUTH ---
export async function login(data: { email: string; password: string }) {
  const response = await api.post("/auth/login", data);
  return response.data;
}

export async function register(data: { name: string; email: string; password: string }) {
  const response = await api.post("/auth/register", data);
  return response.data;
}

// --- COMPANIES ---
export async function getCompanies() {
  const response = await api.get("/companies");
  return response.data;
}

export async function getCompanyById(id: string | number) {
  const response = await api.get(`/companies/${id}`);
  return response.data;
}

export async function createCompany(data: any) {
  const response = await api.post("/companies", data);
  return response.data;
}

export async function updateCompany(id: string | number, data: any) {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
}

export async function deleteCompany(id: string | number) {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
}

// --- CORRESPONDENTS ---
export async function getCorrespondents() {
  const response = await api.get("/correspondents");
  return response.data;
}

export async function getCorrespondentById(id: string | number) {
  const response = await api.get(`/correspondents/${id}`);
  return response.data;
}

export async function createCorrespondent(data: any) {
  const response = await api.post("/correspondents", data);
  return response.data;
}

export async function updateCorrespondent(id: string | number, data: any) {
  const response = await api.put(`/correspondents/${id}`, data);
  return response.data;
}

export async function deleteCorrespondent(id: string | number) {
  const response = await api.delete(`/correspondents/${id}`);
  return response.data;
}

// --- SERVICE REQUESTS ---
export async function getServiceRequests() {
  const response = await api.get("/servicerequests");
  return response.data;
}

export async function getServiceRequestById(id: string | number) {
  const response = await api.get(`/servicerequests/${id}`);
  return response.data;
}

export async function createServiceRequest(data: any) {
  const response = await api.post("/servicerequests", data);
  return response.data;
}

export async function updateServiceRequest(id: string | number, data: any) {
  const response = await api.put(`/servicerequests/${id}`, data);
  return response.data;
}

export async function deleteServiceRequest(id: string | number) {
  const response = await api.delete(`/servicerequests/${id}`);
  return response.data;
}

// --- DASHBOARD (exemplo de endpoint genérico, ajuste conforme sua API) ---
export async function getDashboardStats() {
  const response = await api.get("/dashboard/stats");
  return response.data;
}

// --- EXPORT DEFAULT PARA IMPORTAÇÃO DIRETA DO AXIOS, SE PRECISAR ---
export default api;