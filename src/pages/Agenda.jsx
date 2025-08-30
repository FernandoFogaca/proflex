// AGENDA DA CLINICA.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import PersonalAppointmentModal from "../components/PersonalAppointmentModal.jsx";
import AgendaLembretes from "../components/AgendaLembretes.jsx";
import AgendaProximos from "../components/AgendaProximos.jsx";

//*************************** */ HELPERS SIMPLES (HORA EM MINUTOS, HOJE EM ISO, ID CURTO)
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + (m || 0);
};
const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
const todayISO = () => new Date().toISOString().split("T")[0];
const uid = (p = "id") =>
  `${p}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;

//*************************************** */ LEMBRETES SALVOS NO NAVEGADOR (LOCALSTORAGE)
const LS_KEY_REM = "reminders";
const loadRems = () => {
  try {
    const s = localStorage.getItem(LS_KEY_REM);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
};
const saveRems = (arr) => {
  try {
    localStorage.setItem(LS_KEY_REM, JSON.stringify(arr));
  } catch {}
};

export default function Agenda() {
  const navigate = useNavigate();
  const { appointments, setAppointments, addAppointment } = useApp();

  // *******************************************DATA ESCOLHIDA E SAUDACAO DO TOPO
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [saudacao, setSaudacao] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    setSaudacao(h < 12 ? "Bom dia ☀️" : h < 18 ? "Boa tarde 🌤️" : "Boa noite 🌙");
  }, []);

  const dataISO = dataSelecionada.toISOString().split("T")[0];
  const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //******************** */ HORARIOS BASE VISIVEIS; OUTROS APARECEM QUANDO TIVER AGENDAMENTO
  const [horariosBase, setHorariosBase] = useState([
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
  ]);
  const [novoHorario, setNovoHorario] = useState("09:00");

  //******************************* */ AGENDAMENTOS DO DIA ATUAL + MAPA POR HORA
  const agendamentosDoDia = useMemo(
    () => appointments.filter((a) => a.data === dataISO),
    [appointments, dataISO]
  );
  const mapPorHora = useMemo(() => {
    const m = new Map();
    for (const a of agendamentosDoDia) if (!m.has(a.hora)) m.set(a.hora, a);
    return m;
  }, [agendamentosDoDia]);
  const horariosExibidos = useMemo(() => {
    const set = new Set(horariosBase);
    agendamentosDoDia.forEach((a) => set.add(a.hora));
    return Array.from(set).sort();
  }, [horariosBase, agendamentosDoDia]);

  // **************************PAINEL PROXIMAS 4 HORAS (SO HOJE E SEM CANCELADOS)
  const proximos = useMemo(() => {
    const hoje = todayISO() === dataISO;
    if (!hoje) return [];
    const now = nowMinutes();
    return agendamentosDoDia
      .filter((a) => a.status !== "cancelado")
      .map((a) => ({ ...a, min: toMinutes(a.hora) }))
      .filter((a) => a.min >= now && a.min <= now + 240) // 4 HORAS = 240 MIN
      .sort((a, b) => a.min - b.min);
  }, [agendamentosDoDia, dataISO]);

  //********************************COR DO SLOT CONFORME STATUS E TEMPO
  const slotStyle = (hora) => {
    const a = mapPorHora.get(hora);
    if (!a) return {};
    const hoje = todayISO() === dataISO;
    const n = nowMinutes();
    const m = toMinutes(hora);
    if (a.status === "cancelado")
      return { backgroundColor: "#e9ecef", color: "#6c757d", borderColor: "#ced4da" }; // CINZA
    if (hoje && m === n)
      return { backgroundColor: "#f8d7da", color: "#842029", borderColor: "#f5c2c7" }; // VERMELHO (NA HORA)
    if (hoje && m > n && m <= n + 240)
      return { backgroundColor: "#fff3cd", color: "#664d03", borderColor: "#ffecb5" }; // LARANJA (PROXIMAS 4H)
    if (a.status === "concluido")
      return { backgroundColor: "#cfe2ff", color: "#084298", borderColor: "#b6d4fe" }; // AZUL
    return { backgroundColor: "#d1e7dd", color: "#0f5132", borderColor: "#badbcc" }; // VERDE (CONFIRMADO)
  };

  //************************ */ CLIQUE EM UM QUADRADINHO (SLOT)
  const [chooser, setChooser] = useState(null); // {HORA}
  const [showPersonal, setShowPersonal] = useState(false); // MODAL COMPROMISSO SIMPLES
  const [personalPreset, setPersonalPreset] = useState({ date: dataISO, time: "09:00" });

  function abrirSlot(hora) {
    const ag = mapPorHora.get(hora);
    if (!ag) {
      //********************* */ LIVRE  ESCOLHER TIPO (CONSULTA X COMPROMISSO)
      setChooser({ hora });
      setPersonalPreset({ date: dataISO, time: hora });
    } else {
      // OCUPADO -> ABRIR CADASTRO DO PACIENTE
      navigate(`/agendar?clienteId=${ag.clienteId}&data=${dataISO}&hora=${hora}`);
    }
  }

  //************* */ ADICIONAR/REMOVER HORARIOS BASE (REMOVE SE ESTIVER LIVRE)
  function adicionarHorarioManualComPicker() {
    if (!novoHorario) return;
    if (!horariosBase.includes(novoHorario))
      setHorariosBase((prev) => [...prev, novoHorario].sort());
  }
  function removerHorario(horario) {
    if (mapPorHora.has(horario)) return; // NAO REMOVE SE TIVER AGENDAMENTO
    if (window.confirm(`Remover o horário ${horario}?`))
      setHorariosBase(horariosBase.filter((h) => h !== horario));
  }

  //***************** */ MENU DE ACOES (CONFIRMAR, CONCLUIR, CANCELAR, LEMBRAR, REMOVER)
  const [menuHora, setMenuHora] = useState(null);
  const toggleMenu = (hora, e) => {
    e.stopPropagation();
    setMenuHora((prev) => (prev === hora ? null : hora));
  };

  const setStatus = (hora, status) => {
    setAppointments((prev) =>
      prev.map((a) => (a.data === dataISO && a.hora === hora ? { ...a, status } : a))
    );
    setMenuHora(null);
  };
  const removerAgendamento = (hora) => {
    if (!window.confirm(`Remover agendamento de ${hora}?`)) return;
    setAppointments((prev) => prev.filter((a) => !(a.data === dataISO && a.hora === hora)));
    setMenuHora(null);
  };

  //************************************ */ LIMPAR TODOS DO DIA
  const limparDia = () => {
    if (!window.confirm(`Remover TODOS os agendamentos de ${dataISO}?`)) return;
    setAppointments((prev) => prev.filter((a) => a.data !== dataISO));
  };

  // *********************LEMBRETES (DISPARA NOTIFICACAO/ALERTA; PODE ABRIR WHATSAPP)
  const [reminders, setReminders] = useState(loadRems);
  const timersRef = useRef({}); // {ID: TIMEOUTID}

  const scheduleRem = (rem) => {
    if (timersRef.current[rem.id]) clearTimeout(timersRef.current[rem.id]);
    const when = new Date(`${rem.date}T${rem.time}:00`);
    const diff = when.getTime() - Date.now();
    if (diff <= 0) return;

    const t = setTimeout(async () => {
      //****************************** */ NOTIFICACAO NATIVA
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Lembrete da agenda", {
            body: rem.message || "Você tem um lembrete agora.",
          });
        } else if (Notification.permission !== "denied") {
          try {
            const p = await Notification.requestPermission();
            if (p === "granted")
              new Notification("Lembrete da agenda", { body: rem.message || "" });
          } catch {}
        }
      }
      // ************************ALERTA NA TELA (GARANTE QUE APARECA ALGO)
      alert(`🔔 Lembrete (${rem.time})\n${rem.message || ""}`);

      // ABRIR WHATSAPP COM A MENSAGEM (PRECISA DO APP/SITE DO WHATS)
      if (rem.whats) {
        const phone = String(rem.whats).replace(/\D/g, "");
        const txt = encodeURIComponent(rem.message || "Lembrete do compromisso");
        const url = `https://wa.me/${phone}?text=${txt}`;
        window.open(url, "_blank");
      }
    }, diff);

    timersRef.current[rem.id] = t;
  };

  // REPROGRAMA TIMERS QUANDO A LISTA DE LEMBRETES MUDA
  useEffect(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    reminders.forEach(scheduleRem);
    saveRems(reminders);
  }, [reminders]);

  // FUNCOES DO PULL-TO-REFRESH ****************************************************************************************
  // PARA GUARDAR A MENSAGEM ENQUANTO PUXA
  const [pullMsg, setPullMsg] = useState("");
  const pullRef = useRef({ y0: 0, ok: false }); // GUARDA DADOS DO TOQUE

  function onPullStart(e) {
    if (window.scrollY > 0) return; // SE JA RODOU PRA BAIXO, IGNORA
    pullRef.current.y0 = e.touches?.[0]?.clientY || 0; // POSICAO DO DEDO
    pullRef.current.ok = true;
  }
  // ENQUANTO ARRASTA O DEDO PRA BAIXO, MEDE A DISTANCIA PUXADA (DY)
  function onPullMove(e) {
    if (!pullRef.current.ok) return; // SE NAO COMECou, IGNORA
    const y = e.touches?.[0]?.clientY || 0; // Y ATUAL DO DEDO
    const dy = y - pullRef.current.y0; // QUANTO DESCEU
    if (dy > 60) setPullMsg("Solte para atualizar"); // PASSOU DO LIMITE: PODE SOLTAR
    else if (dy > 10) setPullMsg("Puxando…"); // COMECou A PUXAR, AINDA POUCO
  }
  // QUANDO SOLTA O DEDO, DECIDE SE ATUALIZA OU NAO
  function onPullEnd() {
    if (!pullRef.current.ok) return;
    pullRef.current.ok = false; // TERMINA O GESTO
    if (pullMsg.startsWith("Solte")) {
      // AQUI FARIA O REFRESH DE VERDADE (EX: BUSCAR NO SERVIDOR)
      setPullMsg("Atualizado");
      setTimeout(() => setPullMsg(""), 900); // SOME DEPOIS DE 0,9S
    } else {
      setPullMsg(""); // NAO PUXOU O SUFICIENTE
    }
  }

  // SALVAR COMPROMISSO SIMPLES (MODAL)
  const onSavePersonal = ({
    title,
    note,
    status,
    createReminder,
    reminderPhone,
    reminderMessage,
  }) => {
    addAppointment({
      data: dataISO,
      hora: personalPreset.time,
      clienteId: null,
      clienteNome: `Compromisso: ${title}`,
      observacoes: note || "",
      tipo: "pessoal",
      status: status || "confirmado",
    });
    if (createReminder) {
      setReminders((prev) => [
        ...prev,
        {
          id: uid("rem"),
          date: dataISO,
          time: personalPreset.time,
          message: reminderMessage || `Lembrete: ${title}`,
          whats: (reminderPhone || "").trim(),
        },
      ]);
    }
    setShowPersonal(false);
    setChooser(null);
  };

  // TELA
  return (
    <div
      className="min-vh-100 bg-light"
      // EVENTOS DO PULL-TO-REFRESH (MOBILE)
      onTouchStart={onPullStart}
      onTouchMove={onPullMove}
      onTouchEnd={onPullEnd}
    >
      {/* TOPO COM DATA E SAUDACAO */}
      <div className="text-center p-3">
        <h5 className="mb-2">{saudacao}</h5>
        <p className="text-white bg-primary d-inline-block px-3 py-1 rounded">
          {dataFormatada}
        </p>
        <div className="d-flex justify-content-center">
          <input
            type="date"
            className="form-control w-auto my-2"
            value={dataISO}
            onChange={(e) => setDataSelecionada(new Date(e.target.value))}
          />
        </div>
      </div>

      {/* MENSAGEM DO PULL-TO-REFRESH (OPCIONAL) */}
      {pullMsg && (
        <div className="text-center small text-muted py-1">{pullMsg}</div>
      )}

      {/* PANEIS DE CIMA (ESQUERDA: PROXIMAS 4H | DIREITA: LEMBRETE RAPIDO) */}
      <div className="container mb-3">
        <div className="row g-3">
          <div className="col-md-7">
            {/* USANDO COMPONENTE PROXIMOS */}
            <AgendaProximos itens={proximos} onSetStatus={setStatus} />
          </div>

          <div className="col-md-5">
            {/* USANDO COMPONENTE LEMBRETES */}
            <AgendaLembretes
              dataISO={dataISO}
              itens={reminders}
              onAdd={(hora, msg, whats) => {
                const r = {
                  id: uid("rem"),
                  date: dataISO,
                  time: hora,
                  message: msg,
                  whats: (whats || "").trim(),
                };
                setReminders((prev) => [...prev, r]);
              }}
              onRemove={(id) =>
                setReminders((prev) => prev.filter((r) => r.id !== id))
              }
            />
          </div>
        </div>
      </div>

      {/* GRADE DE HORARIOS (OS QUADRADINHOS) */}
      <div className="container pb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="m-0">Horarios</h6>
          <div className="d-flex gap-2 align-items-center small">
            <span className="badge text-bg-success">confirmado</span>
            <span className="badge text-bg-warning">proximo</span>
            <span className="badge text-bg-danger">na hora</span>
            <span className="badge text-bg-secondary">cancelado</span>
          </div>
        </div>

        {/* CAIXINHAS */}
        <div className="row row-cols-auto g-2">
          {horariosExibidos.map((hora) => {
            const ag = mapPorHora.get(hora);
            const ocupado = Boolean(ag);
            const style = {
              minHeight: 40, // ALTURA
              width: 110, // LARGURA
              fontSize: 13,
              ...(ocupado ? slotStyle(hora) : {}),
            };
            return (
              <div key={hora} className="col">
                <div
                  className="p-2 text-center shadow-sm border rounded bg-white position-relative"
                  style={style}
                  onClick={() => abrirSlot(hora)}
                  title={ocupado ? ag.clienteNome || "Agendado" : "Disponivel"}
                >
                  <div className="fw-semibold text-truncate">{hora}</div>
                  {ocupado ? (
                    <div className="small mt-1 text-truncate" style={{ maxWidth: "100%" }}>
                      {ag.clienteNome || "Cliente"}
                    </div>
                  ) : (
                    <div className="text-muted small mt-1">livre</div>
                  )}

                  {/* REMOVER HORARIO BASE (SO SE ESTIVER LIVRE) */}
                  {!ocupado && horariosBase.includes(hora) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                      style={{ lineHeight: "12px", padding: "0 6px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removerHorario(hora);
                      }}
                      aria-label={`Remover ${hora}`}
                    >
                      ×
                    </button>
                  )}

                  {/* MENU DE ACOES (QUANDO OCUPADO) */}
                  {ocupado && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-light position-absolute top-0 end-0"
                        style={{ lineHeight: "12px", padding: "0 6px" }}
                        onClick={(e) => toggleMenu(hora, e)}
                        aria-label="Acoes"
                      >
                        ⋮
                      </button>

                      {menuHora === hora && (
                        <div
                          className="position-absolute bg-white border rounded shadow p-2"
                          style={{ top: "22px", right: "4px", zIndex: 5, width: 180 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="dropdown-item"
                            onClick={() => setStatus(hora, "confirmado")}
                          >
                            ✅ Confirmar
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => setStatus(hora, "concluido")}
                          >
                            📘 Concluido
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => setStatus(hora, "cancelado")}
                          >
                            🚫 Cancelar
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              // CRIA LEMBRETE CURTO PRA ESSE HORARIO
                              const r = {
                                id: uid("rem"),
                                date: dataISO,
                                time: hora,
                                message: `Lembrete: ${ag.clienteNome || "Cliente"} as ${hora}`,
                                whats: "",
                              };
                              setReminders((prev) => [...prev, r]);
                              setMenuHora(null);
                              alert("Lembrete criado para este horario.");
                            }}
                          >
                            🔔 Lembrar
                          </button>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => removerAgendamento(hora)}
                          >
                            🗑️ Remover
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ADICIONAR HORARIO + LIMPAR DIA */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="d-flex gap-2">
            <input
              type="time"
              step="300"
              className="form-control w-auto"
              value={novoHorario}
              onChange={(e) => setNovoHorario(e.target.value)}
            />
            <button
              type="button"
              className="proflex-button"
              onClick={adicionarHorarioManualComPicker}
            >
              ➕ Adicionar horario
            </button>
          </div>
          <button className="btn btn-outline-danger" onClick={limparDia}>
            🧹 Limpar dia
          </button>
        </div>
      </div>

      {/* MODAL: ESCOLHER ENTRE CONSULTA X COMPROMISSO */}
      {chooser && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.35)", zIndex: 50 }}
        >
          <div
            className="position-absolute top-50 start-50 translate-middle bg-white border rounded shadow p-3"
            style={{ width: 360 }}
          >
            <h6 className="mb-2">
              Agendar {dataISO} — {chooser.hora}
            </h6>
            <p className="mb-3 text-muted small">Escolha o tipo de agendamento:</p>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate(`/agendar?data=${dataISO}&hora=${chooser.hora}`)
                }
              >
                🧑‍⚕️ Consulta (paciente)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPersonal(true);
                }}
              >
                🗓️ Compromisso
              </button>
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-link" onClick={() => setChooser(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE COMPROMISSO SIMPLES */}
      <PersonalAppointmentModal
        open={showPersonal}
        onClose={() => {
          setShowPersonal(false);
          if (!menuHora) setChooser(null);
        }}
        dateISO={personalPreset.date}
        time={personalPreset.time}
        onSave={onSavePersonal}
      />

      {/* RODAPE SIMPLES COM HORA ATUAL */}
      <footer className="text-center text-muted py-3 border-top">
        <p className="m-0">🕒 Agora: {new Date().toLocaleTimeString("pt-BR")}</p>
      </footer>
    </div>
  );
}
