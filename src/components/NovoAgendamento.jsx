import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useApp } from "../context/AppContext.jsx";

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function calcIdade(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "";

  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  const nasc = new Date(y, (m || 1) - 1, d || 1);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nasc.getFullYear();

  const antes =
    hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate());

  if (antes) idade--;

  return idade >= 0 ? idade : "";
}

// =====================================================
// LISTAS CLÍNICAS
// =====================================================

const DOENCAS_MUSCULOESQUELETICAS = [
  "Artrite",
  "Artrose",
  "Tendinite",
  "Bursite",
  "Hérnia de disco",
  "Lombalgia",
  "Cervicalgia",
  "Escoliose",
  "Osteoporose",
  "Fibromialgia",
];

const OUTRAS_CONDICOES = [
  "Enxaqueca",
  "Sinusite",
  "Refluxo",
  "Hipotireoidismo",
  "Hipertireoidismo",
  "Ansiedade",
  "Depressão",
  "Insônia",
  "Dermatite",
  "Varizes",
];

const DOENCAS_NEUROLOGICAS = [
  "AVC",
  "Parkinson",
  "Esclerose",
  "Traumatismo medular",
  "Traumatismo encefálico",
  "Epilepsia",
  "Síndrome",
];

const AREAS = {
  "Membros inferiores": [
    "Pés",
    "Dedos dos pés",
    "Tornozelos",
    "Panturrilhas",
    "Joelhos",
    "Coxas",
    "Quadris",
  ],
  "Membros superiores": [
    "Mãos",
    "Dedos das mãos",
    "Punhos",
    "Antebraços",
    "Cotovelos",
    "Braços",
    "Ombros",
  ],
  Tronco: [
    "Coluna cervical",
    "Coluna torácica",
    "Coluna lombar",
    "Tórax",
    "Abdome",
    "Sacro/Quadril",
  ],
  "Cabeça / Face": [
    "Crânio",
    "Face",
    "Mandíbula",
    "Olhos",
    "Ouvidos",
    "Nariz",
    "Boca",
  ],
  Neurológico: [
    "Sensibilidade",
    "Força",
    "Equilíbrio",
    "Coordenação",
    "Reflexos",
    "Marcha",
  ],
};

// =====================================================
// ARMAZENAMENTO LOCAL
// =====================================================

const loadLS = (k, fb) => {
  try {
    const s = localStorage.getItem(k);
    return s ? JSON.parse(s) : fb;
  } catch {
    return fb;
  }
};

const saveLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

// =====================================================
// ESTILOS DA AVALIAÇÃO PREMIUM
// =====================================================

const premiumStyles = `
.pf-premium {
  --bg: #eef6f8;
  --surface: #ffffff;
  --ink: #102a43;
  --muted: #64788b;
  --line: #d8e6eb;
  --soft: #f4f9fa;
  --teal: #0b8d86;
  --accent: #12b7aa;
  --gold: #c9a15a;

  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  padding: 26px 18px 60px;
}

.pf-premium.pf-dark {
  --bg: #071b2d;
  --surface: #102b3c;
  --ink: #f0f8fc;
  --muted: #a9c2d0;
  --line: #315363;
  --soft: #0a2333;
  --teal: #087a79;
  --accent: #43d6c8;
  --gold: #e7bb70;
}

.pf-premium * {
  box-sizing: border-box;
}

.pf-premium .pf-shell {
  max-width: 1440px;
  margin: 0 auto;
  min-width: 0;
}

.pf-premium .pf-topbar,
.pf-premium .pf-brand,
.pf-premium .pf-top-actions,
.pf-premium .pf-patientbar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pf-premium .pf-topbar {
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pf-premium .pf-brand-icon {
  font-size: 32px;
  color: var(--gold);
  border: 2px solid var(--gold);
  border-radius: 10px;
  padding: 3px 10px;
}

.pf-premium h1 {
  font-size: 27px;
  font-weight: 800;
  margin: 0;
  color: var(--ink);
}

.pf-premium .pf-brand p,
.pf-premium .pf-stage-head p {
  color: var(--muted);
  margin: 3px 0 0;
}

.pf-premium .pf-draft {
  background: rgba(18, 183, 170, 0.12);
  color: var(--accent);
  border-radius: 30px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 700;
}

.pf-premium .pf-theme {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 25px;
  padding: 10px 16px;
  font-weight: 700;
}

.pf-premium .pf-patientbar {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 17px 22px;
  margin-bottom: 18px;
  box-shadow: 0 8px 24px rgba(6, 34, 47, 0.06);
  flex-wrap: wrap;
}

.pf-premium .pf-patient-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0a716e, #20b9b1);
  color: white;
  display: grid;
  place-items: center;
  font-size: 25px;
  font-weight: 800;
  flex: none;
}

.pf-premium .pf-patient-identity {
  display: flex;
  flex-direction: column;
  min-width: 140px;
  flex: 1;
}

.pf-premium .pf-patient-identity strong {
  font-size: 18px;
}

.pf-premium .pf-patient-identity span,
.pf-premium .pf-patient-date small {
  color: var(--muted);
  font-size: 13px;
}

.pf-premium .pf-patient-date {
  display: flex;
  flex-direction: column;
  padding-left: 17px;
  border-left: 1px solid var(--line);
}

.pf-premium .pf-type-select {
  border: 1px solid var(--line);
  background: var(--soft);
  color: var(--ink);
  border-radius: 24px;
  padding: 10px 12px;
  max-width: 190px;
}

.pf-premium .pf-steps {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 18px;
}

.pf-premium .pf-step-button {
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  padding: 13px 8px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
}

.pf-premium .pf-step-button span {
  flex: none;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--soft);
  border: 1px solid var(--line);
  color: var(--ink);
  font-weight: 800;
}

.pf-premium .pf-step-button b {
  font-size: 13px;
  font-weight: 700;
}

.pf-premium .pf-step-button.active {
  background: linear-gradient(110deg, #0b6e72, #079e95);
  color: white;
  border-color: #0b8e87;
}

.pf-premium .pf-step-button.active span {
  color: #0a716e;
  background: white;
}

.pf-premium .pf-step-button.done {
  color: var(--teal);
  background: rgba(18, 183, 170, 0.1);
}

.pf-premium .pf-workspace {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 16px 22px 24px;
  box-shadow: 0 15px 38px rgba(7, 40, 55, 0.06);
  min-width: 0;
}

.pf-premium .pf-stage-head {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: linear-gradient(105deg, #0a686e, #13b0a5);
  color: white;
}

.pf-premium .pf-stage-head h2 {
  margin: 0;
  color: white;
  font-size: 22px;
  font-weight: 800;
}

.pf-premium .pf-stage-head p {
  color: #d6f6f3;
}

.pf-premium .pf-stage-icon {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  min-width: 55px;
  height: 55px;
  display: grid;
  place-items: center;
  font-size: 29px;
}

.pf-premium .pf-form {
  margin: 0;
}

.pf-premium .form-control,
.pf-premium .form-select {
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 10px;
  min-height: 43px;
  max-width: 100%;
}


/* PLACEHOLDERS NO MODO CLARO */
.pf-premium .form-control::placeholder,
.pf-premium textarea::placeholder,
.pf-premium input::placeholder {
  color: #718096;
  opacity: 1;
}

/* PLACEHOLDERS NO MODO ESCURO */
.pf-premium.pf-dark .form-control::placeholder,
.pf-premium.pf-dark textarea::placeholder,
.pf-premium.pf-dark input::placeholder {
  color: #c4d5df !important;
  opacity: 1;
}

/* CAMPOS DESABILITADOS NO MODO ESCURO */
.pf-premium.pf-dark .form-control:disabled,
.pf-premium.pf-dark .form-select:disabled {
  background-color: #1b3949;
  color: #c4d5df;
  opacity: 1;
}

/* OPÇÕES DOS SELECTS NO MODO ESCURO */
.pf-premium.pf-dark .form-select option {
  background-color: #102b3c;
  color: #f0f8fc;
}


.pf-premium textarea.form-control {
  min-height: 95px;
}

.pf-premium .form-label,
.pf-premium .form-check-label {
  color: var(--ink);
}

.pf-premium .form-label {
  font-weight: 700;
  font-size: 14px;
}

.pf-premium .text-muted {
  color: var(--muted) !important;
}

.pf-premium .proflex-section-header {
  background: var(--soft);
  border-left: 4px solid var(--gold);
  color: var(--ink);
  border-radius: 10px;
}

.pf-premium .proflex-section-header h5 {
  font-weight: 800;
}

.pf-premium .proflex-clinical-option {
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center;
  gap: 9px !important;
  padding: 9px 12px !important;
  border: 1px solid var(--line) !important;
  background: var(--soft);
  color: var(--ink);
  border-radius: 9px !important;
  max-width: 100%;
}

.pf-premium .proflex-clinical-option .form-check-input {
  position: static !important;
  float: none !important;
  margin: 0 !important;
  flex: none;
}

.pf-premium .proflex-clinical-option:has(input:checked) {
  background: rgba(18, 183, 170, 0.14);
  border-color: var(--accent) !important;
}

.pf-premium .pf-wizard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
  padding: 18px 0 0;
  border-top: 1px solid var(--line);
}

.pf-premium .pf-save-note {
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

.pf-premium .pf-next {
  background: linear-gradient(105deg, #12b7aa, #087b78);
  color: white;
  font-weight: 800;
  padding: 11px 23px;
  border-radius: 12px;
}

.pf-premium .pf-next:hover {
  color: white;
  filter: brightness(1.06);
}

.pf-premium .pf-review h3 {
  color: var(--ink);
  font-size: 20px;
  font-weight: 800;
}

.pf-premium .pf-review p {
  color: var(--muted);
}

.pf-premium .pf-review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.pf-premium .pf-review-grid > div {
  background: var(--soft);
  border: 1px solid var(--line);
  padding: 15px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pf-premium .pf-review-grid small {
  color: var(--muted);
}

.pf-premium .pf-review-grid strong {
  overflow-wrap: anywhere;
}

.pf-premium .list-group-item,
.pf-premium .card {
  background: var(--surface);
  color: var(--ink);
  border-color: var(--line);
}

.pf-premium .proflex-history-toolbar {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.pf-premium .proflex-history-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

@media (max-width: 760px) {
  .pf-premium {
    padding: 12px 8px 40px;
  }

  .pf-premium .pf-workspace {
    padding: 12px;
  }

  .pf-premium .pf-topbar {
    align-items: flex-start;
  }

  .pf-premium h1 {
    font-size: 22px;
  }

  .pf-premium .pf-draft {
    display: none;
  }

  .pf-premium .pf-patientbar {
    padding: 12px;
    gap: 10px;
  }

  .pf-premium .pf-patient-date {
    padding-left: 0;
    border: 0;
  }

  .pf-premium .pf-steps {
    gap: 4px;
  }

  .pf-premium .pf-step-button {
    padding: 9px 3px;
  }

  .pf-premium .pf-step-button b {
    display: none;
  }

  .pf-premium .pf-stage-head {
    padding: 12px;
    gap: 10px;
  }

  .pf-premium .pf-stage-head h2 {
    font-size: 17px;
  }

  .pf-premium .pf-stage-icon {
    min-width: 42px;
    height: 42px;
    font-size: 23px;
  }

  .pf-premium .pf-review-grid {
    grid-template-columns: 1fr;
  }

  .pf-premium .pf-save-note {
    display: none;
  }

  .pf-premium .pf-wizard-footer .btn {
    flex: 1;
  }

  .pf-premium .proflex-history-actions {
    width: 100%;
  }

  .pf-premium .proflex-history-actions .btn {
    flex: 1 1 140px;
  }
}
`;

// =====================================================
// CABEÇALHO DAS SEÇÕES
// =====================================================

function SectionHeader({ number, title, subtitle }) {
  return (
    <div className="col-12 mt-4 mb-2 p-3 proflex-section-header">
      <h5 className="mb-1">
        {number}. {title}
      </h5>

      {subtitle && <small style={{ opacity: 0.9 }}>{subtitle}</small>}
    </div>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================


const TextoLongo = ({ titulo, valor, alterar, placeholder = "" }) => (
    <div className="col-12">
      <label className="form-label">{titulo}</label>

      <textarea
        className="form-control"
        rows={4}
        value={valor}
        onChange={(e) => alterar(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );


export default function NovoAgendamento() {
  const [etapa, setEtapa] = useState(1);

  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("proflex-tema") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  // Escuta as alterações realizadas pelo botão
  // Dark/Light do PageHeader.jsx.
  useEffect(() => {
    const atualizarTema = (evento) => {
      const novoTema = evento.detail?.tema;

      if (novoTema === "dark" || novoTema === "light") {
        setTema(novoTema);
      }
    };

    window.addEventListener("proflex-theme-change", atualizarTema);

    return () => {
      window.removeEventListener(
        "proflex-theme-change",

        atualizarTema,
      );
    };
  }, []);

  const etapas = [
    "Dados pessoais",
    "Informações clínicas",
    "Avaliação",
    "Atendimento",
    "Revisão",
  ];

  const irEtapa = (n) => {
    setEtapa(Math.max(1, Math.min(5, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [params] = useSearchParams();
  const navigate = useNavigate();

  const {
    clients,
    getClient,
    addClient,
    updateClient,
    addAppointment,
    appointments,
    setAppointments,
    professionals,
    addConsulta,
    updateConsulta,
    deleteConsultas,
    deleteClient,
    gerarRelatorioPDF,
    COMORBIDADES,
  } = useApp();

  // Parâmetros recebidos pela URL
  const clienteIdParam = params.get("clienteId") || "";

  const dataInicial =
    params.get("data") || new Date().toISOString().split("T")[0];

  const horaInicial = params.get("hora") || "09:00";
  const tipoQuery = params.get("tipo");

  const editandoPeloProntuario = params.get("origem") === "prontuario";

  const clienteExistente = clienteIdParam ? getClient(clienteIdParam) : null;

  // Estados iniciais do formulário
  const [tipo, setTipo] = useState(
    tipoQuery || (clienteExistente ? "completo" : "rapido"),
  );

  const [data, setData] = useState(dataInicial);
  const [hora, setHora] = useState(horaInicial);

  const [professionalId, setProfessionalId] = useState(
    params.get("professionalId") || "",
  );

  // CONTINUA NA PARTE 2/3

  // =====================================================
  // PROFISSIONAL E HORÁRIO
  // =====================================================

  const [duracao, setDuracao] = useState(60);

  const profissionaisAtivos = (professionals || []).filter(
    (profissional) => profissional.ativo !== false,
  );

  const profissionalSelecionado = (professionals || []).find(
    (profissional) => String(profissional.id) === String(professionalId),
  );

  useEffect(() => {
    if (!professionalId && profissionaisAtivos.length === 1) {
      setProfessionalId(String(profissionaisAtivos[0].id));
    }
  }, [professionalId, professionals]);

  useEffect(() => {
    if (profissionalSelecionado) {
      setDuracao(Number(profissionalSelecionado.duracaoConsulta) || 60);
    }
  }, [profissionalSelecionado?.id, profissionalSelecionado?.duracaoConsulta]);

  const validarHorario = () => {
    if (editandoPeloProntuario) return true;

    if (!data || !hora) {
      alert("Informe uma data e um horário válidos.");
      return false;
    }

    const [h, m] = hora.split(":").map(Number);
    const inicioMin = h * 60 + m;
    const duracaoMin = Number(duracao);
    const fimMin = inicioMin + duracaoMin;

    if (!Number.isFinite(inicioMin)) {
      alert("Informe um horário válido.");
      return false;
    }

    if (!Number.isFinite(duracaoMin) || duracaoMin < 5 || duracaoMin > 480) {
      alert("Informe uma duração entre 5 e 480 minutos.");
      return false;
    }

    if (fimMin > 1440) {
      alert("A consulta não pode ultrapassar a meia-noite.");
      return false;
    }

    if (profissionaisAtivos.length > 0 && !profissionalSelecionado) {
      alert("Selecione um profissional.");
      return false;
    }

    const conflito = (appointments || []).some((agendamento) => {
      if (agendamento.data !== data) return false;

      if (
        String(agendamento.professionalId || "") !==
        String(professionalId || "")
      ) {
        return false;
      }

      if (["cancelado", "cancelada"].includes(agendamento.status)) {
        return false;
      }

      const [outraHora, outroMinuto] = String(agendamento.hora || "")
        .split(":")
        .map(Number);

      if (!Number.isFinite(outraHora) || !Number.isFinite(outroMinuto)) {
        return false;
      }

      const outroInicio = outraHora * 60 + outroMinuto;

      const outroFim = outroInicio + (Number(agendamento.duracaoMin) || 60);

      return inicioMin < outroFim && fimMin > outroInicio;
    });

    if (conflito) {
      alert("Este profissional já possui uma consulta nesse horário.");
      return false;
    }

    return true;
  };

  // =====================================================
  // DADOS PESSOAIS
  // =====================================================

  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [temWhatsapp, setTemWhatsapp] = useState(false);
  const [email, setEmail] = useState("");
  const [semEmail, setSemEmail] = useState(false);
  const [endereco, setEndereco] = useState("");

  const pacientesEncontrados = useMemo(() => {
    const termo = buscaPaciente.trim().toLowerCase();

    if (termo.length < 2) return [];

    return (clients || [])
      .filter((cliente) => {
        const dados = [
          cliente.nome,
          cliente.telefone,
          cliente.email,
          cliente.cpf,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return dados.includes(termo);
      })
      .slice(0, 5);
  }, [buscaPaciente, clients]);

  // =====================================================
  // INFORMAÇÕES CLÍNICAS
  // =====================================================

  const [nascimento, setNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [genero, setGenero] = useState("");

  const [comorb, setComorb] = useState([]);
  const [doencasExtras, setDoencasExtras] = useState([]);
  const [doencasNeurologicas, setDoencasNeurologicas] = useState([]);

  const [sindromeDescricao, setSindromeDescricao] = useState("");

  const [outrosDiagnosticos, setOutrosDiagnosticos] = useState("");

  const [remedios, setRemedios] = useState("");

  const [anotacoesPaciente, setAnotacoesPaciente] = useState("");

  const [areas, setAreas] = useState(() =>
    Object.fromEntries(
      Object.keys(AREAS).map((grupo) => [grupo, { parts: [], note: "" }]),
    ),
  );

  // =====================================================
  // AVALIAÇÃO E ATENDIMENTO
  // =====================================================

  const [observacoes, setObservacoes] = useState("");

  const [queixaAtual, setQueixaAtual] = useState("");

  const [avaliacaoAtual, setAvaliacaoAtual] = useState("");

  const [procedimentosAtual, setProcedimentosAtual] = useState("");

  const [evolucaoAtual, setEvolucaoAtual] = useState("");

  const [condutaAtual, setCondutaAtual] = useState("");

  const [carimbo, setCarimbo] = useState("");

  // =====================================================
  // DADOS DO PROFISSIONAL
  // =====================================================

  const [prof, setProf] = useState(() =>
    loadLS("profissional", {
      nome: "",
      registro: "",
      email: "",
      telefone: "",
      endereco: "",
    }),
  );

  // =====================================================
  // PREENCHIMENTO DE PACIENTE EXISTENTE
  // =====================================================

  useEffect(() => {
    if (clienteExistente) {
      setNome(clienteExistente.nome || "");
      setTelefone(clienteExistente.telefone || "");
      setTemWhatsapp(clienteExistente.temWhatsapp || false);

      setEmail(clienteExistente.email || "");
      setSemEmail(!clienteExistente.email);
      setEndereco(clienteExistente.endereco || "");

      setNascimento(clienteExistente.nascimento || "");

      setPeso(clienteExistente.peso || "");
      setAltura(clienteExistente.altura || "");
      setGenero(clienteExistente.genero || "");

      setComorb(
        Array.isArray(clienteExistente.comorbidades)
          ? clienteExistente.comorbidades
          : [],
      );

      setDoencasExtras(
        Array.isArray(clienteExistente.doencasExtras)
          ? clienteExistente.doencasExtras
          : [],
      );

      setDoencasNeurologicas(
        Array.isArray(clienteExistente.doencasNeurologicas)
          ? clienteExistente.doencasNeurologicas
          : [],
      );

      setSindromeDescricao(clienteExistente.sindromeDescricao || "");

      setOutrosDiagnosticos(clienteExistente.outrosDiagnosticos || "");

      setRemedios(clienteExistente.remedios || "");

      setAnotacoesPaciente(clienteExistente.anotacoesPaciente || "");

      const avaliacaoSalva = clienteExistente.avaliacaoInicial || {};

setQueixaAtual(avaliacaoSalva.queixa || "");
setAvaliacaoAtual(avaliacaoSalva.avaliacao || "");
setProcedimentosAtual(avaliacaoSalva.procedimentos || "");
setEvolucaoAtual(avaliacaoSalva.evolucao || "");
setCondutaAtual(avaliacaoSalva.conduta || "");

      if (clienteExistente.areas) {
        setAreas((prev) => {
          const base = { ...prev };

          for (const grupo of Object.keys(AREAS)) {
            base[grupo] = clienteExistente.areas[grupo] || {
              parts: [],
              note: "",
            };
          }

          return base;
        });
      }

      setTipo(tipoQuery || "completo");
    }

    setCarimbo(new Date().toLocaleString("pt-BR"));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteIdParam]);

  // =====================================================
  // HISTÓRICO DE CONSULTAS
  // =====================================================

  const consultas = useMemo(
    () => clienteExistente?.consultas || [],
    [clienteExistente?.consultas],
  );

  const [sel, setSel] = useState([]);

  const [excluindoConsultas, setExcluindoConsultas] = useState(false);

  const toggleComorb = (valor) => {
    setComorb((prev) =>
      prev.includes(valor)
        ? prev.filter((item) => item !== valor)
        : [...prev, valor],
    );
  };

  const toggleDoenca = (valor) => {
    setDoencasExtras((prev) =>
      prev.includes(valor)
        ? prev.filter((item) => item !== valor)
        : [...prev, valor],
    );
  };

  const toggleNeurologica = (valor) => {
    setDoencasNeurologicas((prev) =>
      prev.includes(valor)
        ? prev.filter((item) => item !== valor)
        : [...prev, valor],
    );
  };

  const toggleAreaPart = (grupo, parte) => {
    setAreas((prev) => {
      const atual = prev[grupo] || {
        parts: [],
        note: "",
      };

      const parts = atual.parts.includes(parte)
        ? atual.parts.filter((item) => item !== parte)
        : [...atual.parts, parte];

      return {
        ...prev,
        [grupo]: {
          ...atual,
          parts,
        },
      };
    });
  };

  const setAreaNote = (grupo, note) => {
    setAreas((prev) => ({
      ...prev,
      [grupo]: {
        ...prev[grupo],
        note,
      },
    }));
  };

  const selecionarTudo = (marcar) => {
    setSel(marcar ? consultas.map((consulta) => consulta.id) : []);
  };

const novaConsulta = () => {
  if (!clienteExistente) {
    alert("Salve o paciente antes de registrar uma consulta.");
    return;
  }

  if (!clienteExistente.avaliacaoInicialConcluida) {
    alert(
      "Conclua a avaliação inicial antes de registrar uma nova consulta."
    );
    return;
  }

  navigate(`/consulta?clienteId=${clienteExistente.id}`);
};

  const setTextoConsulta = (cid, texto) => {
    if (!clienteExistente) return;

    updateConsulta(clienteExistente.id, cid, { texto });
  };

  const gerarPDFSelecionadas = () => {
    if (!clienteExistente) return;

    const selecionadas = consultas
      .filter((consulta) => sel.includes(consulta.id))
      .sort((a, b) => String(a.numero).localeCompare(String(b.numero)));

    if (!selecionadas.length) {
      alert("Selecione ao menos uma consulta.");
      return;
    }

    gerarRelatorioPDF(clienteExistente, selecionadas);
  };

 const excluirSelecionadas = async () => {
  if (!clienteExistente || excluindoConsultas || sel.length === 0) return;

  setExcluindoConsultas(true);

  try {
    const excluiu = await deleteConsultas(clienteExistente.id, sel);

    if (excluiu === false) return;

    setSel([]);
  } catch (erro) {
    console.error("Erro ao excluir consultas:", erro);
    alert("Não foi possível excluir as consultas. Tente novamente.");
  } finally {
    setExcluindoConsultas(false);
  }
};

  const idade = calcIdade(nascimento);

  // =====================================================
  // SALVAR CADASTRO / AVALIAÇÃO / AGENDAMENTO
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const avaliacaoAnterior = clienteExistente?.avaliacaoInicial || null;
    if (!validarHorario()) return;

    const partesNome = nome.trim().split(/\s+/);

    if (partesNome.length < 2 || partesNome.some((parte) => parte.length < 2)) {
      alert("Informe o nome e sobrenome do paciente.");
      irEtapa(1);
      return;
    }

    const numeroTelefone = telefone.replace(/\D/g, "");

    if (numeroTelefone.length < 7 || numeroTelefone.length > 15) {
      alert("Informe um telefone válido, com 7 a 15 dígitos.");
      irEtapa(1);
      return;
    }

    if (!/^\+?[\d\s()-]+$/.test(telefone.trim())) {
      alert(
        "Telefone inválido. Use números e, se necessário, o código internacional com +.",
      );
      irEtapa(1);
      return;
    }

    const baseCliente = {
      nome: nome.trim(),
      telefone,
      temWhatsapp,
      email,
      endereco,
      anotacoesPaciente,
    };

    const extras =
      tipo === "completo"
        ? {
            nascimento,
            peso,
            altura,
            genero,
            comorbidades: comorb,
            doencasExtras,
            doencasNeurologicas,
            sindromeDescricao,
            outrosDiagnosticos,
            remedios,
            areas,

            avaliacaoInicial: {
              queixa: queixaAtual.trim(),
              avaliacao: avaliacaoAtual.trim(),
              procedimentos: procedimentosAtual.trim(),
              evolucao: evolucaoAtual.trim(),
              conduta: condutaAtual.trim(),
            },
          }
        : {};

    let cliente = clienteExistente;

    const avaliacaoPreenchida =
  tipo === "completo" &&
  Boolean(queixaAtual.trim()) &&
  Boolean(avaliacaoAtual.trim());

    const avaliacaoAlterada =
  avaliacaoAnterior &&
  JSON.stringify(avaliacaoAnterior) !==
    JSON.stringify(extras.avaliacaoInicial);

const historicoAvaliacao = avaliacaoAlterada
  ? [
      ...(clienteExistente?.historicoAvaliacaoInicial || []),
      {
        data: new Date().toISOString(),
        avaliacaoAnterior,
      },
    ]
  : clienteExistente?.historicoAvaliacaoInicial || [];

   if (cliente) {
  await updateClient(cliente.id, {
    ...baseCliente,
    ...extras,
    ...(tipo === "completo"
      ? { historicoAvaliacaoInicial: historicoAvaliacao }
      : {}),
...(avaliacaoPreenchida && !cliente.avaliacaoInicialConcluida
      ? {
          avaliacaoInicialConcluida: true,
          avaliacaoInicialData: new Date().toISOString(),
        }
      : {}),
  });
} else {
      cliente = await addClient({
        ...baseCliente,
        ...extras,
     avaliacaoInicialConcluida: avaliacaoPreenchida,
avaliacaoInicialData: avaliacaoPreenchida
  ? new Date().toISOString()
  : null,
        consultas: [],
        receitas: [],
        atestados: [],
      });

      if (!cliente) return;
    }

    // Resumo clínico para o relatório
    const resumoExtras = (() => {
      const linhas = [];

      if (doencasExtras.length) {
        linhas.push(`Doenças adicionais: ${doencasExtras.join(", ")}`);
      }

      const blocos = Object.entries(areas)
        .filter(([, valor]) => valor.parts.length || valor.note)
        .map(
          ([grupo, valor]) =>
            `${grupo}: ${valor.parts.join(", ")}${
              valor.note ? ` — Obs: ${valor.note}` : ""
            }`,
        );

      if (blocos.length) {
        linhas.push(`Áreas afetadas: ${blocos.join(" | ")}`);
      }

      return linhas.length ? linhas.join("\n") + "\n\n" : "";
    })();

    const temDadosConsulta =
      queixaAtual.trim() ||
      avaliacaoAtual.trim() ||
      procedimentosAtual.trim() ||
      evolucaoAtual.trim() ||
      condutaAtual.trim();

    if (temDadosConsulta && !editandoPeloProntuario) {
      const dataISO = data || new Date().toISOString().slice(0, 10);

      const horaOK = hora || new Date().toTimeString().slice(0, 5);

      await addConsulta(cliente.id, {
        dataISO,
        hora: horaOK,
        texto: resumoExtras,
        queixa: queixaAtual.trim(),
        avaliacao: avaliacaoAtual.trim(),
        procedimentos: procedimentosAtual.trim(),
        evolucao: evolucaoAtual.trim(),
        conduta: condutaAtual.trim(),
      });
    }

    if (data && hora && !editandoPeloProntuario) {
      addAppointment({
        data,
        hora,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        observacoes,
        tipo,
        professionalId: professionalId || null,
        profissionalNome: profissionalSelecionado?.nome || "",
        duracaoMin: Number(duracao),
        status: "agendado",
      });
    }

    alert("✅ Cadastro salvo!");

    if (editandoPeloProntuario) {
      navigate(`/prontuario?clienteId=${cliente.id}`);
    } else {
      navigate("/agenda");
    }
  };

  // CONTINUA NA PARTE 3/3

  // =====================================================
  // DADOS DO PROFISSIONAL
  // =====================================================

  const salvarProf = () => {
    saveLS("profissional", prof);
    alert("✅ Dados do profissional salvos.");
  };

  // =====================================================
  // DOCUMENTOS PDF
  // =====================================================

  const pdfHeader = (doc, titulo) => {
    doc.setFontSize(18);
    doc.text(titulo, 40, 40);
    doc.setLineWidth(0.5);
    doc.line(40, 48, 555, 48);
    doc.setFontSize(11);
  };

  const pdfFooterProf = (doc, y) => {
    y += 16;

    if (y > 770) {
      doc.addPage();
      y = 60;
    }

    doc.line(40, y, 555, y);
    y += 18;

    doc.text(`${prof.nome || ""} | Registro: ${prof.registro || "-"}`, 40, y);

    y += 16;

    doc.text(`${prof.email || ""} | Tel: ${prof.telefone || ""}`, 40, y);
  };

  const imprimirDocumento = (cliente, titulo, texto, destinatario = "") => {
    if (!cliente) {
      alert("Salve o paciente primeiro.");
      return false;
    }

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    pdfHeader(doc, titulo);

    let y = 70;

    const escreverLinhas = (conteudo) => {
      const linhas = doc.splitTextToSize(String(conteudo || ""), 515);

      linhas.forEach((linha) => {
        if (y > 740) {
          doc.addPage();
          y = 60;
        }

        doc.text(linha, 40, y);
        y += 16;
      });
    };

    escreverLinhas(`Paciente: ${cliente.nome}`);
    escreverLinhas(`Nascimento: ${cliente.nascimento || "-"}`);

    if (destinatario) {
      escreverLinhas(`Destinatário: ${destinatario}`);
    }

    escreverLinhas(`Data: ${new Date().toLocaleDateString("pt-BR")}`);

    y += 16;
    escreverLinhas(texto);

    pdfFooterProf(doc, y);

    const nomeArquivo = String(cliente.nome || "paciente").replace(/\s+/g, "_");

    doc.save(`${titulo.toLowerCase()}_${nomeArquivo}.pdf`);

    return true;
  };

  const imprimirReceita = (cliente, texto) => {
    if (!imprimirDocumento(cliente, "RECEITA", texto)) {
      return;
    }

    updateClient(cliente.id, {
      receitas: [
        ...(cliente.receitas || []),
        {
          id: `rec_${Date.now()}`,
          createdAt: new Date().toISOString(),
          texto,
        },
      ],
    });
  };

  const imprimirAtestado = (cliente, para, texto) => {
    if (!imprimirDocumento(cliente, "ATESTADO", texto, para)) {
      return;
    }

    updateClient(cliente.id, {
      atestados: [
        ...(cliente.atestados || []),
        {
          id: `ats_${Date.now()}`,
          createdAt: new Date().toISOString(),
          para,
          texto,
        },
      ],
    });
  };

  // =====================================================
  // EXCLUSÃO DE PACIENTE
  // =====================================================

  const apagarPaciente = () => {
    if (!clienteExistente) return;

    deleteClient(clienteExistente.id);
    navigate("/clientes");
  };

  // =====================================================
  // ESTADOS DOS DOCUMENTOS
  // =====================================================

  const [receitaTexto, setReceitaTexto] = useState("");
  const [atestadoPara, setAtestadoPara] = useState("");
  const [atestadoTexto, setAtestadoTexto] = useState("");

  // =====================================================
  // COMPONENTES AUXILIARES DA INTERFACE
  // =====================================================

  const tituloEtapa = etapas[etapa - 1];

  const subtitulos = [
    "Identificação e informações de contato",
    "Histórico e condições de saúde",
    "Queixa principal e avaliação clínica",
    "Procedimentos, evolução e conduta",
    "Confira as informações antes de salvar",
  ];

  const iconesEtapas = ["👤", "🩺", "📋", "💙", "✓"];

  const Campo = ({
    titulo,
    valor,
    alterar,
    tipoCampo = "text",
    obrigatorio = false,
    placeholder = "",
  }) => (
    <div className="col-md-6">
      <label className="form-label">{titulo}</label>

      <input
        className="form-control"
        type={tipoCampo}
        value={valor}
        onChange={(e) => alterar(e.target.value)}
        required={obrigatorio && etapa === 5}
        placeholder={placeholder}
      />
    </div>
  );

  

  const GrupoOpcoes = ({ titulo, opcoes, selecionadas, alterar }) => (
    <div className="col-12">
      <label className="form-label d-block">{titulo}</label>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {opcoes.map((opcao) => (
          <label key={opcao} className="proflex-clinical-option">
            <input
              type="checkbox"
              className="form-check-input"
              checked={selecionadas.includes(opcao)}
              onChange={() => alterar(opcao)}
            />

            <span>{opcao}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // =====================================================
  // INTERFACE PRINCIPAL
  // =====================================================

  return (
    <div className={`pf-premium ${tema === "dark" ? "pf-dark" : ""}`}>
      <style>{premiumStyles}</style>

      <div className="pf-shell">
        {/* CABEÇALHO */}

        {/* PACIENTE */}

        <div className="pf-patientbar">
          <div className="pf-patient-avatar">
            {nome.trim() ? nome.trim().charAt(0).toUpperCase() : "P"}
          </div>

          <div className="pf-patient-identity">
            <strong>{nome.trim() || "Novo paciente"}</strong>

            <span>
              {clienteExistente ? "Paciente cadastrado" : "Novo cadastro"}
            </span>
          </div>

          <div className="pf-patient-date">
            <small>Data</small>
            <strong>
  {data ? data.split("-").reverse().join("/") : "Não definida"}
</strong>
          </div>

          <div className="pf-patient-date">
            <small>Horário</small>
            <strong>{hora || "--:--"}</strong>
          </div>

          <select
            className="pf-type-select"
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);

              if (e.target.value === "rapido") {
                irEtapa(1);
              }
            }}
          >
            <option value="rapido">Cadastro rápido</option>

            <option value="completo">Cadastro completo</option>
          </select>
        </div>

        {/* NAVEGAÇÃO DAS CINCO ETAPAS */}

        <nav className="pf-steps" aria-label="Etapas da avaliação">
          {etapas.map((item, index) => {
            const numero = index + 1;

            return (
              <button
                key={item}
                type="button"
                className={`pf-step-button ${
                  etapa === numero ? "active" : etapa > numero ? "done" : ""
                }`}
                onClick={() => irEtapa(numero)}
                aria-current={etapa === numero ? "step" : undefined}
              >
                <span>{etapa > numero ? "✓" : numero}</span>

                <b>{item}</b>
              </button>
            );
          })}
        </nav>

        {/* ÁREA DE TRABALHO */}

        <div className="pf-workspace">
          <div className="pf-stage-head">
            <div className="pf-stage-icon">{iconesEtapas[etapa - 1]}</div>

            <div>
              <h2>{tituloEtapa}</h2>
              <p>{subtitulos[etapa - 1]}</p>
            </div>
          </div>

         <form className="pf-form" onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3">
              {/* ETAPA 1 — DADOS PESSOAIS */}

              {etapa === 1 && (
                <>
                  <div className="col-md-3">
                    <label className="form-label">Data</label>

                    <input
                      type="date"
                      className="form-control"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Hora</label>

                    <input
                      type="time"
                      step="300"
                      className="form-control"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                    />
                  </div>

                  {!editandoPeloProntuario && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label">
                          Profissional responsável
                        </label>

                        <select
                          className="form-select"
                          value={professionalId}
                          onChange={(e) => setProfessionalId(e.target.value)}
                        >
                          <option value="">Selecione</option>

                          {profissionaisAtivos.map((profissional) => (
                            <option
                              key={profissional.id}
                              value={profissional.id}
                            >
                              {profissional.nome}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <label className="form-label">Duração (min)</label>

                        <input
                          type="number"
                          min="5"
                          max="480"
                          step="5"
                          className="form-control"
                          value={duracao}
                          onChange={(e) => setDuracao(Number(e.target.value))}
                        />
                      </div>
                    </>
                  )}

                  <SectionHeader
                    number="1"
                    title="Dados do paciente"
                    subtitle="Identificação e contato"
                  />

                  {tipo === "rapido" && !clienteExistente && (
                    <div className="col-12">
                      <label className="form-label">
                        Buscar paciente existente
                      </label>

                      <input
                        className="form-control"
                        value={buscaPaciente}
                        onChange={(e) => setBuscaPaciente(e.target.value)}
                        placeholder="Nome, telefone, e-mail ou CPF"
                      />

                      {buscaPaciente.trim().length >= 2 && (
                        <div className="list-group mt-2">
                          {pacientesEncontrados.map((paciente) => (
                            <button
                              key={paciente.id}
                              type="button"
                              className="list-group-item list-group-item-action"
                              onClick={() =>
                                navigate(
                                  `/agendar?${new URLSearchParams({
                                    data,
                                    hora,
                                    clienteId: paciente.id,
                                    tipo: "rapido",
                                    ...(professionalId
                                      ? {
                                          professionalId,
                                        }
                                      : {}),
                                  }).toString()}`,
                                )
                              }
                            >
                              {paciente.nome}
                            </button>
                          ))}

                          {pacientesEncontrados.length === 0 && (
                            <div className="list-group-item">
                              Nenhum paciente encontrado.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <Campo
                    titulo="Nome completo"
                    valor={nome}
                    alterar={setNome}
                  />

                  <div className="col-md-6">
                    <label className="form-label">Telefone</label>

                    <input
                      className="form-control"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />

                    <label className="d-flex align-items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={temWhatsapp}
                        onChange={(e) => setTemWhatsapp(e.target.checked)}
                      />
                      Este número também é WhatsApp
                    </label>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">E-mail</label>

                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      disabled={semEmail}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <label className="d-flex align-items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={semEmail}
                        onChange={(e) => {
                          setSemEmail(e.target.checked);

                          if (e.target.checked) {
                            setEmail("");
                          }
                        }}
                      />
                      Não possui e-mail
                    </label>
                  </div>

                  <Campo
                    titulo="Endereço"
                    valor={endereco}
                    alterar={setEndereco}
                  />

                  <TextoLongo
                    titulo="Anotações do paciente"
                    valor={anotacoesPaciente}
                    alterar={setAnotacoesPaciente}
                  />
                </>
              )}

              {/* CONTINUA NA PARTE 3B */}

              {/* ETAPA 2 — INFORMAÇÕES CLÍNICAS */}

              {etapa === 2 && (
                <>
                  {tipo === "rapido" ? (
                    <div className="col-12">
                      <p className="text-muted">
                        O cadastro rápido utiliza os dados principais do
                        paciente. Para registrar informações clínicas, selecione
                        Cadastro completo no cabeçalho.
                      </p>
                    </div>
                  ) : (
                    <>
                      <SectionHeader
                        number="2"
                        title="Informações clínicas"
                        subtitle="Histórico e condições de saúde"
                      />

                      <div className="col-md-3">
                        <label className="form-label">Nascimento</label>
                        <input
                          type="date"
                          className="form-control"
                          value={nascimento}
                          onChange={(e) => setNascimento(e.target.value)}
                        />
                        <small className="text-muted">
                          Idade: {idade || "-"}
                        </small>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Peso (kg)</label>
                        <input
                          className="form-control"
                          value={peso}
                          onChange={(e) => setPeso(e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Altura (cm)</label>
                        <input
                          className="form-control"
                          value={altura}
                          onChange={(e) => setAltura(e.target.value)}
                        />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label">Gênero</label>
                        <select
                          className="form-select"
                          value={genero}
                          onChange={(e) => setGenero(e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <GrupoOpcoes
                        titulo="Comorbidades"
                        opcoes={COMORBIDADES || []}
                        selecionadas={comorb}
                        alterar={toggleComorb}
                      />

                      <GrupoOpcoes
                        titulo="Condições musculoesqueléticas"
                        opcoes={DOENCAS_MUSCULOESQUELETICAS}
                        selecionadas={doencasExtras}
                        alterar={toggleDoenca}
                      />

                      <GrupoOpcoes
                        titulo="Condições neurológicas"
                        opcoes={DOENCAS_NEUROLOGICAS}
                        selecionadas={doencasNeurologicas}
                        alterar={toggleNeurologica}
                      />

                      {doencasNeurologicas.includes("Síndrome") && (
                        <div className="col-12">
                          <label className="form-label">
                            Especifique a síndrome
                          </label>
                          <input
                            className="form-control"
                            value={sindromeDescricao}
                            onChange={(e) =>
                              setSindromeDescricao(e.target.value)
                            }
                          />
                        </div>
                      )}

                      <SectionHeader
                        number="3"
                        title="Áreas do corpo afetadas"
                        subtitle="Selecione as regiões e registre observações"
                      />

                      {Object.entries(AREAS).map(([grupo, partes]) => (
                        <div key={grupo} className="col-12">
                          <div
                            className="p-3 rounded"
                            style={{
                              border: "1px solid var(--line)",
                              background: "var(--soft)",
                            }}
                          >
                            <strong>{grupo}</strong>

                            <div
                              className="mt-3"
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {partes.map((parte) => (
                                <label
                                  key={parte}
                                  className="proflex-clinical-option"
                                >
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={Boolean(
                                      areas[grupo]?.parts?.includes(parte),
                                    )}
                                    onChange={() =>
                                      toggleAreaPart(grupo, parte)
                                    }
                                  />
                                  <span>{parte}</span>
                                </label>
                              ))}
                            </div>

                            <textarea
                              className="form-control mt-3"
                              rows={2}
                              placeholder={`Observações sobre ${grupo.toLowerCase()}`}
                              value={areas[grupo]?.note || ""}
                              onChange={(e) =>
                                setAreaNote(grupo, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}

                      <TextoLongo
                        titulo="Outros diagnósticos"
                        valor={outrosDiagnosticos}
                        alterar={setOutrosDiagnosticos}
                      />

                      <TextoLongo
                        titulo="Medicamentos em uso"
                        valor={remedios}
                        alterar={setRemedios}
                      />
                    </>
                  )}
                </>
              )}

              {/* ETAPA 3 — AVALIAÇÃO */}

              {etapa === 3 && (
                <>
                  <SectionHeader
                    number="4"
                    title="Avaliação clínica"
                    subtitle="Registro da queixa e dos achados da avaliação"
                  />

                  <TextoLongo
                    titulo="Queixa principal"
                    valor={queixaAtual}
                    alterar={setQueixaAtual}
                    placeholder="Descreva a queixa apresentada pelo paciente"
                  />

                  <TextoLongo
                    titulo="Avaliação"
                    valor={avaliacaoAtual}
                    alterar={setAvaliacaoAtual}
                    placeholder="Registre os achados da avaliação clínica"
                  />

                  <div className="col-12">
                    <p className="text-muted mb-0">
                      As informações desta etapa serão incluídas no registro da
                      consulta quando o cadastro for salvo.
                    </p>
                  </div>
                </>
              )}

              {/* ETAPA 4 — ATENDIMENTO */}

              {etapa === 4 && (
                <>
                  <SectionHeader
                    number="5"
                    title="Atendimento"
                    subtitle="Procedimentos, evolução e conduta"
                  />

                  <TextoLongo
                    titulo="Procedimentos realizados"
                    valor={procedimentosAtual}
                    alterar={setProcedimentosAtual}
                    placeholder="Descreva os procedimentos realizados"
                  />

                  <TextoLongo
                    titulo="Evolução do paciente"
                    valor={evolucaoAtual}
                    alterar={setEvolucaoAtual}
                    placeholder="Registre a evolução observada"
                  />

                  <TextoLongo
                    titulo="Conduta"
                    valor={condutaAtual}
                    alterar={setCondutaAtual}
                    placeholder="Descreva a conduta e as orientações"
                  />

                  <TextoLongo
                    titulo="Observações do agendamento"
                    valor={observacoes}
                    alterar={setObservacoes}
                  />
                </>
              )}

              {/* ETAPA 5 — REVISÃO E FINALIZAÇÃO */}

              {etapa === 5 && (
                <>
                  <div className="col-12 pf-review">
                    <h3>Revisão do cadastro</h3>
                    <p>
                      Confira as informações antes de finalizar. Para corrigir
                      algum dado, retorne à etapa correspondente.
                    </p>

                    <div className="pf-review-grid">
                      <div>
                        <small>Paciente</small>
                        <strong>{nome || "Não informado"}</strong>
                      </div>

                      <div>
                        <small>Telefone</small>
                        <strong>{telefone || "Não informado"}</strong>
                      </div>

                      <div>
                        <small>E-mail</small>
                        <strong>
                          {email || (semEmail ? "Não possui" : "Não informado")}
                        </strong>
                      </div>

                      <div>
                        <small>Endereço</small>
                        <strong>{endereco || "Não informado"}</strong>
                      </div>

                      <div>
                        <small>Data</small>
                   <strong>
  {data ? data.split("-").reverse().join("/") : "Não informada"}
</strong>
                      </div>

                      <div>
                        <small>Horário</small>
                        <strong>{hora || "Não informado"}</strong>
                      </div>

                      <div>
                        <small>Tipo de cadastro</small>
                        <strong>
                          {tipo === "completo" ? "Completo" : "Rápido"}
                        </strong>
                      </div>

                      <div>
                        <small>Profissional</small>
                        <strong>
                          {profissionalSelecionado?.nome || "Não selecionado"}
                        </strong>
                      </div>

                      {tipo === "completo" && (
                        <>
                          <div>
                            <small>Nascimento</small>
                            <strong>{nascimento || "Não informado"}</strong>
                          </div>

                          <div>
                            <small>Idade</small>
                            <strong>{idade || "-"}</strong>
                          </div>

                          <div>
                            <small>Comorbidades</small>
                            <strong>
                              {comorb.join(", ") || "Nenhuma informada"}
                            </strong>
                          </div>

                          <div>
                            <small>Condições neurológicas</small>
                            <strong>
                              {doencasNeurologicas.join(", ") ||
                                "Nenhuma informada"}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {clienteExistente && consultas.length > 0 && (
                    <div className="col-12 mt-4">
                      <SectionHeader
                        number="6"
                        title="Histórico de consultas"
                        subtitle="Consultas anteriores do paciente"
                      />

                      <div className="proflex-history-toolbar mb-3">
                        <h5>Consultas ({consultas.length})</h5>

                        <div className="proflex-history-actions">
                          <label className="d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                consultas.length > 0 &&
                                consultas.every((consulta) =>
                                  sel.includes(consulta.id),
                                )
                              }
                              onChange={(e) => selecionarTudo(e.target.checked)}
                            />
                            Selecionar tudo
                          </label>

                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={gerarPDFSelecionadas}
                          >
                            Relatório (PDF)
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={excluirSelecionadas}
                          >
                            Excluir selecionadas
                          </button>
                          {excluindoConsultas && (
  <div
    className="alert alert-info d-flex align-items-center gap-2 mt-3"
    role="status"
    aria-live="polite"
  >
    <span
      className="spinner-border spinner-border-sm"
      aria-hidden="true"
    />

    <span>
      <strong>Excluindo consultas...</strong>
      <br />
      Aguarde enquanto os registros são removidos.
    </span>
  </div>
)}

                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={novaConsulta}
                          >
                            Nova consulta
                          </button>
                        </div>
                      </div>

                      <div className="list-group">
                        {consultas.map((consulta) => (
                          <div className="list-group-item" key={consulta.id}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={sel.includes(consulta.id)}
                                onChange={(e) =>
                                  setSel((prev) =>
                                    e.target.checked
                                      ? [...prev, consulta.id]
                                      : prev.filter((id) => id !== consulta.id),
                                  )
                                }
                              />

                              <strong>Consulta {consulta.numero || ""}</strong>

                              <small className="text-muted">
                                {consulta.dataISO || ""} {consulta.hora || ""}
                              </small>
                            </div>

                            <textarea
                              className="form-control"
                              rows={3}
                              value={consulta.texto || ""}
                              onChange={(e) =>
                                setTextoConsulta(consulta.id, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {clienteExistente && consultas.length === 0 && (
                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={novaConsulta}
                      >
                        + Nova consulta
                      </button>
                    </div>
                  )}

                  {clienteExistente && (
                    <>
                      <SectionHeader
                        number="7"
                        title="Documentos"
                        subtitle="Receita e atestado"
                      />

                      <div className="col-12">
                        <label className="form-label">Receita</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={receitaTexto}
                          onChange={(e) => setReceitaTexto(e.target.value)}
                        />

                        <button
                          type="button"
                          className="btn btn-outline-primary mt-2"
                          onClick={() =>
                            imprimirReceita(clienteExistente, receitaTexto)
                          }
                        >
                          Gerar receita (PDF)
                        </button>
                      </div>

                      <div className="col-12">
                        <label className="form-label">
                          Destinatário do atestado
                        </label>
                        <input
                          className="form-control"
                          value={atestadoPara}
                          onChange={(e) => setAtestadoPara(e.target.value)}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Texto do atestado</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={atestadoTexto}
                          onChange={(e) => setAtestadoTexto(e.target.value)}
                        />

                        <button
                          type="button"
                          className="btn btn-outline-primary mt-2"
                          onClick={() =>
                            imprimirAtestado(
                              clienteExistente,
                              atestadoPara,
                              atestadoTexto,
                            )
                          }
                        >
                          Gerar atestado (PDF)
                        </button>
                      </div>

                      <SectionHeader
                        number="8"
                        title="Dados do profissional"
                        subtitle="Informações utilizadas nos documentos"
                      />

                      {[
                        ["Nome", "nome"],
                        ["Registro", "registro"],
                        ["E-mail", "email"],
                        ["Telefone", "telefone"],
                        ["Endereço", "endereco"],
                      ].map(([rotulo, chave]) => (
                        <div className="col-md-6" key={chave}>
                          <label className="form-label">{rotulo}</label>
                          <input
                            className="form-control"
                            value={prof[chave] || ""}
                            onChange={(e) =>
                              setProf((prev) => ({
                                ...prev,
                                [chave]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}

                      <div className="col-12">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={salvarProf}
                        >
                          Salvar dados do profissional
                        </button>
                      </div>

                      <div className="col-12 mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={apagarPaciente}
                        >
                          Excluir paciente
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* NAVEGAÇÃO INFERIOR */}

            <div className="pf-wizard-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={etapa === 1}
                onClick={() => irEtapa(etapa - 1)}
              >
                ← Voltar
              </button>

              <span className="pf-save-note">Etapa {etapa} de 5</span>

              {etapa < 5 ? (
                <button
                  type="button"
                  className="btn pf-next"
                  onClick={() => irEtapa(etapa + 1)}
                >
                  Continuar →
                </button>
              ) : (
               <button
  type="button"
  className="btn pf-next"
  onClick={handleSubmit}
>
                  💾{" "}
                  {clienteExistente ? "Salvar alterações" : "Salvar cadastro"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
