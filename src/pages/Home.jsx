import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="Fadetext-1">Welcome to Proflex</h1>
      <h1 className="Fadetext-2">Benvenue à Proflex</h1>
      <h1 className="Fadetext-3">Benvindo ao Proflex</h1>

      <p className="bottom-text">
        Proflex system helps professionals manage their schedules, reminders, and client data – all in one place.
      </p>

      <button type="button" className="btn btn-outline-info custom-button">
        Start Now
      </button>

      <footer className="footer">
        <span>© 2025 Proflex. All rights reserved.</span>
        <button
          className="dev-access"
          onClick={() => navigate("/devlogin")}
        >
          Dev Access
        </button>
      </footer>
    </div>
  );
}