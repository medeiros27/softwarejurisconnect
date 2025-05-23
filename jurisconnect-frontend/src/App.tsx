import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importe suas páginas
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Correspondentes from "./pages/Correspondentes";
import Solicitacoes from "./pages/Solicitacoes";

// Exemplo de componente de proteção de rota (opcional)
function PrivateRoute({ children }) {
  // Implemente seu controle de autenticação aqui
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas privadas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <Companies />
            </PrivateRoute>
          }
        />
        <Route
          path="/correspondents"
          element={
            <PrivateRoute>
              <Correspondents />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicerequests"
          element={
            <PrivateRoute>
              <ServiceRequests />
            </PrivateRoute>
          }
        />

        {/* Redirecionamentos */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default function App() { /* ... */ }