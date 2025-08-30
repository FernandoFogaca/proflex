import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Clientes() {
  const { clients, addClient } = useApp();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", endereco: "" });

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return clients.filter((c) =>
      [c.nome, c.email, c.telefone, c.endereco].join(" ").toLowerCase().includes(needle)
    );
  }, [q, clients]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    addClient(form);
    setForm({ nome: "", email: "", telefone: "", endereco: "" });
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Clientes</h3>

      <form className="row g-2 mb-3" onSubmit={onSubmit}>
        <div className="col-md-3">
          <input className="form-control" name="nome" placeholder="Nome" value={form.nome} onChange={onChange} required />
        </div>
        <div className="col-md-3">
          <input className="form-control" name="email" placeholder="Email" value={form.email} onChange={onChange} />
        </div>
        <div className="col-md-3">
          <input className="form-control" name="telefone" placeholder="Telefone" value={form.telefone} onChange={onChange} />
        </div>
        <div className="col-md-3">
          <input className="form-control" name="endereco" placeholder="Endereço" value={form.endereco} onChange={onChange} />
        </div>
        <div className="col-12 text-end">
          <button className="proflex-button">Adicionar</button>
        </div>
      </form>

      <div className="mb-2">
        <input className="form-control" placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Endereço</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ cursor:"pointer" }} onClick={() => nav(`/agendar?clienteId=${c.id}`)}>
                <td>{c.nome}</td><td>{c.email}</td><td>{c.telefone}</td><td>{c.endereco}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center">Nenhum cliente</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
