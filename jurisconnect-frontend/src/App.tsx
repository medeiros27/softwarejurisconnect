import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importe suas páginas
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import Correspondents from "./pages/Correspondents";
import ServiceRequests from "./pages/ServiceRequests";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

export default App;