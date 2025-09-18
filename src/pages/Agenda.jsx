// src/pages/Agenda.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

/* ===== datas locais ===== */
const hojeISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const parseISOlocal = (iso) => {
  if (!iso) return new Date();
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const fmtBR = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${String(y)}`;
};

/* ===== utils ===== */
const toMin = (hhmm) => {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
function isPast(dateISO, hhmm) {
  if (!dateISO || !hhmm) return false;
  const [y, m, d] = dateISO.split("-").map(Number);
  const [H, M] = hhmm.split(":").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, H || 0, M || 0, 0);
  return dt.getTime() < Date.now();
}
const loadJSON = (k, fb) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : fb; } catch { return fb; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ===== relógio ===== */
function useClock() {
  const [txt, setTxt] = useState(() =>
    new Date().toLocaleTimeString("pt-BR", { hour12: false })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTxt(new Date().toLocaleTimeString("pt-BR", { hour12: false }));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return txt;
}

/* ===== clima + saudação ===== */
function weatherIcon(code, isDay) {
  // mapa simples (Open-Meteo weather_code)
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code >= 1 && code <= 3) return isDay ? "🌤️" : "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ((code >= 51 && code <= 57) || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 95) return "⛈️";
  return "💨";
}
function saudacaoTexto() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}
function useLocalInfo() {
  const [st, setSt] = useState({ city:"", region:"", temp:null, code:null, isDay:1 });
  useEffect(() => {
    let vivo = true;
    async function run() {
      try {
        if (!("geolocation" in navigator)) return;
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 4000 }
          );
        }).then(async (pos) => {
          if (!pos) return;
          const { latitude:lat, longitude:lon } = pos.coords;

          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
          const j = await r.json();
          const a = j.address || {};
          const city = a.city || a.town || a.village || a.municipality || "";
          const region = a.state_code || a.state || (a.country_code || "").toUpperCase();

          const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`);
          const jw = await w.json();
          const temp = jw?.current?.temperature_2m ?? null;
          const code = jw?.current?.weather_code ?? null;
          const isDay = jw?.current?.is_day ?? 1;

          if (vivo) setSt({ city, region, temp, code, isDay });
        });
      } catch {
        // silencioso
      }
    }
    run();
    return () => { vivo = false; };
  }, []);
  return st;
}

/* ===== próximos 4h ===== */
function PainelProximos({ agendamentos, dataISO }) {
  const agora = Date.now();
  const fimJanela = agora + 4 * 60 * 60 * 1000;
  const items = (agendamentos || [])
    .filter((x) => x.data === dataISO)
    .map((x) => {
      const [y, m, d] = x.data.split("-").map(Number);
      const [H, M] = (x.hora || "00:00").split(":").map(Number);
      return { ...x, ts: new Date(y, m - 1, d, H || 0, M || 0).getTime() };
    })
    .filter((x) => x.ts >= agora && x.ts <= fimJanela)
    .sort((a, b) => a.ts - b.ts);

  if (items.length === 0) return <small className="text-muted">Sem próximos agendamentos.</small>;
  return (
    <ul className="list-group">
      {items.map((x) => (
        <li key={x.id} className="list-group-item d-flex justify-content-between">
          <span>{x.hora} — {x.clienteNome || x.tipo || "agendamento"}</span>
          <span className="badge bg-light text-dark">{(x.status || "").toLowerCase()}</span>
        </li>
      ))}
    </ul>
  );
}

/* ===== aniversários ===== */
function AniversariosDoDia({ clientes, dataISO }) {
  const [, mm, dd] = dataISO.split("-").map(Number);
  const lista = (clientes || []).filter((p) => {
    if (!p?.nascimento) return false;
    const [, m, d2] = String(p.nascimento).split("-").map(Number);
    return (m === mm && d2 === dd);
  });
  if (lista.length === 0) return <small className="text-muted">Sem aniversariantes.</small>;
  return (
    <ul className="list-group">
      {lista.map((p) => (
        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
          <span>{p.nome}</span>
          <a
            className="btn btn-sm btn-success"
            href={`https://wa.me/${(p.telefone||"").replace(/\D/g,"")}?text=${encodeURIComponent(`Parabéns, ${p.nome}! 🎉`)}`}
            target="_blank" rel="noreferrer"
          >
            WhatsApp
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ===== componente principal ===== */
export default function Agenda() {
  const navegar = useNavigate();
  const { clients, appointments } = useApp();

  const hora = useClock();
  const { city, region, temp, code, isDay } = useLocalInfo();
  const greet = saudacaoTexto();
  const icon = weatherIcon(code, isDay);

  const [dataISO, setDataISO] = useState(hojeISO());
  const dataBRcurta = useMemo(() => fmtBR(dataISO), [dataISO]);
  const diaSemana = useMemo(() => {
    const d = parseISOlocal(dataISO);
    const t = d.toLocaleDateString("pt-BR", { weekday: "long" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }, [dataISO]);

  /* slots */
  const baseSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"];
  const [extraPorData, setExtraPorData] = useState(() => loadJSON("extraSlots", {}));
  const [removidosPorData, setRemovidosPorData] = useState(() => loadJSON("removedSlots", {}));
  useEffect(() => saveJSON("extraSlots", extraPorData), [extraPorData]);
  useEffect(() => saveJSON("removedSlots", removidosPorData), [removidosPorData]);

  const mapaHoje = useMemo(() => {
    const map = {};
    (appointments || []).forEach((x) => {
      if (x.data === dataISO && x.hora) map[x.hora] = x;
    });
    return map;
  }, [appointments, dataISO]);

  const listaSlots = useMemo(() => {
    const removidos = new Set(removidosPorData[dataISO] || []);
    const baseVisiveis = baseSlots.filter((h) => !removidos.has(h));
    const set = new Set(baseVisiveis);
    (extraPorData[dataISO] || []).forEach((t) => { if (!removidos.has(t)) set.add(t); });
    Object.keys(mapaHoje).forEach((t) => set.add(t));
    return Array.from(set).sort((a,b)=>toMin(a)-toMin(b));
  }, [baseSlots, extraPorData, removidosPorData, mapaHoje, dataISO]);

  function addSlotManual(hhmm) {
    if (!hhmm) return;
    setExtraPorData((prev) => {
      const obj = { ...prev };
      const cur = new Set(obj[dataISO] || []);
      cur.add(hhmm);
      obj[dataISO] = Array.from(cur).sort((a,b)=>toMin(a)-toMin(b));
      return obj;
    });
    setRemovidosPorData((prev) => {
      const list = new Set(prev[dataISO] || []);
      if (list.has(hhmm)) {
        const arr = Array.from(list).filter((t) => t !== hhmm);
        return { ...prev, [dataISO]: arr };
      }
      return prev;
    });
  }

  /* navegação slot */
  function irParaAgendamento(data, horaSlot, ag) {
    if (ag) {
      const tipo = (ag.tipo || "").toLowerCase();
      if (tipo === "pessoal" || tipo === "compromisso") {
        navegar(`/compromissos?data=${data}&hora=${horaSlot}`);
      } else {
        const extra = ag.clienteId ? `&clienteId=${ag.clienteId}` : "";
        navegar(`/agendar?data=${data}&hora=${horaSlot}${extra}`);
      }
      return;
    }
    navegar(`/agendar?data=${data}&hora=${horaSlot}`);
  }
  const [chooserHora, setChooserHora] = useState(null);
  function abrirSlot(hhmm) {
    const ag = mapaHoje[hhmm];
    const passado = isPast(dataISO, hhmm);
    if (ag) { irParaAgendamento(dataISO, hhmm, ag); return; }
    if (passado) return;
    setChooserHora(hhmm);
  }
  function removerSlot(hhmm) {
    if (mapaHoje[hhmm]) { alert("Existe agendamento neste horário."); return; }
    if ((extraPorData[dataISO] || []).includes(hhmm)) {
      setExtraPorData((prev) => {
        const obj = { ...prev };
        obj[dataISO] = (obj[dataISO] || []).filter((t) => t !== hhmm);
        return obj;
      });
      return;
    }
    setRemovidosPorData((prev) => {
      const cur = new Set(prev[dataISO] || []);
      cur.add(hhmm);
      return { ...prev, [dataISO]: Array.from(cur) };
    });
  }

  /* lembrete + whatsapp (um card só) */
  const [lemHora, setLemHora] = useState("14:00");
  const [lemMsg, setLemMsg] = useState("");
  const [lemZap, setLemZap] = useState("");
  const [lembretes, setLembretes] = useState(() => loadJSON("agendaLembretes", []));
  useEffect(() => saveJSON("agendaLembretes", lembretes), [lembretes]);

  function statusLembrete(item) {
    if (item.cancelado) return "cancelado";
    if (item.concluido) return "concluido";
    if (item.date !== dataISO) return "confirmado";
    const agora = new Date();
    const agoraMin = agora.getHours()*60 + agora.getMinutes();
    const alvoMin = toMin(item.time);
    const dif = alvoMin - agoraMin;
    if (dif <= 0 && dif >= -1) return "na hora";
    if (dif > 0 && dif <= 15) return "proximo";
    return "confirmado";
  }
  const estiloLembrete = (st) => {
    switch (st) {
      case "confirmado": return { borderLeft: "6px solid #28a745" };
      case "proximo":    return { borderLeft: "6px solid #ffc107", background: "#fff8e1" };
      case "na hora":    return { borderLeft: "6px solid #dc3545", background: "#fdecea", animation: "blink 1s step-start infinite" };
      case "cancelado":  return { borderLeft: "6px solid #6c757d", color: "#6c757d", textDecoration: "line-through", background: "#f1f3f5" };
      case "concluido":  return { borderLeft: "6px solid #0dcaf0", color: "#055160", textDecoration: "line-through", background: "#e7fafe" };
      default: return {};
    }
  };
  function criarLembrete() {
    if (!lemHora || !lemMsg) return;
    const novo = {
      id: `rem_${Date.now()}`,
      date: dataISO,
      time: lemHora,
      msg: lemMsg.trim(),
      zap: (wa.connected ? wa.number : (lemZap || "").trim()),
      cancelado: false,
      concluido: false
    };
    setLembretes((prev) => [novo, ...prev].slice(0, 50));
    setLemMsg("");
    if (!wa.connected) setLemZap("");
  }
  function marcarConcluido(id) {
    setLembretes((prev) => prev.map((x) => x.id === id ? { ...x, concluido: !x.concluido, cancelado: false } : x));
  }
  function marcarCancelado(id) {
    setLembretes((prev) => prev.map((x) => x.id === id ? { ...x, cancelado: !x.cancelado, concluido: false } : x));
  }
  function removerLembrete(id) {
    setLembretes((prev) => prev.filter((x) => x.id !== id));
  }
  const zapLink = (num) => {
    const only = (num || "").replace(/\D/g, "");
    return only ? `https://wa.me/${only}` : "#";
  };

  /* sessão whatsapp */
  const [wa, setWa] = useState(() => loadJSON("waSession", { connected:false, number:"" }));
  useEffect(() => saveJSON("waSession", wa), [wa]);
  function conectarWA(n) {
    const only = (n || "").replace(/\D/g, "");
    if (only.length < 10) { alert("Informe um número válido com DDD."); return; }
    setWa({ connected:true, number: only });
  }
  function sairWA() {
    setWa({ connected:false, number:"" });
  }

  /* estilos */
  const topBox = { background:"var(--proflex-primary,#4390a1)", color:"#fff", borderRadius:14, boxShadow:"0 4px 14px rgba(0,0,0,.10)" };
  const SLOT_SIZE = wa.connected ? 74 : 80;
  const slotBox = {
    width: SLOT_SIZE, height: SLOT_SIZE, borderRadius: "50%",
    background:"#fff", border:"2px solid #e5e7eb",
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    gap:2, boxShadow:"0 1px 4px rgba(0,0,0,.08)", cursor:"pointer", userSelect:"none", position:"relative"
  };
  const slotOff = { opacity:.5, cursor:"not-allowed" };
  const chipBase = { position:"absolute", bottom:-10, fontSize:10, padding:"2px 6px", borderRadius:8, color:"#fff" };

  /* status visual do slot */
  function statusDoSlot(hhmm) {
    const ag = mapaHoje[hhmm];
    let st = (ag?.status || "").toLowerCase();
    if (!st) {
      // derivado simples
      const hoje = dataISO === hojeISO();
      if (hoje) {
        const now = new Date();
        const agoraMin = now.getHours()*60 + now.getMinutes();
        const alvoMin = toMin(hhmm);
        const dif = alvoMin - agoraMin;
        if (dif <= 0 && dif >= -1) st = "na hora";
        else if (dif > 0 && dif <= 15) st = "proximo";
        else if (dif > 15) st = "confirmado";
      }
    }
    return st;
  }

  return (
    <div className="container py-3">
      <style>{`@keyframes blink{50%{opacity:.35}}`}</style>

      {/* topo */}
      <div className="p-3 mb-3" style={topBox}>
        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-semibold">{greet} {icon}</div>
          <div className="fw-semibold">{diaSemana}</div>
        </div>

        <div className="text-center fs-3 fw-bold mt-1">{hora}</div>

        <div className="d-flex justify-content-center align-items-center gap-2 mt-2 flex-wrap">
          {temp !== null && <span className="badge bg-light text-dark">{Math.round(temp)}°C</span>}
          <span className="badge bg-light text-dark">
            {city ? `${city}${region ? " - " + region : ""}` : "Localização"}
          </span>
        </div>

        <div className="mt-3 d-flex justify-content-center">
          <input
            type="date"
            className="form-control d-inline-block"
            style={{ width: 220, textAlign: "center", fontWeight: 600 }}
            value={dataISO}
            onChange={(e) => setDataISO(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-3">
        {/* coluna esquerda */}
        <div className="col-md-7">
          {/* slots (agora NO TOPO da coluna esquerda) */}
          <div className="card">
            <div className="card-body">
              <h6>Horários</h6>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {listaSlots.map((hhmm) => {
                  const ag = mapaHoje[hhmm];
                  const tem = !!ag;
                  const passado = isPast(dataISO, hhmm);
                  const desliga = !tem && passado;
                  const status = statusDoSlot(hhmm);

                  const aro = (() => {
                    switch (status) {
                      case "confirmado": return { borderColor:"#28a745", boxShadow:"0 0 0 3px rgba(40,167,69,.15)" };
                      case "proximo":   return { borderColor:"#ffc107", boxShadow:"0 0 0 3px rgba(255,193,7,.2)" };
                      case "na hora":   return { borderColor:"#dc3545", boxShadow:"0 0 0 3px rgba(220,53,69,.2)" };
                      case "cancelado": return { borderColor:"#6c757d", boxShadow:"0 0 0 3px rgba(108,117,125,.15)" };
                      case "concluido": return { borderColor:"#0dcaf0", boxShadow:"0 0 0 3px rgba(13,202,240,.2)" };
                      default: return {};
                    }
                  })();
                  const chipStyle = (() => {
                    switch (status) {
                      case "confirmado": return { ...chipBase, background:"#28a745" };
                      case "proximo":    return { ...chipBase, background:"#ffc107", color:"#222" };
                      case "na hora":    return { ...chipBase, background:"#dc3545" };
                      case "cancelado":  return { ...chipBase, background:"#6c757d" };
                      case "concluido":  return { ...chipBase, background:"#0dcaf0", color:"#063" };
                      default: return null;
                    }
                  })();

                  return (
                    <div
                      key={hhmm}
                      style={{ ...slotBox, ...(desliga?slotOff:{}), ...aro }}
                      title={desliga ? "passado" : (tem ? "abrir" : "novo")}
                      onClick={() => abrirSlot(hhmm)}
                    >
                      <div className="fw-semibold">{hhmm}</div>
                      {!desliga && tem && chipStyle && <span style={chipStyle}>{status}</span>}
                      {desliga && <small className="text-muted">passado</small>}
                    </div>
                  );
                })}
              </div>

              <div className="d-flex align-items-center gap-2 mt-3">
                <input type="time" id="novoSlot" defaultValue="09:00" className="form-control" style={{ width: 120 }} />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const v = document.getElementById("novoSlot").value;
                    addSlotManual(v);
                  }}
                >
                  + Adicionar horário
                </button>
              </div>
            </div>
          </div>

          {/* próximos 4h (AGORA ABAIXO dos slots) */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="m-0 mb-2">⏱️ Próximas 4 horas</h6>
              <PainelProximos agendamentos={appointments} dataISO={dataISO} />
            </div>
          </div>
        </div>

        {/* coluna direita */}
        <div className="col-md-5">
          {/* aniversários */}
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <h6 className="m-0">🎂 Aniversários de hoje</h6>
                <small className="text-muted">{dataBRcurta}</small>
              </div>
              <div className="mt-2">
                <AniversariosDoDia clientes={clients} dataISO={dataISO} />
              </div>
            </div>
          </div>

          {/* lembrete + whatsapp (um card) */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="m-0">🔔 Lembrete + 💬 WhatsApp</h6>
                {wa.connected ? (
                  <span className="badge bg-success">conectado</span>
                ) : (
                  <span className="badge bg-secondary">desconectado</span>
                )}
              </div>

              {/* lembrete */}
              <div className="row g-2 align-items-center">
                <div className="col-3">
                  <input type="time" className="form-control" value={lemHora} onChange={(e)=>setLemHora(e.target.value)} />
                </div>
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: 22:00 ligar para Maria"
                    value={lemMsg}
                    onChange={(e)=>setLemMsg(e.target.value)}
                  />
                </div>
              </div>

              {/* whatsapp + criar */}
              <div className="row g-2 align-items-center mt-2">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="WhatsApp (com DDD)"
                    value={wa.connected ? wa.number : lemZap}
                    onChange={(e)=> wa.connected ? null : setLemZap(e.target.value)}
                    disabled={wa.connected}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary" onClick={criarLembrete}>Criar</button>
                </div>
              </div>

              {/* sessão wa */}
              <div className="d-flex align-items-center justify-content-between mt-2">
                {!wa.connected ? (
                  <>
                    <small className="text-muted">Conecte para preencher o número automaticamente.</small>
                    <button className="btn btn-success" onClick={()=>conectarWA(lemZap)}>Conectar</button>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="fw-semibold">Número: {wa.number}</div>
                      <small className="text-muted">Usado nos lembretes e atalhos WA</small>
                    </div>
                    <div className="d-flex gap-2">
                      <a className="btn btn-success" href={zapLink(wa.number)} target="_blank" rel="noreferrer">Abrir WA</a>
                      <button className="btn btn-outline-danger" onClick={sairWA}>Sair</button>
                    </div>
                  </>
                )}
              </div>

              {/* lista de lembretes do dia */}
              <div className="mt-3">
                {lembretes.filter(l=>l.date===dataISO).length===0 ? (
                  <small className="text-muted">Sem lembretes.</small>
                ) : (
                  <ul className="list-group">
                    {lembretes
                      .filter(l=>l.date===dataISO)
                      .sort((a,b)=>toMin(a.time)-toMin(b.time))
                      .map((l)=>{
                        const st = statusLembrete(l);
                        const stStyle = estiloLembrete(st);
                        const zap = l.zap || (wa.connected ? wa.number : "");
                        return (
                          <li key={l.id}
                              className="list-group-item d-flex justify-content-between align-items-start"
                              style={stStyle}>
                            <div className="me-2">
                              <div className="fw-semibold">{l.time} — {l.msg}</div>
                              {zap && (
                                <a href={zapLink(zap)} target="_blank" rel="noreferrer" className="small text-decoration-none">
                                  WhatsApp: {zap}
                                </a>
                              )}
                            </div>
                            <div className="d-flex gap-1">
                              {zap && (
                                <a className="btn btn-sm btn-success" href={zapLink(zap)} target="_blank" rel="noreferrer" title="Abrir WhatsApp">
                                  WA
                                </a>
                              )}
                              <button className="btn btn-sm btn-outline-primary" onClick={()=>marcarConcluido(l.id)}>Resolver</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={()=>marcarCancelado(l.id)}>Cancelar</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={()=>removerLembrete(l.id)}>Remover</button>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* legenda */}
      <div className="mt-3 d-flex flex-wrap gap-2">
        <span className="badge" style={{ background:"#28a745" }}>confirmado</span>
        <span className="badge text-dark" style={{ background:"#ffc107" }}>proximo</span>
        <span className="badge" style={{ background:"#dc3545" }}>na hora</span>
        <span className="badge" style={{ background:"#6c757d" }}>cancelado</span>
        <span className="badge text-dark" style={{ background:"#0dcaf0" }}>concluido</span>
      </div>

      {/* modal tipo novo agendamento */}
      {chooserHora && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background:"rgba(0,0,0,.35)", zIndex:50 }}
          onClick={()=>setChooserHora(null)}
        >
          <div
            className="position-absolute top-50 start-50 translate-middle bg-white border rounded shadow p-3"
            style={{ width: 360 }}
            onClick={(e)=>e.stopPropagation()}
          >
            <h6 className="mb-2">Agendar {dataISO} — {chooserHora}</h6>
            <p className="mb-3 text-muted small">Escolha o tipo:</p>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-primary"
                onClick={()=>{ setChooserHora(null); navegar(`/agendar?data=${dataISO}&hora=${chooserHora}`); }}
              >
                🧑‍⚕️ Consulta
              </button>
              <button
                className="btn btn-secondary"
                onClick={()=>{ setChooserHora(null); navegar(`/compromissos?data=${dataISO}&hora=${chooserHora}&novo=1`); }}
              >
                🗓️ Compromisso
              </button>
            </div>
            <div className="text-end mt-3">
              <button className="btn btn-link" onClick={()=>setChooserHora(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

     

<footer className="text-center mt-5 font-extrabold tracking-widest" style={{ fontSize: "20px", letterSpacing: "0.2em" }}>
  ProFlex
</footer>
    </div>
    
  );
}
