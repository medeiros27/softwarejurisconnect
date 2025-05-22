import React, { useState } from "react";
import { API_URL } from "../config";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const resp = await fetch(`${API_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await resp.json();
      if (resp.ok) {
        onLogin(data); // Salva token, usuário etc
      } else {
        setErro(data.msg || "Login inválido");
      }
    } catch (err) {
      setErro("Erro na conexão com o servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Entrar</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
      {erro && <div style={{ color: "red" }}>{erro}</div>}
    </form>
  );
}