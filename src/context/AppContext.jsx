import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf"; // para relatórios (usado em helpers abaixo, se quiser centralizar)

const AppContext = createContext(null);

// persistência simples
const load = (k, fb) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid  = (p="id") => `${p}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36)}`;

const DELETE_PASS = import.meta.env.VITE_DELETE_PASS || "1234"; // troque no .env

// comorbidades de exemplo (pode editar)
export const COMORBIDADES = [
  "Hipertensão", "Diabetes", "Asma", "Cardiopatia",
  "Doença Renal", "Obesidade", "Tabagismo", "Gestação"
];

export function AppProvider({ children }) {
  // clientes guardam: dados pessoais + comorbidades + consultas[]
  const [clients, setClients] = useState(() => load("clients", []));
  // appointments continuam para integração com a Agenda (agendamentos)
  const [appointments, setAppointments] = useState(() => load("appointments", []));

  useEffect(() => save("clients", clients), [clients]);
  useEffect(() => save("appointments", appointments), [appointments]);

  const addClient = (c) => {
    const novo = {
      id: uid("cli"),
      nome: c.nome || "Sem nome",
      email: c.email || "",
      telefone: c.telefone || "",
      endereco: c.endereco || "",
      nascimento: c.nascimento || "", // yyyy-mm-dd
      peso: c.peso || "",
      altura: c.altura || "",
      genero: c.genero || "",
      comorbidades: Array.isArray(c.comorbidades) ? c.comorbidades : [],
      outrosDiagnosticos: c.outrosDiagnosticos || "",
      remedios: c.remedios || "",
      consultas: Array.isArray(c.consultas) ? c.consultas : [], // [{id, numero, dataISO, hora, texto}]
    };
    setClients((prev) => [novo, ...prev]);
    return novo;
  };

  const updateClient = (id, patch) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const getClient = (id) => clients.find((c) => c.id === id);

  const addAppointment = (appt) => {
    const x = { id: uid("apt"), createdAt: new Date().toISOString(), ...appt };
    setAppointments((prev) => [x, ...prev]);
    return x;
  };

  // CONSULTAS (prontuário)
  const nextConsultaNumero = (client) => {
    const n = (client.consultas?.length || 0) + 1;
    return n < 10 ? `0${n}` : String(n);
  };

  const addConsulta = (clientId, { dataISO, hora, texto = "" }) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const numero = nextConsultaNumero(c);
        const nova = { id: uid("con"), numero, dataISO, hora, texto };
        return { ...c, consultas: [nova, ...(c.consultas || [])] };
      })
    );
  };

  const updateConsulta = (clientId, consultaId, patch) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          consultas: (c.consultas || []).map((con) =>
            con.id === consultaId ? { ...con, ...patch } : con
          ),
        };
      })
    );
  };

  const deleteConsultas = async (clientId, ids) => {
    if (!ids?.length) return;
    // dupla confirmação + senha
    if (!window.confirm("Tem certeza que deseja excluir as consultas selecionadas?")) return;
    const pass = prompt("Digite a senha de exclusão:");
    if (pass !== DELETE_PASS) { alert("Senha incorreta."); return; }
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, consultas: (c.consultas || []).filter((con) => !ids.includes(con.id)) };
      })
    );
  };

  const deleteClient = async (clientId) => {
    if (!window.confirm("Tem certeza que deseja excluir este paciente?")) return;
    if (!window.confirm("Essa ação é irreversível. Confirmar exclusão?")) return;
    const pass = prompt("Digite a senha de exclusão:");
    if (pass !== DELETE_PASS) { alert("Senha incorreta."); return; }

    const cli = clients.find((c) => c.id === clientId);
    setClients((prev) => prev.filter((c) => c.id !== clientId));

    // notificação por email (abre o cliente de email do usuário)
    if (cli?.email) {
      const subject = encodeURIComponent("Confirmação de exclusão de cadastro");
      const body =
        encodeURIComponent(`Olá ${cli.nome},\n\nSeu cadastro/consultas foram excluídos conforme solicitação.\n\nAtt,\nEquipe`);
      window.open(`mailto:${cli.email}?subject=${subject}&body=${body}`, "_blank");
    }
  };

  // Relatório: PDF simples das consultas selecionadas
  const gerarRelatorioPDF = (cliente, consultasSelecionadas) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const line = (t, x=40, y) => { doc.text(String(t), x, y); return y + 18; };
    let y = 50;

    doc.setFontSize(16);
    y = line(`Relatório de Consultas - ${cliente.nome}`, 40, y);
    doc.setFontSize(11);
    y = line(`Nascimento: ${cliente.nascimento || "-"}  |  Peso: ${cliente.peso || "-"}  |  Altura: ${cliente.altura || "-"}`, 40, y);
    y = line(`Comorbidades: ${(cliente.comorbidades||[]).join(", ") || "-"}`, 40, y);
    y = line(`Outros diagnósticos: ${cliente.outrosDiagnosticos || "-"}`, 40, y);
    y = line(`Remédios: ${cliente.remedios || "-"}`, 40, y);
    y += 10;

    consultasSelecionadas.forEach((c, i) => {
      doc.setFontSize(13);
      y = line(`Consulta ${c.numero} — ${c.dataISO} ${c.hora || ""}`, 40, y);
      doc.setFontSize(11);

      // quebra simples por linhas de 90 chars
      const wrap = (txt, max=90) => {
        const arr = [];
        let s = String(txt || "");
        while (s.length) { arr.push(s.slice(0, max)); s = s.slice(max); }
        return arr;
      };
      wrap(c.texto, 90).forEach((row) => { y = line(row, 50, y); if (y > 780){ doc.addPage(); y = 50; } });
      y += 10;
      if (y > 780 && i < consultasSelecionadas.length - 1) { doc.addPage(); y = 50; }
    });

    doc.save(`relatorio_${cliente.nome.replace(/\s+/g,"_")}.pdf`);
  };

  const value = useMemo(() => ({
    clients, setClients, getClient,
    appointments, setAppointments,
    addClient, updateClient,
    addAppointment,
    addConsulta, updateConsulta, deleteConsultas,
    deleteClient,
    gerarRelatorioPDF,
    COMORBIDADES
  }), [clients, appointments]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(){ const ctx = useContext(AppContext); if(!ctx) throw new Error("useApp must be used within AppProvider"); return ctx; }
