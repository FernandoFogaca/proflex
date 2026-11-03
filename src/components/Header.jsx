
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logged, logout } from "../authentication/session.jsx";

export default function Header() {
  const nav = useNavigate();
  const isOn = logged();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    nav("/login");
  };

  return (
    <header
      className="proflex-gradient text-white py-3 mb-0 sticky-top"
      style={{ zIndex: 1030 }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center gap-3">

          {/* Marca ProFlex */}
          <div className="proflex-brand">
            <div className="proflex-brand-icon">PF</div>

            <div className="proflex-brand-text">
              <span className="proflex-brand-name">
                Pro<span>Flex</span>
              </span>
              <small>MANAGEMENT • SCHEDULING • CARE</small>
            </div>
          </div>

          {/* Botão de menu para celular e tablet */}
          <button
            type="button"
            className="btn btn-outline-light d-lg-none flex-shrink-0"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="proflex-navigation"
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Navegação */}
          <nav
            id="proflex-navigation"
            role="navigation"
            aria-label="Principal"
            className="d-none d-lg-flex align-items-center gap-3"
          >
            <Link to="/marketing" className="text-white text-decoration-none" onClick={closeMenu}>Assinar</Link>
            <Link to="/agenda" className="text-white text-decoration-none" onClick={closeMenu}>Agenda</Link>
            <Link to="/clientes" className="text-white text-decoration-none" onClick={closeMenu}>Cadastro</Link>
            <Link to="/prontuario" className="text-white text-decoration-none" onClick={closeMenu}>Prontuários</Link>
            <Link to="/compromissos" className="text-white text-decoration-none" onClick={closeMenu}>Compromissos</Link>
            <Link to="/" className="text-white text-decoration-none" onClick={closeMenu}>Home</Link>

            {isOn && (
              <button
                type="button"
                className="btn btn-sm btn-light ms-2"
                onClick={handleLogout}
              >
                Sair
              </button>
            )}
          </nav>
        </div>

        {/* Menu expansível para celular e tablet */}
        {menuOpen && (
          <nav
            aria-label="Principal no celular"
            className="d-lg-none d-flex flex-column gap-3 pt-3 mt-3 border-top"
          >
            <Link to="/marketing" className="text-white text-decoration-none" onClick={closeMenu}>Assinar</Link>
            <Link to="/agenda" className="text-white text-decoration-none" onClick={closeMenu}>Agenda</Link>
            <Link to="/clientes" className="text-white text-decoration-none" onClick={closeMenu}>Cadastro</Link>
            <Link to="/prontuario" className="text-white text-decoration-none" onClick={closeMenu}>Prontuários</Link>
            <Link to="/compromissos" className="text-white text-decoration-none" onClick={closeMenu}>Compromissos</Link>
            <Link to="/" className="text-white text-decoration-none" onClick={closeMenu}>Home</Link>

            {isOn && (
              <button
                type="button"
                className="btn btn-sm btn-light align-self-start"
                onClick={handleLogout}
              >
                Sair
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
