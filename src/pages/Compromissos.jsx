import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const uid = (p="id") => `${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;
const LS_KEY_REM = "reminders";
const loadRems = () => { try { const s = localStorage.getItem(LS_KEY_REM); return s ? JSON.parse(s) : []; } catch { return []; } };
const saveRems = (arr) => { try { localStorage.setItem(LS_KEY_REM, JSON.stringify(arr)); } catch {} };

export default function Compromissos() {
  const { appointments, addAppointment, setAppointments } = useApp();

  // filtro por data
  const [dataISO, setDataISO] = useState(() => new Date().toISOString().slice(0,10));
  const [mostrarTodos, setMostrarTodos] = useState(true);

  // form novo compromisso
  const [time, setTime] = useState("09:00");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("confirmado");
  const [reminderOn, setReminderOn] = useState(true);
  const [reminderPhone, setReminderPhone] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  // lembretes
  const [reminders, setReminders] = useState(loadRems);
  const timersRef = useRef({}); // {id: timeoutId}

  const scheduleRem = (rem) => {
    if (timersRef.current[rem.id]) clearTimeout(timersRef.current[rem.id]);
    const when = new Date(`${rem.date}T${rem.time}:00`);
    const diff = when.getTime() - Date.now();
    if (diff <= 0) return;
    const t = setTimeout(async () => {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Lembrete", { body: rem.message || "Você tem um lembrete agora." });
        } else if (Notification.permission !== "denied") {
          try { const p = await Notification.requestPermission(); if (p === "granted") new Notification("Lembrete", { body: rem.message || "" }); } catch {}
        }
      }
      alert(`🔔 Lembrete (${rem.time})\n${rem.message || ""}`);
      if (rem.whats) {
        const phone = String(rem.whats).replace(/\D/g, "");
        const txt = encodeURIComponent(rem.message || "Lembrete do compromisso");
        window.open(`https://wa.me/${phone}?text=${txt}`, "_blank");
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

  const compromissos = useMemo(() => {
    const todos = appointments.filter(a => a.tipo === "pessoal");
    if (mostrarTodos) {
      return [...todos].sort((a,b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora));
    }
    return todos.filter(a => a.data === dataISO)
      .sort((a,b) => a.hora.localeCompare(b.hora));
  }, [appointments, dataISO, mostrarTodos]);

  const criar = () => {
    if (!title.trim()) { alert("Dê um título ao compromisso."); return; }
    const comp = addAppointment({
      data: dataISO,
      hora: time,
      clienteId: null,
      clienteNome: `Compromisso: ${title.trim()}`,
      observacoes: note || "",
      tipo: "pessoal",
      status
    });
    if (reminderOn) {
      setReminders(prev => [...prev, {
        id: uid("rem"),
        date: dataISO,
        time,
        message: reminderMessage || `Lembrete: ${title.trim()} em ${dataISO} às ${time}`,
        whats: (reminderPhone || "").trim()
      }]);
    }
    setTitle(""); setNote(""); setReminderMessage("");
  };

  const setStatusComp = (id, novo) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: novo } : a));
  };

  const excluir = (id) => {
    if (!window.confirm("Remover este compromisso?")) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const limparDia = () => {
    if (!window.confirm(`Remover TODOS os compromissos pessoais de ${dataISO}?`)) return;
    setAppointments(prev => prev.filter(a => !(a.tipo === "pessoal" && a.data === dataISO)));
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">Compromissos</h4>

      {/* Filtro */}
      <div className="row g-2 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Data</label>
          <input type="date" className="form-control" value={dataISO} onChange={(e)=>setDataISO(e.target.value)} />
        </div>
        <div className="col-md-3">
          <div className="form-check mt-4">
            <input className="form-check-input" type="checkbox" id="todos" checked={mostrarTodos} onChange={(e)=>setMostrarTodos(e.target.checked)} />
            <label className="form-check-label" htmlFor="todos">Mostrar todos os futuros</label>
          </div>
        </div>
        <div className="col text-end">
          <button className="btn btn-outline-danger mt-4" onClick={limparDia}>🧹 Limpar dia</button>
        </div>
      </div>

      <hr className="my-3" />

      {/* Novo compromisso */}
      <div className="p-3 border rounded bg-white mb-3">
        <h6>Novo compromisso</h6>
        <div className="row g-2">
          <div className="col-md-2">
            <label className="form-label">Hora</label>
            <input type="time" className="form-control" value={time} onChange={(e)=>setTime(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Título</label>
            <input className="form-control" value={title} onChange={(e)=>{ setTitle(e.target.value); setReminderMessage(`Lembrete: ${e.target.value || "compromisso"} em ${dataISO} às ${time}`); }} placeholder="Ex.: Reunião externa" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Anotações</label>
            <input className="form-control" value={note} onChange={(e)=>setNote(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="col-12 mt-2">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rem" checked={reminderOn} onChange={(e)=>setReminderOn(e.target.checked)} />
              <label className="form-check-label" htmlFor="rem">Criar lembrete</label>
            </div>
          </div>
          {reminderOn && (
            <>
              <div className="col-md-3">
                <label className="form-label">WhatsApp (opcional)</label>
                <input className="form-control" placeholder="ex: 5599999999999" value={reminderPhone} onChange={(e)=>setReminderPhone(e.target.value)} />
              </div>
              <div className="col-md-7">
                <label className="form-label">Mensagem do lembrete</label>
                <input className="form-control" value={reminderMessage} onChange={(e)=>setReminderMessage(e.target.value)} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-primary w-100" onClick={criar}>Salvar</button>
              </div>
            </>
          )}
          {!reminderOn && (
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={criar}>Salvar</button>
            </div>
          )}
        </div>
        <small className="text-muted d-block mt-2">
          Obs.: o envio automático real no WhatsApp exige servidor + WhatsApp Cloud API. Aqui, no horário, abrimos o WhatsApp com a mensagem.
        </small>
      </div>

      {/* Lista */}
      <div className="p-3 border rounded bg-white">
        <h6 className="mb-2">Lista</h6>
        <ul className="list-group list-group-flush">
          {compromissos.length === 0 && <li className="list-group-item text-muted">Sem compromissos.</li>}
          {compromissos.map(c => (
            <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{c.data}</strong> — <strong>{c.hora}</strong> — {c.clienteNome?.replace(/^Compromisso:\s*/, "")}
                {c.observacoes ? ` — ${c.observacoes}` : ""}
              </div>
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm" value={c.status} onChange={(e)=>setStatusComp(c.id, e.target.value)}>
                  <option value="confirmado">Confirmado</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>excluir(c.id)}>Remover</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
