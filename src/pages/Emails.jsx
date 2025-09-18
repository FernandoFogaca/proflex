import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function Emails() {
  const { clients } = useApp();
  const [q, setQ] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const lista = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return clients;
    return clients.filter((c) =>
      [c.nome, c.email, c.telefone, c.endereco].join(" ").toLowerCase().includes(n)
    );
  }, [q, clients]);

  const abrirMailto = (email, nome) => {
    const mail = (email || "").trim();
    const to = mail || "";
    const sub = encodeURIComponent(assunto || "");
    const body = encodeURIComponent(mensagem || "");
    const url = `mailto:${to}?subject=${sub}&body=${body}`;
    window.location.href = url;
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">E-mail</h3>

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Pesquisar pacientes..."
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Assunto"
            value={assunto}
            onChange={(e)=>setAssunto(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Mensagem (primeira linha)"
            value={mensagem}
            onChange={(e)=>setMensagem(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th style={{width:160}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c)=>(
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.email || <span className="text-muted">-</span>}</td>
                <td>{c.telefone || <span className="text-muted">-</span>}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    disabled={!c.email}
                    onClick={()=>abrirMailto(c.email, c.nome)}
                    title={c.email ? "Abrir e-mail" : "Sem e-mail"}
                  >
                    Read
                  </button>
                  <a
                    className="btn btn-sm btn-outline-secondary"
                    href={c.email ? `mailto:${c.email}` : undefined}
                    onClick={(e)=>{ if(!c.email) e.preventDefault(); }}
                  >
                    Send
                  </a>
                </td>
              </tr>
            ))}
            {lista.length===0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">Nenhum registro</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
