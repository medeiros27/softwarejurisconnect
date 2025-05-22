import React, { useState } from "react";
import { API_URL } from "../config";

export default function Register({ onRegister }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(""); setSucesso("");
    try {
      const resp = await fetch(`${API_URL}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setSucesso("Cadastro realizado! Faça login.");
        onRegister && onRegister(data);
      } else {
        setErro(data.msg || "Não foi possível cadastrar");
      }
    } catch (err) {
      setErro("Erro na conexão com o servidor");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastrar</h2>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={e => setNome(e.target.value)}
        required
      />
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
      <button type="submit">Cadastrar</button>
      {erro && <div style={{ color: "red" }}>{erro}</div>}
      {sucesso && <div style={{ color: "green" }}>{sucesso}</div>}
    </form>
  );
}