// contexto do app (mantém sua lógica em localStorage, só adiciona upload de fotos no Firebase Storage)
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AppContext = createContext(null);

// helpers simples
function loadDoNavegador(chave, padrao) {
  try {
    const s = localStorage.getItem(chave);
    return s ? JSON.parse(s) : padrao;
  } catch {
    return padrao;
  }
}
function salvarNoNavegador(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
}
function novoId(prefixo = "id") {
  return `${prefixo}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

const SENHA_EXCLUIR = import.meta.env.VITE_DELETE_PASS || "1234";

// lista base (igual você já tinha)
export const COMORBIDADES = [
  "Hipertensão",
  "Diabetes",
  "Asma",
  "Cardiopatia",
  "Doença Renal",
  "Obesidade",
  "Tabagismo",
  "Gestação",
];

export function AppProvider({ children }) {
  // pacientes (com foto de perfil opcional)
  const [clients, setClients] = useState(() => loadDoNavegador("clients", []));
  // agendamentos da Agenda
  const [appointments, setAppointments] = useState(() => loadDoNavegador("appointments", []));

  useEffect(() => salvarNoNavegador("clients", clients), [clients]);
  useEffect(() => salvarNoNavegador("appointments", appointments), [appointments]);

  // ------------------------ CLIENTES
  function addClient(dados) {
    const novo = {
      id: novoId("cli"),
      nome: dados.nome || "Sem nome",
      email: dados.email || "",
      telefone: dados.telefone || "",
      endereco: dados.endereco || "",
      nascimento: dados.nascimento || "", // yyyy-mm-dd
      peso: dados.peso || "",
      altura: dados.altura || "",
      genero: dados.genero || "",
      comorbidades: Array.isArray(dados.comorbidades) ? dados.comorbidades : [],
      outrosDiagnosticos: dados.outrosDiagnosticos || "",
      remedios: dados.remedios || "",
      fotoPerfilUrl: dados.fotoPerfilUrl || "", // NOVO
      consultas: Array.isArray(dados.consultas) ? dados.consultas : [], // [{id, numero, dataISO, hora, texto, fotos:[]}]
    };
    setClients((atual) => [novo, ...atual]);
    return novo;
  }

  function updateClient(idCliente, alteracoes) {
    setClients((lista) =>
      lista.map((c) => (c.id === idCliente ? { ...c, ...alteracoes } : c))
    );
  }

  function getClient(idCliente) {
    return clients.find((c) => c.id === idCliente);
  }

  // ------------------------ AGENDAMENTOS (Agenda)
  function addAppointment(appt) {
    const registro = { id: novoId("apt"), createdAt: new Date().toISOString(), ...appt };
    setAppointments((lista) => [registro, ...lista]);
    return registro;
  }

  // ------------------------ CONSULTAS (prontuário)
  function proximoNumeroConsulta(cliente) {
    const n = (cliente.consultas?.length || 0) + 1;
    return n < 10 ? `0${n}` : String(n);
  }

  function addConsulta(idCliente, { dataISO, hora, texto = "" }) {
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;
        const numero = proximoNumeroConsulta(c);
        const nova = { id: novoId("con"), numero, dataISO, hora, texto, fotos: [] }; // NOVO: fotos
        return { ...c, consultas: [nova, ...(c.consultas || [])] };
      })
    );
  }

  function updateConsulta(idCliente, idConsulta, alteracoes) {
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;
        return {
          ...c,
          consultas: (c.consultas || []).map((con) =>
            con.id === idConsulta ? { ...con, ...alteracoes } : con
          ),
        };
      })
    );
  }

  async function deleteConsultas(idCliente, idsConsultas) {
    if (!idsConsultas?.length) return;
    if (!window.confirm("Tem certeza que deseja excluir as consultas selecionadas?")) return;
    const senha = prompt("Digite a senha de exclusão:");
    if (senha !== SENHA_EXCLUIR) {
      alert("Senha incorreta.");
      return;
    }
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;
        return {
          ...c,
          consultas: (c.consultas || []).filter((con) => !idsConsultas.includes(con.id)),
        };
      })
    );
  }

  async function deleteClient(idCliente) {
    if (!window.confirm("Tem certeza que deseja excluir este paciente?")) return;
    if (!window.confirm("Essa ação é irreversível. Confirmar exclusão?")) return;
    const senha = prompt("Digite a senha de exclusão:");
    if (senha !== SENHA_EXCLUIR) {
      alert("Senha incorreta.");
      return;
    }

    const cliente = clients.find((c) => c.id === idCliente);
    setClients((lista) => lista.filter((c) => c.id !== idCliente));

    if (cliente?.email) {
      const subject = encodeURIComponent("Confirmação de exclusão de cadastro");
      const body = encodeURIComponent(
        `Olá ${cliente.nome},\n\nSeu cadastro/consultas foram excluídos conforme solicitação.\n\nAtt,\nEquipe`
      );
      window.open(`mailto:${cliente.email}?subject=${subject}&body=${body}`, "_blank");
    }
  }

  // ------------------------ RELATÓRIO (PDF simples)
  function gerarRelatorioPDF(cliente, consultasSelecionadas) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const linha = (t, x = 40, y) => {
      doc.text(String(t), x, y);
      return y + 18;
    };
    let y = 50;

    doc.setFontSize(16);
    y = linha(`Relatório de Consultas - ${cliente.nome}`, 40, y);
    doc.setFontSize(11);
    y = linha(
      `Nascimento: ${cliente.nascimento || "-"}  |  Peso: ${cliente.peso || "-"}  |  Altura: ${
        cliente.altura || "-"
      }`,
      40,
      y
    );
    y = linha(`Comorbidades: ${(cliente.comorbidades || []).join(", ") || "-"}`, 40, y);
    y = linha(`Outros diagnósticos: ${cliente.outrosDiagnosticos || "-"}`, 40, y);
    y = linha(`Remédios: ${cliente.remedios || "-"}`, 40, y);
    y += 10;

    consultasSelecionadas.forEach((cons, idx) => {
      doc.setFontSize(13);
      y = linha(`Consulta ${cons.numero} — ${cons.dataISO} ${cons.hora || ""}`, 40, y);
      doc.setFontSize(11);

      // quebra de texto simples
      const wrap = (txt, max = 90) => {
        const arr = [];
        let s = String(txt || "");
        while (s.length) {
          arr.push(s.slice(0, max));
          s = s.slice(max);
        }
        return arr;
      };
      wrap(cons.texto, 90).forEach((row) => {
        y = linha(row, 50, y);
        if (y > 780) {
          doc.addPage();
          y = 50;
        }
      });

      // só menciona quantas fotos tem (implementação enxuta de aluno)
      if (cons.fotos?.length) {
        y = linha(`Fotos anexadas: ${cons.fotos.length} (visualize no sistema)`, 50, y);
      }

      y += 10;
      if (y > 780 && idx < consultasSelecionadas.length - 1) {
        doc.addPage();
        y = 50;
      }
    });

    doc.save(`relatorio_${cliente.nome.replace(/\s+/g, "_")}.pdf`);
  }

  // ------------------------ UPLOAD DE FOTOS (Firebase Storage)

  // foto de perfil (1 por cliente)
  async function salvarFotoPerfil(idCliente, arquivo) {
    if (!idCliente || !arquivo) return null;
    const caminho = `clients/${idCliente}/perfil_${Date.now()}.jpg`;
    const referencia = ref(storage, caminho);
    await uploadBytes(referencia, arquivo);
    const url = await getDownloadURL(referencia);
    updateClient(idCliente, { fotoPerfilUrl: url });
    return url;
  }

  // até 3 fotos por consulta (sobrescreve a lista inteira com as novas URLs)
  async function salvarFotosDaConsulta(idCliente, idConsulta, arquivos) {
    if (!idCliente || !idConsulta || !arquivos?.length) return [];
    const limitar = Array.from(arquivos).slice(0, 3);
    const urls = [];
    for (let i = 0; i < limitar.length; i++) {
      const arquivo = limitar[i];
      const caminho = `clients/${idCliente}/consultas/${idConsulta}/foto_${i + 1}_${Date.now()}.jpg`;
      const referencia = ref(storage, caminho);
      await uploadBytes(referencia, arquivo);
      const url = await getDownloadURL(referencia);
      urls.push(url);
    }
    // grava as URLs no registro da consulta
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;
        return {
          ...c,
          consultas: (c.consultas || []).map((con) =>
            con.id === idConsulta ? { ...con, fotos: urls } : con
          ),
        };
      })
    );
    return urls;
  }

  const valor = useMemo(
    () => ({
      // pacientes
      clients,
      setClients,
      getClient,
      addClient,
      updateClient,
      deleteClient,
      // agenda
      appointments,
      setAppointments,
      addAppointment,
      // consultas
      addConsulta,
      updateConsulta,
      deleteConsultas,
      // arquivos
      salvarFotoPerfil,
      salvarFotosDaConsulta,
      // util
      gerarRelatorioPDF,
      COMORBIDADES,
    }),
    [clients, appointments]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}
