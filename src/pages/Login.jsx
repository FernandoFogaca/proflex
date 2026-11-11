
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { login } from "../authentication/session.jsx";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem("");

    if (!email.trim() || !senha) {
      setMensagem("Preencha o e-mail e a senha.");
      return;
    }

    setCarregando(true);

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      if (!credencial.user.emailVerified) {
        await signOut(auth);
        setMensagem("Confirme seu e-mail antes de entrar.");
        return;
      }

      login({ role: "owner" });
      navigate("/agenda");

    } catch (erro) {
      console.error("Erro no login:", erro.code);

      switch (erro.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setMensagem("E-mail ou senha incorretos.");
          break;

        case "auth/too-many-requests":
          setMensagem("Muitas tentativas. Tente novamente mais tarde.");
          break;

        case "auth/invalid-email":
          setMensagem("Digite um e-mail válido.");
          break;

        default:
          setMensagem("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light px-3">
      <h2 className="mb-4 text-center">Login</h2>

      <form
        className="bg-white p-4 rounded shadow w-100"
        style={{ maxWidth: 400 }}
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            E-mail
          </label>

          <input
            id="email"
            ref={emailRef}
            type="email"
            className="form-control"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="senha">
            Senha
          </label>

          <input
            id="senha"
            type="password"
            className="form-control"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {mensagem && (
          <div className="alert alert-danger" role="alert">
            {mensagem}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={carregando}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <button
        onClick={() => navigate("/")}
        className="btn btn-link mt-3"
      >
        Voltar à página inicial
      </button>
    </div>
  );
}
