import React from "react";

export default function LembretesDoDia({ data }) {
  const compromissosExemplo = [
    { data: "2025-07-28", hora: "09:00", cliente: "João" },
    { data: "2025-07-28", hora: "11:30", cliente: "Maria" },
    { data: "2025-07-28", hora: "15:00", cliente: "Lucas" },
    { data: "2025-07-29", hora: "10:00", cliente: "Fernanda" }
  ];

  const compromissosFiltrados = compromissosExemplo.filter(
    (c) => c.data === data
  );

  if (compromissosFiltrados.length === 0) return null;

  return (
    <div className="container mt-4">
      <div className="bg-white p-3 shadow-sm rounded border">
        <h6 className="mb-3">📌 Próximos Compromissos</h6>
        <ul className="list-unstyled mb-0">
          {compromissosFiltrados.map((c, i) => (
            <li key={i} className="mb-2">
              🕒 <strong>{c.hora}</strong> - Cliente: {c.cliente}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
