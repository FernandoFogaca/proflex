import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const ESTADOS_BRASIL = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
];

const PROVINCIAS_HOLANDA = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
];

export default function Clientes() {
  const { clients, addClient } = useApp();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    semEmail: false,
    telefone: "",
    temWhatsapp: false,
    endereco: "",
    pais: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    return clients.filter((c) =>
      [c.nome, c.email, c.telefone, c.endereco]
        .join(" ")
        .toLowerCase()
        .includes(needle),
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
      <h3 className="mb-3">Paciente</h3>

      <form className="row g-2 mb-3 align-items-start" onSubmit={onSubmit}>
        <div className="col-md-3">
          <input
            className="form-control"
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={onChange}
            required
          />
        </div>

        <div className="col-md-3">
          <input
            type="email"
            className="form-control"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            disabled={form.semEmail}
            required={!form.semEmail}
          />

          <label className="form-check-label mt-2">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={form.semEmail}
              onChange={(e) =>
                setForm({
                  ...form,
                  semEmail: e.target.checked,
                  email: e.target.checked ? "" : form.email,
                })
              }
            />
            Não possui e-mail
          </label>
        </div>

        <div className="col-md-3">
          <input
            className="form-control"
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={onChange}
          />

          <label className="form-check-label mt-2">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={form.temWhatsapp}
              onChange={(e) =>
                setForm({
                  ...form,
                  temWhatsapp: e.target.checked,
                })
              }
            />
            Este número também é WhatsApp
          </label>
        </div>
        <div className="col-12 mt-2"></div>

        {[
          ["cep", "CEP / Código postal"],

          ["rua", "Rua"],
          ["numero", "Número"],
          ["complemento", "Complemento"],
          ["bairro", "Bairro"],
          ["cidade", "Cidade"],
          ["estado", "Estado / Província"],
        ].map(([campo, titulo]) => (
          <div
            className={
              campo === "rua"
                ? "col-md-5"
                : campo === "cep"
                  ? "col-md-2"
                  : campo === "numero"
                    ? "col-md-2"
                    : campo === "complemento"
                      ? "col-md-3"
                      : "col-md-3"
            }
            key={campo}
          >
            <label className="form-label">{titulo}</label>
            {campo === "estado" &&
            (form.pais === "Brasil" || form.pais === "Países Baixos") ? (
              <select
                className="form-select"
                name="estado"
                value={form.estado}
                onChange={onChange}
              >
                <option value="">Selecione o estado</option>
                {(form.pais === "Brasil"
                  ? ESTADOS_BRASIL
                  : PROVINCIAS_HOLANDA
                ).map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                name={campo}
                value={form[campo]}
                onChange={onChange}
              />
            )}
          </div>
        ))}
        <div className="col-12 mt-2">
          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={form.pais === "Brasil"}
              onChange={(e) =>
                setForm({
                  ...form,
                  pais: e.target.checked ? "Brasil" : "",
                })
              }
            />
            Brasil
          </label>

          {form.pais !== "Brasil" && (
            <select
              className="form-select form-select-sm mt-2"
              style={{ maxWidth: "240px" }}
              value={form.pais}
              onChange={(e) =>
                setForm({
                  ...form,
                  pais: e.target.value,
                  estado: "",
                })
              }
            >
              <option value="">Selecione o país</option>
              <option value="Portugal">Portugal</option>
              <option value="Países Baixos">Países Baixos</option>
              <option value="Irlanda">Irlanda</option>
              <option value="Alemanha">Alemanha</option>
              <option value="Outro">Outro</option>
            </select>
          )}
        </div>
        <div className="col-12 text-end">
          <button className="proflex-button">Adicionar</button>
        </div>
      </form>

      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Pesquisar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
              <tr
                key={c.id}
                style={{ cursor: "pointer" }}
                onClick={() => nav(`/prontuario?clienteId=${c.id}`)}
              >
                <td>{c.nome}</td>
                <td>{c.email}</td>
                <td>{c.telefone}</td>
                <td>{c.endereco}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  Nenhum cliente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
