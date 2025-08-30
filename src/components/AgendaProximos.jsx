// painel "Próximas 4 horas" + arrastar item pra concluir/cancelar
import React, { useRef, useState } from "react";

export default function AgendaProximos({ itens, onSetStatus }) {
  // controla o arrasto do item
  const [arrasto, setArrasto] = useState({ id: null, desloc: 0 });
  const toque = useRef({ id: null, x0: 0 });

  const LIMITE_MAX = 80;     // arrasta no máximo 80px
  const LIMITE_OK = 50;      // acima de 50px dispara ação

  function comecarArrasto(id, evento) {
    const x = evento.touches?.[0]?.clientX || 0; // ponto inicial
    toque.current = { id, x0: x };
    setArrasto({ id, desloc: 0 });
  }

  function moverArrasto(id, evento) {
    if (toque.current.id !== id) return;
    const x = evento.touches?.[0]?.clientX || 0;
    let desloc = x - toque.current.x0;           // quanto andou
    if (desloc >  LIMITE_MAX)  desloc =  LIMITE_MAX;
    if (desloc < -LIMITE_MAX)  desloc = -LIMITE_MAX;
    setArrasto({ id, desloc });
  }

  function soltarArrasto(item) {
    const { id, desloc } = arrasto;
    if (id !== item.id) return;
    setArrasto({ id: null, desloc: 0 });         // volta pro lugar

    // direita = concluído / esquerda = cancelado
    if (desloc >  LIMITE_OK)  onSetStatus(item.hora, "concluido");
    if (desloc < -LIMITE_OK) onSetStatus(item.hora, "cancelado");
  }

  return (
    <div className="p-3 border rounded bg-white">
      <div className="d-flex justify-content-between align-items-center">
        <h6 className="m-0">⏱️ Próximas 4 horas</h6>
        <small className="text-muted">{itens.length} agendamento(s)</small>
      </div>

      {itens.length === 0 ? (
        <div className="text-muted mt-2">Sem próximos agendamentos.</div>
      ) : (
        <ul className="list-group list-group-flush mt-2">
          {itens.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex justify-content-between"
              onTouchStart={(evento) => comecarArrasto(item.id, evento)}
              onTouchMove={(evento) => moverArrasto(item.id, evento)}
              onTouchEnd={() => soltarArrasto(item)}
              style={{
                transform:
                  arrasto.id === item.id ? `translateX(${arrasto.desloc}px)` : undefined,
                transition: arrasto.id === item.id ? "none" : "transform .15s ease",
              }}
            >
              <span>
                <strong>{item.hora}</strong> — {item.clienteNome || "Cliente"}
              </span>
              <span
                className={`badge ${
                  item.status === "cancelado"
                    ? "text-bg-secondary"
                    : item.status === "concluido"
                    ? "text-bg-primary"
                    : "text-bg-warning"
                }`}
              >
                {item.status === "cancelado"
                  ? "cancelado"
                  : item.status === "concluido"
                  ? "concluído"
                  : "em breve"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
