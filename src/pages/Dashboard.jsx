
import React from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Dashboard() {
  const { clients, appointments } = useApp();

  const today = new Date().toLocaleDateString("en-CA");

  const consultations = appointments.filter(
    (appointment) => appointment.tipo !== "pessoal"
  );

  const todayConsultations = consultations.filter(
    (appointment) => appointment.data === today
  );

  const personalAppointments = appointments.filter(
    (appointment) => appointment.tipo === "pessoal"
  );

  return (
    <div className="container py-4">
      <h2 className="mb-4" style={{ color: "#0f766e" }}>
        Dashboard ProFlex
      </h2>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Pacientes cadastrados</h6>
            <h2>{clients.length}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Consultas de hoje</h6>
            <h2>{todayConsultations.length}</h2>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6>Compromissos pessoais</h6>
            <h2>{personalAppointments.length}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
