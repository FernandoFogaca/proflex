
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, CircleUserRound, ChevronDown } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { logged, logout } from "../authentication/session.jsx";

const navigationLinks = [
  { label: "Assinar", path: "/marketing" },
  { label: "Agenda", path: "/agenda" },
  { label: "Cadastro", path: "/clientes" },
  { label: "Prontuários", path: "/prontuario" },
  { label: "Compromissos", path: "/compromissos" },
  { label: "Home", path: "/" },
];

export default function Header() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  const profileRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const isOn = logged() && Boolean(currentUser);

  const profileName =
    currentUser?.displayName?.trim() ||
    currentUser?.email?.split("@")[0] ||
    "Meu perfil";

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      closeMenu();
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível encerrar a sessão.");
    }
  };

  const profileButton = (
    <div className="position-relative" ref={profileRef}>
      <button
        type="button"
        className="btn d-flex align-items-center gap-2 text-white"
        style={{
          backgroundColor: "#255A62",
          borderRadius: 14,
        }}
        onClick={() => setProfileOpen((previous) => !previous)}
        aria-expanded={profileOpen}
        aria-label={`Perfil de ${profileName}`}
      >
        <CircleUserRound size={21} color="#A7F3D0" />
        <span>{profileName}</span>
        <ChevronDown size={16} />
      </button>

      {profileOpen && (
        <div
      className="position-absolute start-0 mt-2 bg-white text-dark rounded shadow p-3"
          style={{
            minWidth: 220,
            maxWidth: "calc(100vw - 32px)",
            zIndex: 1100,
          }}
        >
          <strong>{profileName}</strong>

          <p className="mb-2 small text-muted">
            Perfil atualmente conectado
          </p>

          <div className="border-top pt-2 small text-muted">
            Troca rápida de funcionários em desenvolvimento
          </div>
        </div>
      )}
    </div>
  );

  const sessionButtons = (
    <>
      <button
        type="button"
        className="btn btn-sm btn-warning"
        disabled
        title="Funcionalidade em desenvolvimento"
      >
        Pausar
      </button>

      <button
        type="button"
        className="btn btn-sm btn-light"
        onClick={handleLogout}
      >
        Sair
      </button>
    </>
  );

  return (
    <header
      className="proflex-gradient text-white py-3 mb-0 sticky-top"
      style={{ zIndex: 1030 }}
    >
      <div className="container">
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div className="proflex-brand">
            <div className="proflex-brand-icon">
              <Activity size={25} strokeWidth={2.5} />
            </div>

            <div className="proflex-brand-text">
              <span className="proflex-brand-name">
                Pro<span>Flex</span>
              </span>
              <small>MANAGEMENT • SCHEDULING • CARE</small>
            </div>
          </div>

          {/* Navegação para computador */}
          <nav
            aria-label="Principal"
            className="d-none d-lg-flex align-items-center gap-3"
          >
            {navigationLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-white text-decoration-none"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {isOn && (
              <div className="d-flex align-items-center gap-2">
                {profileButton}
                {sessionButtons}
              </div>
            )}
          </nav>

          {/* Botão do menu para celular e tablet */}
          <button
            type="button"
            className="btn btn-outline-light d-lg-none flex-shrink-0"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="proflex-mobile-navigation"
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setProfileOpen(false);
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Navegação para celular e tablet */}
        {menuOpen && (
          <nav
            id="proflex-mobile-navigation"
            aria-label="Principal no celular"
            className="d-lg-none d-flex flex-column gap-3 pt-3 mt-3 border-top"
          >
            {navigationLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-white text-decoration-none"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            {isOn && (
              <div className="d-flex flex-wrap align-items-center gap-2">
                {profileButton}
                {sessionButtons}
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
