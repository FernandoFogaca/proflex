import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import PersonalAppointmentModal from "../components/PersonalAppointmentModal.jsx";

/** ---------- Helpers ---------- */
const toMinutes = (hhmm) => { const [h, m] = String(hhmm).split(":").map(Number); return h * 60 + (m || 0); };
const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const todayISO = () => new Date().toISOString().split("T")[0];
const uid = (p="id") => `${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;

/** ---------- Lembretes (localStorage) ---------- */
const LS_KEY_REM = "reminders";
const loadRems = () => { try { const s = localStorage.getItem(LS_KEY_REM); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveRems = (arr) => { try { localStorage.setItem(LS_KEY_REM, JSON.stringify(arr)); } catch {} };

export default function Agenda() {
  const navigate = useNavigate();
  const { appointments, setAppointments, addAppointment } = useApp();

  /** Data / saudação */
  const [dataSelecionada, setDataSelecionada] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
  const [saudacao, setSaudacao] = useState("");
  useEffect(() => { const h = new Date().getHours(); setSaudacao(h < 12 ? "Bom dia ☀️" : h < 18 ? "Boa tarde 🌤️" : "Boa noite 🌙"); }, []);

  const dataISO = dataSelecionada.toISOString().split("T")[0];
  const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  /** Horários: 9 base; extras aparecem se houver agendamento ou se o usuário adicionar */
  const [horariosBase, setHorariosBase] = useState(["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"]);
  const [novoHorario, setNovoHorario] = useState("09:00");

  const agendamentosDoDia = useMemo(() => appointments.filter(a => a.data === dataISO), [appointments, dataISO]);
  const mapPorHora = useMemo(() => {
    const m = new Map(); for (const a of agendamentosDoDia) if (!m.has(a.hora)) m.set(a.hora, a);
    return m;
  }, [agendamentosDoDia]);
  const horariosExibidos = useMemo(() => {
    const set = new Set(horariosBase); agendamentosDoDia.forEach(a => set.add(a.hora));
    return Array.from(set).sort();
  }, [horariosBase, agendamentosDoDia]);

  /** Próximos 60 min */
  const proximos = useMemo(() => {
    const hoje = todayISO() === dataISO; if (!hoje) return [];
    const now = nowMinutes();
    return agendamentosDoDia
      .filter(a => a.status !== "cancelado")
      .map(a => ({ ...a, min: toMinutes(a.hora) }))
      .filter(a => a.min >= now && a.min <= now + 60)
      .sort((a,b) => a.min - b.min)
      .slice(0, 5);
  }, [agendamentosDoDia, dataISO]);

  /** Estilos de prioridade */
  const slotStyle = (hora) => {
    const a = mapPorHora.get(hora); if (!a) return {};
    const hoje = todayISO() === dataISO; const n = nowMinutes(); const m = toMinutes(hora);
    if (a.status === "cancelado") return { backgroundColor: "#e9ecef", color: "#6c757d", borderColor: "#ced4da" }; // cinza
    if (hoje && m === n) return { backgroundColor: "#f8d7da", color: "#842029", borderColor: "#f5c2c7" }; // vermelho
    if (hoje && m > n && m <= n + 60) return { backgroundColor: "#fff3cd", color: "#664d03", borderColor: "#ffecb5" }; // laranja
    if (a.status === "concluido") return { backgroundColor: "#cfe2ff", color: "#084298", borderColor: "#b6d4fe" }; // azul claro
    return { backgroundColor: "#d1e7dd", color: "#0f5132", borderColor: "#badbcc" }; // verde (confirmado)
  };

  /** Clique em slot */
  const [chooser, setChooser] = useState(null); // {hora}
  const [showPersonal, setShowPersonal] = useState(false); // modal compromisso
  const [personalPreset, setPersonalPreset] = useState({ date: dataISO, time: "09:00" });

  function abrirSlot(hora) {
    const ag = mapPorHora.get(hora);
    if (!ag) {
      // livre → escolher tipo
      setChooser({ hora });
      setPersonalPreset({ date: dataISO, time: hora });
    } else {
      // ocupado → abre cadastro do paciente
      navigate(`/agendar?clienteId=${ag.clienteId}&data=${dataISO}&hora=${hora}`);
    }
  }

  /** Adicionar/remover horários base */
  function adicionarHorarioManualComPicker() {
    if (!novoHorario) return;
    if (!horariosBase.includes(novoHorario)) setHorariosBase((prev) => [...prev, novoHorario].sort());
  }
  function removerHorario(horario) {
    if (mapPorHora.has(horario)) return; // não remove ocupado
    if (window.confirm(`Remover o horário ${horario}?`)) setHorariosBase(horariosBase.filter(h => h !== horario));
  }

  /** Menu de ações no slot ocupado */
  const [menuHora, setMenuHora] = useState(null); // string | null
  const toggleMenu = (hora, e) => { e.stopPropagation(); setMenuHora(prev => prev === hora ? null : hora); };

  const setStatus = (hora, status) => {
    setAppointments(prev => prev.map(a => (a.data === dataISO && a.hora === hora ? { ...a, status } : a)));
    setMenuHora(null);
  };
  const removerAgendamento = (hora) => {
    if (!window.confirm(`Remover agendamento de ${hora}?`)) return;
    setAppointments(prev => prev.filter(a => !(a.data === dataISO && a.hora === hora)));
    setMenuHora(null);
  };

  /** Limpar dia (remove todos os appointments do dia) */
  const limparDia = () => {
    if (!window.confirm(`Remover TODOS os agendamentos de ${dataISO}?`)) return;
    setAppointments(prev => prev.filter(a => a.data !== dataISO));
  };

  /** Lembretes */
  const [reminders, setReminders] = useState(loadRems);
  const timersRef = useRef({}); // {id: timeoutId}
  const scheduleRem = (rem) => {
    if (timersRef.current[rem.id]) clearTimeout(timersRef.current[rem.id]);
    const when = new Date(`${rem.date}T${rem.time}:00`);
    const diff = when.getTime() - Date.now(); if (diff <= 0) return;

    const t = setTimeout(async () => {
      // notificação nativa
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Lembrete da agenda", { body: rem.message || "Você tem um lembrete agora." });
        } else if (Notification.permission !== "denied") {
          try { const p = await Notification.requestPermission(); if (p === "granted") new Notification("Lembrete da agenda", { body: rem.message || "" }); } catch {}
        }
      }
      // banner forte
      alert(`🔔 Lembrete (${rem.time})\n${rem.message || ""}`);

      // WhatsApp: abre wa.me (necessita confirmação/envio no app/site)
      if (rem.whats) {
        const phone = String(rem.whats).replace(/\D/g, "");
        const txt = encodeURIComponent(rem.message || "Lembrete do compromisso");
        const url = `https://wa.me/${phone}?text=${txt}`;
        window.open(url, "_blank");
      }
    }, diff);

    timersRef.current[rem.id] = t;
  };
  useEffect(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    reminders.forEach(scheduleRem);
    saveRems(reminders);
  }, [reminders]);

  // criador rápido
  const [lemMsg, setLemMsg] = useState("");
  const [lemTime, setLemTime] = useState("09:00");
  const [lemWhats, setLemWhats] = useState("");
  const addReminder = () => {
    const r = { id: uid("rem"), date: dataISO, time: lemTime, message: lemMsg, whats: lemWhats.trim() || "" };
    setReminders((prev) => [...prev, r]); setLemMsg("");
  };
  const removeReminder = (id) => setReminders((prev) => prev.filter(r => r.id !== id));

  /** Salvar compromisso simples (modal) */
  const onSavePersonal = ({ title, note, status, createReminder, reminderPhone, reminderMessage }) => {
    addAppointment({
      data: dataISO,
      hora: personalPreset.time,
      clienteId: null,
      clienteNome: `Compromisso: ${title}`,
      observacoes: note || "",
      tipo: "pessoal",
      status: status || "confirmado"
    });
    if (createReminder) {
      setReminders(prev => [...prev, {
        id: uid("rem"),
        date: dataISO,
        time: personalPreset.time,
        message: reminderMessage || `Lembrete: ${title}`,
        whats: (reminderPhone || "").trim()
      }]);
    }
    setShowPersonal(false);
    setChooser(null);
  };

  /** Render */
  return (
    <div className="min-vh-100 bg-light">
      {/* Cabeçalho */}
      <div className="text-center p-3">
        <h5 className="mb-2">{saudacao}</h5>
        <p className="text-white bg-primary d-inline-block px-3 py-1 rounded">{dataFormatada}</p>
        <div className="d-flex justify-content-center">
          <input type="date" className="form-control w-auto my-2" value={dataISO} onChange={(e) => setDataSelecionada(new Date(e.target.value))} />
        </div>
      </div>

      {/* Painéis superiores */}
      <div className="container mb-3">
        <div className="row g-3">
          <div className="col-md-7">
            <div className="p-3 border rounded bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="m-0">⏱️ Próximos 60 minutos</h6>
                <small className="text-muted">{proximos.length} agendamento(s)</small>
              </div>
              {proximos.length === 0 ? (
                <div className="text-muted mt-2">Sem próximos agendamentos.</div>
              ) : (
                <ul className="list-group list-group-flush mt-2">
                  {proximos.map(p => (
                    <li key={p.id} className="list-group-item d-flex justify-content-between">
                      <span><strong>{p.hora}</strong> — {p.clienteNome || "Cliente"}</span>
                      <span className={`badge ${p.status==="cancelado"?"text-bg-secondary":p.status==="concluido"?"text-bg-primary":"text-bg-warning"}`}>
                        {p.status==="cancelado"?"cancelado":p.status==="concluido"?"concluído":"em breve"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <div className="p-3 border rounded bg-white">
              <h6 className="m-0">🔔 Lembrete rápido</h6>
              <div className="row g-2 mt-2">
                <div className="col-4"><input type="time" className="form-control" value={lemTime} onChange={(e)=>setLemTime(e.target.value)} /></div>
                <div className="col-8"><input className="form-control" placeholder="Mensagem" value={lemMsg} onChange={(e)=>setLemMsg(e.target.value)} /></div>
                <div className="col-8"><input className="form-control" placeholder="WhatsApp (opcional, ex: 5599999999999)" value={lemWhats} onChange={(e)=>setLemWhats(e.target.value)} /></div>
                <div className="col-4 text-end"><button className="btn btn-primary w-100" onClick={addReminder}>Criar</button></div>
              </div>
              <ul className="list-group list-group-flush mt-2">
                {reminders.filter(r => r.date === dataISO).sort((a,b)=> a.time.localeCompare(b.time)).map(r => (
                  <li key={r.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div><strong>{r.time}</strong> — {r.message || "(sem mensagem)"}{r.whats && <span className="badge text-bg-success ms-2">WhatsApp</span>}</div>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>removeReminder(r.id)}>remover</button>
                  </li>
                ))}
                {reminders.filter(r => r.date === dataISO).length === 0 && (
                  <li className="list-group-item text-muted">Sem lembretes para este dia.</li>
                )}
              </ul>
              <small className="text-muted d-block mt-2">
                Obs.: para envio automático real no WhatsApp é preciso servidor + WhatsApp Cloud API. Aqui abrimos o WhatsApp com a mensagem no horário.
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de horários — estreita e baixa */}
      <div className="container pb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="m-0">Horários</h6>
          <div className="d-flex gap-2 align-items-center small">
            <span className="badge text-bg-success">confirmado</span>
            <span className="badge text-bg-warning">próximo</span>
            <span className="badge text-bg-danger">na hora</span>
            <span className="badge text-bg-secondary">cancelado</span>
          </div>
        </div>

        {/* colunas automáticas: caixinhas estreitas */}
        <div className="row row-cols-auto g-2">
          {horariosExibidos.map((hora) => {
            const ag = mapPorHora.get(hora);
            const ocupado = Boolean(ag);
            const style = {
              minHeight: 40, // metade da altura
              width: 110,    // ↓ largura menor
              fontSize: 13,
              ...(ocupado ? slotStyle(hora) : {})
            };
            return (
              <div key={hora} className="col">
                <div
                  className="p-2 text-center shadow-sm border rounded bg-white position-relative"
                  style={style}
                  onClick={() => abrirSlot(hora)}
                  title={ocupado ? (ag.clienteNome || "Agendado") : "Disponível"}
                >
                  <div className="fw-semibold text-truncate">{hora}</div>
                  {ocupado ? (
                    <div className="small mt-1 text-truncate" style={{maxWidth: "100%"}}>
                      {ag.clienteNome || "Cliente"}
                    </div>
                  ) : (
                    <div className="text-muted small mt-1">livre</div>
                  )}

                  {/* Botão remover horário base (se livre) */}
                  {!ocupado && horariosBase.includes(hora) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                      style={{ lineHeight: "12px", padding: "0 6px" }}
                      onClick={(e) => { e.stopPropagation(); removerHorario(hora); }}
                      aria-label={`Remover ${hora}`}
                    >
                      ×
                    </button>
                  )}

                  {/* Menu de ações para slot ocupado */}
                  {ocupado && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-light position-absolute top-0 end-0"
                        style={{ lineHeight: "12px", padding: "0 6px" }}
                        onClick={(e)=>toggleMenu(hora, e)}
                        aria-label="Ações"
                      >⋮</button>

                      {menuHora === hora && (
                        <div
                          className="position-absolute bg-white border rounded shadow p-2"
                          style={{ top: "22px", right: "4px", zIndex: 5, width: 180 }}
                          onClick={(e)=>e.stopPropagation()}
                        >
                          <button className="dropdown-item" onClick={()=>setStatus(hora, "confirmado")}>✅ Confirmar</button>
                          <button className="dropdown-item" onClick={()=>setStatus(hora, "concluido")}>📘 Concluído</button>
                          <button className="dropdown-item" onClick={()=>setStatus(hora, "cancelado")}>🚫 Cancelar</button>
                          <button className="dropdown-item"
                            onClick={()=>{
                              // cria lembrete para esse horário (mensagem curta)
                              const r = { id: uid("rem"), date: dataISO, time: hora, message: `Lembrete: ${ag.clienteNome || "Cliente"} às ${hora}`, whats: "" };
                              setReminders(prev => [...prev, r]);
                              setMenuHora(null);
                              alert("Lembrete criado para este horário.");
                            }}
                          >🔔 Lembrar</button>
                          <button className="dropdown-item text-danger" onClick={()=>removerAgendamento(hora)}>🗑️ Remover</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Adicionar novo horário + limpar dia */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="d-flex gap-2">
            <input type="time" step="300" className="form-control w-auto" value={novoHorario} onChange={(e) => setNovoHorario(e.target.value)} />
            <button type="button" className="proflex-button" onClick={adicionarHorarioManualComPicker}>➕ Adicionar horário</button>
          </div>
          <button className="btn btn-outline-danger" onClick={limparDia}>🧹 Limpar dia</button>
        </div>
      </div>

      {/* Modal “Consulta x Compromisso” */}
      {chooser && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background:"rgba(0,0,0,0.35)", zIndex: 50 }}>
          <div className="position-absolute top-50 start-50 translate-middle bg-white border rounded shadow p-3" style={{ width: 360 }}>
            <h6 className="mb-2">Agendar {dataISO} — {chooser.hora}</h6>
            <p className="mb-3 text-muted small">Escolha o tipo de agendamento:</p>
            <div className="d-flex justify-content-between">
              <button className="btn btn-primary" onClick={()=>navigate(`/agendar?data=${dataISO}&hora=${chooser.hora}`)}>🧑‍⚕️ Consulta (paciente)</button>
              <button className="btn btn-secondary" onClick={()=>{ setShowPersonal(true); }}>🗓️ Compromisso</button>
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-link" onClick={()=>setChooser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de compromisso simples */}
      <PersonalAppointmentModal
        open={showPersonal}
        onClose={()=>{ setShowPersonal(false); if (!menuHora) setChooser(null); }}
        dateISO={personalPreset.date}
        time={personalPreset.time}
        onSave={onSavePersonal}
      />

      <footer className="text-center text-muted py-3 border-top">
        <p className="m-0">🕒 Agora: {new Date().toLocaleTimeString("pt-BR")}</p>
      </footer>
    </div>
  );
}
