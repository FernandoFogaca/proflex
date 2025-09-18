// src/components/AvaliacaoUsuario.jsx
import React, { useState, useEffect } from "react";

/* frases curtas */
const FRASES = [
  "Muito prático no dia a dia!",
  "Interface simples e objetiva.",
  "Organizou minha agenda.",
  "Me ajudou com relatórios.",
  "Recomendo para a clínica.",
  "Atende muito bem no celular."
];

/* nota 4★ ou 5★  */
function notaPorUUID(uuid) {
  try {
    const n = parseInt(String(uuid).slice(-1), 16);
    return n % 2 === 0 ? 5 : 4;
  } catch {
    return 4;
  }
}

export default function AvaliacaoUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const API =
      "https://randomuser.me/api/?results=6&inc=name,email,picture,location,login&nat=br,us,gb,nl,es,fr";

    async function carregar() {
      try {
        setLoading(true);
        setErro("");

        const r = await fetch(API, { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();

        const lista = Array.isArray(j.results) ? j.results : [];

        // normaliza usuários
        const decorada = lista.map((u, i) => {
          const id = u?.login?.uuid || String(i);
          const nome = `${u?.name?.first || ""} ${u?.name?.last || ""}`.trim();
          const email = u?.email || "";
          const avatar = u?.picture?.large || u?.picture?.medium || "";
          const cidade = u?.location?.city || "";
          const pais = u?.location?.country || "";

          return {
            id,
            nome,
            email,
            avatar,
            local: [cidade, pais].filter(Boolean).join(", "),
            nota: notaPorUUID(id),
            frase: FRASES[i % FRASES.length],
          };
        });

        setUsuarios(decorada);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os depoimentos agora.");
        setUsuarios([]);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, []);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Quem já usa o ProFlex</h2>

      {/* carregando */}
      {loading && (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col">
              <div className="card h-100 text-center shadow-sm border-0 p-3">
                <div
                  className="placeholder rounded-circle mx-auto"
                  style={{ width: 80, height: 80 }}
                />
                <div className="placeholder-wave mt-3">
                  <span className="placeholder col-7"></span>
                </div>
                <div className="placeholder-wave mt-2">
                  <span className="placeholder col-5"></span>
                </div>
                <div className="placeholder-wave mt-2">
                  <span className="placeholder col-9"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* erro */}
      {!loading && erro && (
        <div className="alert alert-warning text-center" role="alert">
          {erro}
        </div>
      )}

      {/* lista */}
      {!loading && !erro && (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {usuarios.map((u) => (
            <div key={u.id} className="col">
              <div className="card h-100 text-center shadow-sm border-0 p-3">
                {/* avatar */}
                <img
                  src={u.avatar}
                  alt={u.nome}
                  className="rounded-circle mx-auto"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;utf8," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
                           <rect width='100%' height='100%' fill='#e9ecef'/>
                           <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-size='12' fill='#6c757d'>sem foto</text>
                         </svg>`
                      );
                  }}
                />

                {/* nome + email */}
                <h6 className="mt-3 mb-1">{u.nome}</h6>
                <a href={`mailto:${u.email}`} className="small text-muted">
                  {u.email}
                </a>

                {/* estrelas */}
                <div className="mt-2" aria-label={`${u.nota} de 5`}>
                  {Array.from({ length: u.nota }).map((_, i) => (
                    <span key={`f${u.id}-${i}`} className="text-warning">
                      ★
                    </span>
                  ))}
                  {Array.from({ length: 5 - u.nota }).map((_, i) => (
                    <span key={`e${u.id}-${i}`} className="text-secondary">
                      ★
                    </span>
                  ))}
                </div>

                {/* frase */}
                <p className="small text-success mt-2">“{u.frase}”</p>

                {/* localização */}
                <small className="text-muted">
                  📍 {u.local || "Local indisponível"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
