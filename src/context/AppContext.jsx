
 // Contexto principal do ProFlex
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { jsPDF } from "jspdf";
import { salvarFotoTeste } from "../services/cloudinary.js";

const AppContext = createContext(null);

// ------------------------ HELPERS

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

export const COMORBIDADES = [
  "Hipertensão",
  "Diabetes",
  "Asma",
  "Cardiopatia",
  "Doença Renal",
  "Obesidade",
  "Tabagismo",
  "Gestação",
  "Câncer",
];

// ------------------------ PROFISSIONAIS

const DIAS_PADRAO = [1, 2, 3, 4, 5];

function normalizarDias(dias) {
  if (!Array.isArray(dias)) return [...DIAS_PADRAO];

  return [...new Set(dias.map(Number))]
    .filter((dia) => Number.isInteger(dia) && dia >= 0 && dia <= 6)
    .sort((a, b) => a - b);
}

function normalizarDuracao(valor, padrao = 60) {
  const numero = Number(valor);

  return Number.isInteger(numero) && numero >= 5 && numero <= 480
    ? numero
    : padrao;
}

function horarioValido(valor) {
  return typeof valor === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

function minutos(horario) {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

function normalizarHorario(valor, padrao) {
  return horarioValido(valor) ? valor : padrao;
}

function configurarProfissional(dados = {}, anterior = null) {
  const base = anterior || {};

  const inicio = normalizarHorario(
    dados.inicioExpediente ?? base.inicioExpediente,
    "08:00",
  );

  const fim = normalizarHorario(
    dados.fimExpediente ?? base.fimExpediente,
    "18:00",
  );

  const inicioIntervalo = normalizarHorario(
    dados.inicioIntervalo ?? base.inicioIntervalo,
    "12:00",
  );

  const fimIntervalo = normalizarHorario(
    dados.fimIntervalo ?? base.fimIntervalo,
    "13:00",
  );

  if (minutos(fim) <= minutos(inicio)) {
    throw new Error("O fim do expediente deve ser após o início.");
  }

  const temIntervalo = dados.temIntervalo ??
    base.temIntervalo ??
    true;

  if (temIntervalo) {
    if (
      minutos(inicioIntervalo) < minutos(inicio) ||
      minutos(fimIntervalo) > minutos(fim) ||
      minutos(fimIntervalo) <= minutos(inicioIntervalo)
    ) {
      throw new Error("O intervalo deve estar dentro do expediente.");
    }
  }

  const nome = String(dados.nome ?? base.nome ?? "").trim();

  if (!nome) {
    throw new Error("Informe o nome do profissional.");
  }

  return {
    ...base,
    id: base.id || novoId("pro"),
    nome,
    especialidade: String(
      dados.especialidade ?? base.especialidade ?? "",
    ).trim(),
    registroProfissional: String(
      dados.registroProfissional ?? base.registroProfissional ?? "",
    ).trim(),
    email: String(dados.email ?? base.email ?? "").trim(),
    telefone: String(dados.telefone ?? base.telefone ?? "").trim(),
    ativo: dados.ativo ?? base.ativo ?? true,
    duracaoConsulta: normalizarDuracao(
      dados.duracaoConsulta ?? base.duracaoConsulta,
    ),
    diasTrabalho: normalizarDias(
      dados.diasTrabalho ?? base.diasTrabalho,
    ),
    inicioExpediente: inicio,
    fimExpediente: fim,
    temIntervalo: Boolean(temIntervalo),
    inicioIntervalo,
    fimIntervalo,
    createdAt: base.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }) {
  // ------------------------ ESTADOS EXISTENTES

  const [clients, setClients] = useState(() =>
    loadDoNavegador("clients", []),
  );

  const [appointments, setAppointments] = useState(() =>
    loadDoNavegador("appointments", []),
  );

  // ------------------------ NOVO ESTADO: PROFISSIONAIS

  const [professionals, setProfessionals] = useState(() => {
    const dados = loadDoNavegador("proflexProfessionals", []);
    return Array.isArray(dados) ? dados : [];
  });

  useEffect(() => {
    salvarNoNavegador("clients", clients);
  }, [clients]);

  useEffect(() => {
    salvarNoNavegador("appointments", appointments);
  }, [appointments]);

  useEffect(() => {
    salvarNoNavegador("proflexProfessionals", professionals);
  }, [professionals]);

  // ------------------------ FUNÇÕES DE PROFISSIONAIS

  function addProfessional(dados) {
    const novo = configurarProfissional(dados);

    setProfessionals((lista) => [...lista, novo]);

    return novo;
  }

  function updateProfessional(idProfissional, alteracoes) {
    const existente = professionals.find(
      (p) => p.id === idProfissional,
    );

    if (!existente) {
      throw new Error("Profissional não encontrado.");
    }

    const atualizado = configurarProfissional(
      alteracoes,
      existente,
    );

    setProfessionals((lista) =>
      lista.map((p) =>
        p.id === idProfissional ? atualizado : p,
      ),
    );

    return atualizado;
  }

  function getProfessional(idProfissional) {
    return professionals.find(
      (p) => p.id === idProfissional,
    ) || null;
  }

  function deactivateProfessional(idProfissional) {
    return updateProfessional(idProfissional, {
      ativo: false,
    });
  }

  function activateProfessional(idProfissional) {
    return updateProfessional(idProfissional, {
      ativo: true,
    });
  }

  const activeProfessionals = professionals.filter(
    (p) => p.ativo !== false,
  );

  // ------------------------ CLIENTES

  function normalizarTexto(valor) {
    return String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buscarPacienteDuplicado(dados) {
    const nome = normalizarTexto(dados.nome);
    const telefone = String(dados.telefone || "")
      .replace(/\D/g, "");
    const email = normalizarTexto(dados.email);
    const documento = String(dados.documento || "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    return clients.find((cliente) => {
      const mesmoNome =
        nome && normalizarTexto(cliente.nome) === nome;

      const mesmoTelefone =
        telefone &&
        String(cliente.telefone || "").replace(/\D/g, "") === telefone;

      const mesmoEmail =
        email && normalizarTexto(cliente.email) === email;

      const mesmoDocumento =
        documento &&
        String(cliente.documento || "")
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase() === documento;

      return (
        mesmoNome ||
        mesmoTelefone ||
        mesmoEmail ||
        mesmoDocumento
      );
    });
  }

  function addClient(dados) {
    const duplicado = buscarPacienteDuplicado(dados);

    if (duplicado) {
      alert(
        `Atenção! O paciente ${duplicado.nome} já está cadastrado.\n\n` +
        "Abra o cadastro existente para atualizar as informações.",
      );
      return null;
    }

    const novo = {
      id: novoId("cli"),

      // Dados pessoais
      nome: dados.nome || "",
      email: dados.email || "",
      semEmail: dados.semEmail || false,
      telefone: dados.telefone || "",
      temWhatsapp: dados.temWhatsapp || false,

      tipoDocumento: dados.tipoDocumento || "",
      documento: dados.documento || "",
      semDocumento: dados.semDocumento || false,

      endereco: dados.endereco || "",
      pais: dados.pais || "",
      cep: dados.cep || "",
      rua: dados.rua || "",
      numero: dados.numero || "",
      complemento: dados.complemento || "",
      bairro: dados.bairro || "",
      cidade: dados.cidade || "",
      estado: dados.estado || "",

      // Dados clínicos
      comorbidades: Array.isArray(dados.comorbidades)
        ? dados.comorbidades
        : [],

      doencasExtras: Array.isArray(dados.doencasExtras)
        ? dados.doencasExtras
        : [],

      doencasNeurologicas: Array.isArray(dados.doencasNeurologicas)
        ? dados.doencasNeurologicas
        : [],

      sindromeDescricao: dados.sindromeDescricao || "",
      outrosDiagnosticos: dados.outrosDiagnosticos || "",
      remedios: dados.remedios || "",
      anotacoesPaciente: dados.anotacoesPaciente || "",
      areas: dados.areas || {},

      // Arquivos e históricos
      fotoPerfilUrl: dados.fotoPerfilUrl || "",
      consultas: Array.isArray(dados.consultas)
        ? dados.consultas
        : [],
      receitas: Array.isArray(dados.receitas)
        ? dados.receitas
        : [],
      atestados: Array.isArray(dados.atestados)
        ? dados.atestados
        : [],
    };

    setClients((atual) => [novo, ...atual]);

    return novo;
  }

  function updateClient(idCliente, alteracoes) {
    setClients((lista) =>
      lista.map((c) =>
        c.id === idCliente
          ? { ...c, ...alteracoes }
          : c,
      ),
    );
  }

  function getClient(idCliente) {
    return clients.find((c) => c.id === idCliente);
  }

  // ------------------------ AGENDAMENTOS

  function addAppointment(appt) {
    const registro = {
      id: novoId("apt"),
      createdAt: new Date().toISOString(),
      status: "confirmado",
      ...appt,
    };

    setAppointments((lista) => [registro, ...lista]);

    return registro;
  }

  // ------------------------ CONSULTAS (PRONTUÁRIO)

  function proximoNumeroConsulta(cliente) {
    const n = (cliente.consultas?.length || 0) + 1;
    return n < 10 ? `0${n}` : String(n);
  }

  function addConsulta(
    idCliente,
    {
      dataISO,
      hora,
      texto = "",
      queixa = "",
      avaliacao = "",
      procedimentos = "",
      evolucao = "",
      conduta = "",
    },
  ) {
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;

        const numero = proximoNumeroConsulta(c);

        const nova = {
          id: novoId("con"),
          numero,
          dataISO,
          hora,

          // Compatibilidade com consultas antigas
          texto,

          // Prontuário estruturado
          queixa,
          avaliacao,
          procedimentos,
          evolucao,
          conduta,

          fotos: [],
        };

        return {
          ...c,
          consultas: [nova, ...(c.consultas || [])],
        };
      }),
    );
  }

  function updateConsulta(idCliente, idConsulta, alteracoes) {
    setClients((lista) =>
      lista.map((c) => {
        if (c.id !== idCliente) return c;

        return {
          ...c,
          consultas: (c.consultas || []).map((con) =>
            con.id === idConsulta
              ? { ...con, ...alteracoes }
              : con,
          ),
        };
      }),
    );
  }

  async function deleteConsultas(idCliente, idsConsultas) {
    if (!idsConsultas?.length) return;

    if (
      !window.confirm(
        "Tem certeza que deseja excluir as consultas selecionadas?",
      )
    ) {
      return;
    }

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
          consultas: (c.consultas || []).filter(
            (con) => !idsConsultas.includes(con.id),
          ),
        };
      }),
    );
  }

  async function deleteClient(idCliente) {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este paciente?",
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        "Essa ação é irreversível. Confirmar exclusão?",
      )
    ) {
      return;
    }

    const senha = prompt("Digite a senha de exclusão:");

    if (senha !== SENHA_EXCLUIR) {
      alert("Senha incorreta.");
      return;
    }

    const cliente = clients.find((c) => c.id === idCliente);

    setClients((lista) =>
      lista.filter((c) => c.id !== idCliente),
    );

    if (cliente?.email) {
      const subject = encodeURIComponent(
        "Confirmação de exclusão de cadastro",
      );

      const body = encodeURIComponent(
        `Olá ${cliente.nome},\n\nSeu cadastro/consultas foram excluídos conforme solicitação.\n\nAtt,\nEquipe`,
      );

      window.open(
        `mailto:${cliente.email}?subject=${subject}&body=${body}`,
        "_blank",
      );
    }
  }

  // ------------------------ RELATÓRIO PDF

  function gerarRelatorioPDF(cliente, consultasSelecionadas) {
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const linha = (t, x = 40, y) => {
      doc.text(String(t), x, y);
      return y + 18;
    };

    let y = 50;

    doc.setFontSize(16);
    y = linha(
      `Relatório de Consultas - ${cliente.nome}`,
      40,
      y,
    );

    doc.setFontSize(11);

    y = linha(
      `Nascimento: ${cliente.nascimento || "-"}  |  Peso: ${cliente.peso || "-"}  |  Altura: ${cliente.altura || "-"}`,
      40,
      y,
    );

    y = linha(
      `Comorbidades: ${(cliente.comorbidades || []).join(", ") || "-"}`,
      40,
      y,
    );

    y = linha(
      `Outros diagnósticos: ${cliente.outrosDiagnosticos || "-"}`,
      40,
      y,
    );

    y = linha(
      `Remédios: ${cliente.remedios || "-"}`,
      40,
      y,
    );

    y += 10;

    consultasSelecionadas.forEach((cons, idx) => {
      doc.setFontSize(13);

      y = linha(
        `Consulta ${cons.numero} — ${cons.dataISO} ${cons.hora || ""}`,
        40,
        y,
      );

      doc.setFontSize(11);

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

      if (cons.fotos?.length) {
        y = linha(
          `Fotos anexadas: ${cons.fotos.length} (visualize no sistema)`,
          50,
          y,
        );
      }

      y += 10;

      if (
        y > 780 &&
        idx < consultasSelecionadas.length - 1
      ) {
        doc.addPage();
        y = 50;
      }
    });

    doc.save(
      `relatorio_${cliente.nome.replace(/\s+/g, "_")}.pdf`,
    );
  }

  // ------------------------ UPLOAD DE FOTOS (CLOUDINARY)

  async function salvarFotoPerfil(idCliente, arquivo) {
    if (!idCliente || !arquivo) return null;

    const url = await salvarFotoTeste(arquivo);

    updateClient(idCliente, {
      fotoPerfilUrl: url,
    });

    return url;
  }

  async function salvarFotosDaConsulta(
    idCliente,
    idConsulta,
    arquivos,
  ) {
    if (!idCliente || !idConsulta || !arquivos?.length) {
      return [];
    }

    const limitar = Array.from(arquivos).slice(0, 3);
    const urls = [];

    for (const arquivo of limitar) {
      const url = await salvarFotoTeste(arquivo);
      urls.push(url);
    }

    setClients((lista) =>
      lista.map((cliente) => {
        if (cliente.id !== idCliente) return cliente;

        return {
          ...cliente,
          consultas: (cliente.consultas || []).map(
            (consulta) =>
              consulta.id === idConsulta
                ? { ...consulta, fotos: urls }
                : consulta,
          ),
        };
      }),
    );

    return urls;
  }

  // ------------------------ CONTEXTO

  const valor = useMemo(
    () => ({
      // Pacientes
      clients,
      setClients,
      getClient,
      addClient,
      updateClient,
      deleteClient,

      // Agenda
      appointments,
      setAppointments,
      addAppointment,

      // Profissionais (NOVO)
      professionals,
      activeProfessionals,
      addProfessional,
      updateProfessional,
      getProfessional,
      deactivateProfessional,
      activateProfessional,

      // Consultas
      addConsulta,
      updateConsulta,
      deleteConsultas,

      // Arquivos
      salvarFotoPerfil,
      salvarFotosDaConsulta,

      // Utilitários
      gerarRelatorioPDF,
      COMORBIDADES,
    }),
    [clients, appointments, professionals],
  );

  return (
    <AppContext.Provider value={valor}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      "useApp deve ser usado dentro de AppProvider",
    );
  }

  return ctx;
}
