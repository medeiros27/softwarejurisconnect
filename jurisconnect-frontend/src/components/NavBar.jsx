import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";
import logo from "../assets/Logo versao 1.png";

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>
        <img src={logo} alt="JurisConnect" height={48} />
        <span className="navbar-title">JurisConnect</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/empresas">Empresas</Link></li>
        <li><Link to="/correspondentes">Correspondentes</Link></li>
        <li><Link to="/solicitacoes">Solicitações</Link></li>
      </ul>
      <div className="navbar-user">
        {user ? (
          <>
            <span>Olá, {user.nome || user.name}</span>
            <button onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}