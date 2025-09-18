
import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export default function WhatsappPanel() {
  const { whatsappPhone, connectWhatsapp, disconnectWhatsapp, openWA } = useApp();
  const [num, setNum] = useState(whatsappPhone);
  const [msg, setMsg] = useState("");

  const conectar = () => {
    if (!num) { alert("Digite seu número com DDD."); return; }
    connectWhatsapp(num);
    alert("WhatsApp conectado.");
  };
  const enviar = () => {
    if (!whatsappPhone) { alert("Conecte seu WhatsApp primeiro."); return; }
    if (!msg.trim()) { alert("Escreva a mensagem."); return; }
    openWA(msg);
  };

  return (
    <div className="card border-0 shadow-sm mt-3">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="m-0">WhatsApp</h6>
          {whatsappPhone ? <span className="badge bg-success">Conectado</span> : <span className="badge bg-secondary">Desconectado</span>}
        </div>

        {!whatsappPhone ? (
          <div className="row g-2 mt-2">
            <div className="col-md-6">
              <input className="form-control" placeholder="11999998888" value={num} onChange={(e)=>setNum(e.target.value)} />
            </div>
            <div className="col-md-6">
              <button className="btn btn-primary" onClick={conectar}>Conectar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-muted small mt-2">Número: {whatsappPhone}</div>
            <div className="row g-2 mt-2">
              <div className="col-12">
                <textarea className="form-control" rows={3} placeholder="Mensagem…" value={msg} onChange={(e)=>setMsg(e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2 justify-content-end">
                <button className="btn btn-outline-secondary" onClick={()=>setMsg("")}>Limpar</button>
                <button className="btn btn-success" onClick={enviar}>Enviar</button>
                <button className="btn btn-outline-danger" onClick={disconnectWhatsapp}>Desconectar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
