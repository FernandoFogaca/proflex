import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logged, logout } from "../authentication/session";

export default function Header() {
  const nav = useNavigate();
  const isOn = logged();

  return (
    <header className="bg-primary text-white py-3 mb-0">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="h4 m-0">ProFlex</h1>
        <nav role="navigation" aria-label="Principal" className="d-flex gap-3">
          <Link to="/marketing" className="text-white text-decoration-none">Assinar</Link>
          <Link to="/agenda" className="text-white text-decoration-none">Agenda</Link>
          <Link to="/clientes" className="text-white text-decoration-none">Cadastro</Link>
          <Link to="/compromissos" className="text-white text-decoration-none">Compromissos</Link>
          <Link to="/" className="text-white text-decoration-none">Home</Link>

          {isOn && (
            <button
              className="btn btn-sm btn-light ms-2"
              onClick={() => { logout(); nav("/login"); }}
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
