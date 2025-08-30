import React, { useState } from "react";

export default function PersonalAppointmentModal({ open, onClose, dateISO, time, onSave }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("confirmado");

  const [createReminder, setCreateReminder] = useState(true);
  const [reminderPhone, setReminderPhone] = useState("");
  const [reminderMessage, setReminderMessage] = useState(`Lembrete: ${title || "compromisso"} em ${dateISO} às ${time}`);

  if (!open) return null;

  const save = () => {
    if (!title.trim()) { alert("Dê um título ao compromisso."); return; }
    onSave({ title: title.trim(), note, status, createReminder, reminderPhone, reminderMessage });
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ background:"rgba(0,0,0,0.35)", zIndex: 60 }}>
      <div className="position-absolute top-50 start-50 translate-middle bg-white border rounded shadow p-3" style={{ width: 420 }}>
        <h6 className="mb-2">Novo compromisso — {dateISO} {time}</h6>
        <div className="mb-2">
          <label className="form-label">Título</label>
          <input className="form-control" value={title} onChange={(e)=>{ setTitle(e.target.value); setReminderMessage(`Lembrete: ${e.target.value || "compromisso"} em ${dateISO} às ${time}`); }} placeholder="Ex.: Reunião externa" />
        </div>
        <div className="mb-2">
          <label className="form-label">Anotações</label>
          <textarea className="form-control" rows={3} value={note} onChange={(e)=>setNote(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div className="form-check mb-2">
          <input type="checkbox" className="form-check-input" id="cr" checked={createReminder} onChange={(e)=>setCreateReminder(e.target.checked)} />
          <label className="form-check-label" htmlFor="cr">Criar lembrete para este compromisso</label>
        </div>

        {createReminder && (
          <>
            <div className="mb-2">
              <label className="form-label">WhatsApp (opcional, ex: 5599999999999)</label>
              <input className="form-control" value={reminderPhone} onChange={(e)=>setReminderPhone(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Mensagem do lembrete</label>
              <input className="form-control" value={reminderMessage} onChange={(e)=>setReminderMessage(e.target.value)} />
            </div>
            <small className="text-muted d-block mb-2">
              Obs.: o navegador abrirá o WhatsApp com a mensagem no horário definido. Envio totalmente automático exige servidor + WhatsApp Cloud API.
            </small>
          </>
        )}

        <div className="d-flex justify-content-between">
          <button className="btn btn-link" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar compromisso</button>
        </div>
      </div>
    </div>
  );
}
