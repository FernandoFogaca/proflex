// Lembrete rápido direita da agenda
// recebe a data do dia. a lista de lembretes e 2 funções 

import React, { useState } from "react";

export default function AgendaLembretes({ dataISO, itens = [], onAdd, onRemove }) {
  // campos do formulário
  const [hora, setHora] = useState("09:00");
  const [msg, setMsg] = useState("");
  const [whats, setWhats] = useState("");

  // cria 1 lembrete chamando a função do pai
  function criar() {
    if (!hora) return;
    if (typeof onAdd === "function") {
      onAdd(hora, msg, whats);
      setMsg(""); 
    }
  }

  // lista só do dia atual
  const doDia = itens
    .filter((r) => r.date === dataISO)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="p-3 border rounded bg-white">
      <h6 className="m-0">🔔 Lembrete rápido</h6>

      <div className="row g-2 mt-2">
        <div className="col-4">
          <input
            type="time"
            className="form-control"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>

        <div className="col-8">
          <input
            className="form-control"
            placeholder="Mensagem"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
        </div>

        <div className="col-8">
          <input
            className="form-control"
            placeholder="WhatsApp (opcional, ex: 5599999999999)"
            value={whats}
            onChange={(e) => setWhats(e.target.value)}
          />
        </div>

        <div className="col-4 text-end">
          <button className="btn btn-primary w-100" onClick={criar}>
            Criar
          </button>
        </div>
      </div>

      <ul className="list-group list-group-flush mt-2">
        {doDia.map((r) => (
          <li
            key={r.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{r.time}</strong> — {r.message || "(sem mensagem)"}
              {r.whats && <span className="badge text-bg-success ms-2">WhatsApp</span>}
            </div>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => typeof onRemove === "function" && onRemove(r.id)}
            >
              remover
            </button>
          </li>
        ))}

        {doDia.length === 0 && (
          <li className="list-group-item text-muted">
            Sem lembretes para este dia.
          </li>
        )}
      </ul>

      <small className="text-muted d-block mt-2">
        Obs.: envio automático real no WhatsApp precisa de servidor + API.
      </small>
    </div>
  );
}
