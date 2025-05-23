import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Correspondentes from "./pages/Correspondentes";
import Solicitacoes from "./pages/Solicitacoes";

// Componente para página 404
function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>404 - Página não encontrada</h2>
      <p>O endereço que você tentou acessar não existe.</p>
    </div>
  );
}

// Simulação de autenticação (troque pelo seu contexto real)
function useAuth() {
  const [user, setUser] = useState<any>(null);
  return { user, setUser };
}

export default function App() {
  const { user, setUser } = useAuth();

  const handleLogout = () => setUser(null);

  return (
    <Router>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/empresas" element={user ? <Empresas /> : <Navigate to="/login" />} />
        <Route path="/correspondentes" element={user ? <Correspondentes /> : <Navigate to="/login" />} />
        <Route path="/solicitacoes" element={user ? <Solicitacoes /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}