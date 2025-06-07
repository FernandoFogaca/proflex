import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-primary text-white py-3 mb-0">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="h4 m-0">ProFlex</h1>
        <nav className="d-flex gap-3">
          <Link to="/" className="text-white text-decoration-none">Home</Link>
          <Link to="/agenda" className="text-white text-decoration-none">Agenda</Link>
          <Link to="/clientes" className="text-white text-decoration-none">Clientes</Link>
        </nav>
      </div>
    </header>
  );
}
