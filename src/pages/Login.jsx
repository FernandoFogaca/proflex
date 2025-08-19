import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const emailRef = useRef(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // credenciais de teste (pro professor rodar sem dor de cabeça)
    if (email === "admin@proflex.com" && senha === "123456") {
      setMensagem("Login ok. Redirecionando para Agenda…");
      navigate("/agenda");
    } else {
      setMensagem("Use admin@proflex.com / 123456 para testar.");
    }
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light px-3">
      <h2 className="mb-4 text-center">Login</h2>

      <form className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: 400 }} onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            className="form-control"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            className="form-control"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Entrar</button>
      </form>

      <div className="mt-3 small text-center text-muted">
        Credenciais de teste: <code>admin@proflex.com</code> / <code>123456</code>
      </div>

      {mensagem && (
        <div className="mt-3 alert alert-info w-100 text-center" style={{ maxWidth: 400 }}>
          {mensagem}
        </div>
      )}

      <button onClick={() => navigate("/")} className="btn btn-link mt-3">Voltar à página inicial</button>
    </div>
  );
}
