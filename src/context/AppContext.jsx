// bloco: contexto
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// bloco: util data BR (embed)
function toBRDate(iso) {
  if (!iso) return "-";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}

// bloco: helpers
const AppContext = createContext(null);
function loadLS(k, fb) { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : fb; } catch { return fb; } }
function saveLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function novoId(p="id") { return `${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`; }
const SENHA_EXCLUIR = import.meta.env.VITE_DELETE_PASS || "1234";

// bloco: listas
export const COMORBIDADES = ["Hipertensão","Diabetes","Asma","Cardiopatia","Doença Renal","Obesidade","Tabagismo","Gestação"];

export function AppProvider({ children }) {
  // bloco: estados principais
  const [clients, setClients] = useState(() => loadLS("clients", []));
  const [appointments, setAppointments] = useState(() => loadLS("appointments", []));
  const [whatsappPhone, setWhatsappPhone] = useState(() => loadLS("whatsappPhone", ""));

  // bloco: email (estado)
  const [emailAccount, setEmailAccount] = useState(() => loadLS("emailAccount", { connected:false, address:"" }));

  useEffect(() => saveLS("clients", clients), [clients]);
  useEffect(() => saveLS("appointments", appointments), [appointments]);
  useEffect(() => saveLS("whatsappPhone", whatsappPhone), [whatsappPhone]);
  useEffect(() => saveLS("emailAccount", emailAccount), [emailAccount]);

  // bloco: clientes
  function addClient(d) {
    const novo = {
      id: novoId("cli"),
      nome: d.nome || "Sem nome",
      email: d.email || "",
      telefone: d.telefone || "",
      endereco: d.endereco || "",
      nascimento: d.nascimento || "",
      peso: d.peso || "",
      altura: d.altura || "",
      genero: d.genero || "",
      comorbidades: Array.isArray(d.comorbidades) ? d.comorbidades : [],
      outrosDiagnosticos: d.outrosDiagnosticos || "",
      remedios: d.remedios || "",
      fotoPerfilUrl: d.fotoPerfilUrl || "",
      consultas: Array.isArray(d.consultas) ? d.consultas : [],
      receitas: Array.isArray(d.receitas) ? d.receitas : [],
      atestados: Array.isArray(d.atestados) ? d.atestados : [],
      areas: d.areas || undefined,
    };
    setClients((cur) => [novo, ...cur]);
    return novo;
  }
  function updateClient(idCliente, patch) {
    setClients((list) => list.map((c) => (c.id === idCliente ? { ...c, ...patch } : c)));
  }
  function getClient(idCliente) { return clients.find((c) => c.id === idCliente); }

  // bloco: agenda
  function addAppointment(appt) {
    const registro = { id: novoId("apt"), createdAt: new Date().toISOString(), ...appt };
    setAppointments((list) => [registro, ...list]);
    return registro;
  }

  // bloco: consultas
  function proxNumeroConsulta(cli) { const n = (cli.consultas?.length || 0) + 1; return n < 10 ? `0${n}` : String(n); }
  function addConsulta(idCliente, { dataISO, hora, texto = "" }) {
    setClients((list) => list.map((c) => {
      if (c.id !== idCliente) return c;
      const numero = proxNumeroConsulta(c);
      const nova = { id: novoId("con"), numero, dataISO, hora, texto, fotos: [] };
      return { ...c, consultas: [nova, ...(c.consultas || [])] };
    }));
  }
  function updateConsulta(idCliente, idConsulta, patch) {
    setClients((list) => list.map((c) => {
      if (c.id !== idCliente) return c;
      return { ...c, consultas: (c.consultas || []).map((con) => con.id === idConsulta ? { ...con, ...patch } : con) };
    }));
  }
  async function deleteConsultas(idCliente, ids) {
    if (!ids?.length) return;
    if (!confirm("Tem certeza que deseja excluir as consultas selecionadas?")) return;
    const senha = prompt("Digite a senha de exclusão:");
    if (senha !== SENHA_EXCLUIR) { alert("Senha incorreta."); return; }
    setClients((list) => list.map((c) => c.id !== idCliente ? c : { ...c, consultas: (c.consultas || []).filter((x) => !ids.includes(x.id)) }));
  }
  async function deleteClient(idCliente) {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;
    if (!confirm("Essa ação é irreversível. Confirmar exclusão?")) return;
    const senha = prompt("Digite a senha de exclusão:");
    if (senha !== SENHA_EXCLUIR) { alert("Senha incorreta."); return; }
    const cli = clients.find((c) => c.id === idCliente);
    setClients((list) => list.filter((c) => c.id !== idCliente));
    if (cli?.email) {
      const subject = encodeURIComponent("Confirmação de exclusão de cadastro");
      const body = encodeURIComponent(`Olá ${cli.nome},\n\nSeu cadastro/consultas foram excluídos conforme solicitação.\n\nAtt,\nEquipe`);
      window.open(`mailto:${cli.email}?subject=${subject}&body=${body}`, "_blank");
    }
  }

  // bloco: relatório PDF (data BR)
  function gerarRelatorioPDF(cliente, consultasSelecionadas) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const L = (t, x=40, y) => { doc.text(String(t), x, y); return y + 18; };
    let y = 50;

    doc.setFontSize(16);
    y = L(`Relatório de Consultas - ${cliente.nome}`, 40, y);
    doc.setFontSize(11);
    y = L(`Nascimento: ${toBRDate(cliente.nascimento)}  |  Peso: ${cliente.peso || "-"}  |  Altura: ${cliente.altura || "-"}`, 40, y);
    y = L(`Comorbidades: ${(cliente.comorbidades || []).join(", ") || "-"}`, 40, y);
    y = L(`Outros diagnósticos: ${cliente.outrosDiagnosticos || "-"}`, 40, y);
    y = L(`Remédios: ${cliente.remedios || "-"}`, 40, y);
    y += 10;

    consultasSelecionadas.forEach((cons, idx) => {
      doc.setFontSize(13);
      y = L(`Consulta ${cons.numero} — ${toBRDate(cons.dataISO)} ${cons.hora || ""}`, 40, y);
      doc.setFontSize(11);

      const wrap = (txt, max=90) => { const arr=[]; let s=String(txt||""); while(s.length){arr.push(s.slice(0,max)); s=s.slice(max);} return arr; };
      wrap(cons.texto, 90).forEach((row) => { y = L(row, 50, y); if (y > 780) { doc.addPage(); y = 50; } });

      if (cons.fotos?.length) y = L(`Fotos anexadas: ${cons.fotos.length} (visualize no sistema)`, 50, y);
      y += 10;
      if (y > 780 && idx < consultasSelecionadas.length - 1) { doc.addPage(); y = 50; }
    });

    doc.save(`relatorio_${cliente.nome.replace(/\s+/g,"_")}.pdf`);
  }

  // bloco: upload fotos
  async function salvarFotoPerfil(idCliente, arquivo) {
    if (!idCliente || !arquivo) return null;
    const caminho = `clients/${idCliente}/perfil_${Date.now()}.jpg`;
    const r = ref(storage, caminho);
    await uploadBytes(r, arquivo);
    const url = await getDownloadURL(r);
    updateClient(idCliente, { fotoPerfilUrl: url });
    return url;
  }
  async function salvarFotosDaConsulta(idCliente, idConsulta, arquivos) {
    if (!idCliente || !idConsulta || !arquivos?.length) return [];
    const limitar = Array.from(arquivos).slice(0, 3);
    const urls = [];
    for (let i=0;i<limitar.length;i++) {
      const arq = limitar[i];
      const caminho = `clients/${idCliente}/consultas/${idConsulta}/foto_${i+1}_${Date.now()}.jpg`;
      const r = ref(storage, caminho);
      await uploadBytes(r, arq);
      const url = await getDownloadURL(r);
      urls.push(url);
    }
    setClients((list) => list.map((c) => c.id !== idCliente ? c : {
      ...c,
      consultas: (c.consultas || []).map((con) => con.id === idConsulta ? { ...con, fotos: urls } : con),
    }));
    return urls;
  }

  // bloco: whatsapp (login simples)
  function connectWhatsapp(number) { setWhatsappPhone(String(number || "").replace(/\D/g,"")); }
  function disconnectWhatsapp() { setWhatsappPhone(""); }
  function openWA(texto, numero = whatsappPhone) {
    if (!numero) { alert("Informe o número do WhatsApp primeiro."); return; }
    const msg = encodeURIComponent(texto || "");
    const who = encodeURIComponent(String(numero).replace(/\D/g,""));
    window.open(`https://wa.me/${who}?text=${msg}`, "_blank");
  }

  // bloco: email (login simples)
  function connectEmail(address) {
    const addr = String(address || "").trim();
    if (!addr || !addr.includes("@")) { alert("Informe um e-mail válido."); return; }
    setEmailAccount({ connected:true, address: addr });
  }
  function disconnectEmail() {
    setEmailAccount({ connected:false, address:"" });
  }
  function sendEmail({ to, subject, body }) {
    const from = emailAccount?.address || "";
    const dest = String(to || from || "").trim();
    if (!dest) { alert("Informe o destinatário."); return; }
    const s = encodeURIComponent(subject || "");
    const b = encodeURIComponent(body || "");
    window.open(`mailto:${dest}?subject=${s}&body=${b}`, "_blank");
  }
  function emailCliente(cli, subject, body) {
    const dest = cli?.email || emailAccount?.address || "";
    if (!dest) { alert("Sem e-mail do cliente ou conta conectada."); return; }
    sendEmail({ to: dest, subject, body });
  }

  const value = useMemo(() => ({
    // pacientes
    clients, setClients, getClient, addClient, updateClient, deleteClient,
    // agenda
    appointments, setAppointments, addAppointment,
    // consultas
    addConsulta, updateConsulta, deleteConsultas,
    // arquivos
    salvarFotoPerfil, salvarFotosDaConsulta,
    // PDF
    gerarRelatorioPDF,
    // whatsapp
    whatsappPhone, connectWhatsapp, disconnectWhatsapp, openWA,
    // email
    emailAccount, connectEmail, disconnectEmail, sendEmail, emailCliente,
    // listas
    COMORBIDADES,
  }), [clients, appointments, whatsappPhone, emailAccount]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
