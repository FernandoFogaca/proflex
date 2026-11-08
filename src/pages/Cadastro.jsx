import React, { useState } from "react";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoPerfil, setTipoPerfil] = useState("autonomo");

  return (
    <div className="container py-5">
      <h2>Criar conta no ProFlex</h2>

      <form>
        <input
          className="form-control mb-3"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="email"
          className="form-control mb-3"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="button" className="btn btn-primary">
          Criar conta
        </button>
        <div className="mb-3">
  <label className="form-label">
    Como você pretende utilizar o ProFlex?
  </label>

  <select
    className="form-select"
    value={tipoPerfil}
    onChange={(e) => setTipoPerfil(e.target.value)}
  >
    <option value="autonomo">Profissional autônomo</option>
    <option value="clinica">Clínica</option>
    <option value="hibrido">Profissional híbrido</option>
  </select>
</div>


      </form>
    </div>
  );
}