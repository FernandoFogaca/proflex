import React, { useMemo } from "react";

// aniversariantes do dia (usa nascimento: "YYYY-MM-DD")
export default function AniversariosHoje({ lista = [] }) {
  const dataHoje = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return { mm, dd, rotulo: d.toLocaleDateString() };
  }, []);

  const aniversariantes = useMemo(() => {
    return (lista || []).filter((p) => {
      const nasc = String(p.nascimento || "");
      const partes = nasc.split("-");
      if (partes.length < 3) return false;
      const mes = partes[1];
      const dia = partes[2];
      return mes === dataHoje.mm && dia === dataHoje.dd;
    });
  }, [lista, dataHoje.mm, dataHoje.dd]);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span role="img" aria-label="bolo">🎂</span>
          <strong>Aniversários de hoje</strong>
          <span className="text-muted small ms-2">{dataHoje.rotulo}</span>
          {aniversariantes.length > 0 && (
            <span className="badge text-bg-success ms-2">{aniversariantes.length}</span>
          )}
        </div>

        {aniversariantes.length === 0 ? (
          <p className="text-muted m-0">Sem aniversariantes.</p>
        ) : (
          <div className="d-flex flex-wrap gap-2">
            {aniversariantes.map((p) => {
              const nome = p.nome || "Sem nome";
              const msg = encodeURIComponent(`Parabéns ${nome}! muita saúde e sucesso`);
              const fone = String(p.telefone || "").replace(/\D/g, "");
              const wa = fone ? `https://wa.me/${fone}?text=${msg}` : `https://wa.me/?text=${msg}`;
              return (
                <div key={p.id} className="border rounded p-2 d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-light border"
                    style={{ width: 36, height: 36, overflow: "hidden" }}
                    title={nome}
                  >
                    {p.fotoPerfilUrl ? (
                      <img
                        src={p.fotoPerfilUrl}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex justify-content-center align-items-center text-muted">
                        {nome.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="small">{nome}</div>
                  <a className="btn btn-sm btn-success ms-2" href={wa} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
