import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { jsPDF } from "jspdf";

const ICONS = {
  search: <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      <path d="M3 12h5l2-3 3 6 2-3h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18m-12 6 2 2 4-4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18M6 16l5-5 4 3 6-7" />
    </>
  ),
  images: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  camera: (
    <>
      <path d="M14 4H9L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4Z" />
      <circle cx="12" cy="14" r="4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 12h6m-6 4h6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7 10.5a16 16 0 0 0 6.5 6.5l2-2a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 6 10 7 10-7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const MENU = [
  { key: "resumo", label: "Resumo", icon: "dashboard" },
  { key: "clinico", label: "Avaliação", icon: "heart" },
  { key: "consultas", label: "Consultas", icon: "calendar" },
  { key: "evolucao", label: "Evolução", icon: "chart" },
  { key: "fotos", label: "Fotos", icon: "images" },
  { key: "documentos", label: "Documentos", icon: "file" },
];

const premiumCSS = `
.pfp {
  --pf-bg:#f7f8f7;
  --pf-card:#ffffff;
  --pf-text:#17302e;
  --pf-muted:#71817f;
  --pf-border:#e5ebe8;
 --pf-sidebar:#10343e;
  --pf-sidebar-text:#d7e8e2;
  --pf-accent:#c7a76c;
 --pf-turquoise:#19b9b0;
  --pf-input:#ffffff;
  --pf-shadow:0 12px 36px rgba(18,55,50,.06);
  color:var(--pf-text);
  background:var(--pf-bg);
  border-radius:20px;
  padding:28px;
  min-height:75vh;
}
.pfp.dark {
  --pf-bg:#0d1828;
  --pf-card:#16263b;
  --pf-text:#edf6f6;
  --pf-muted:#a0b4c3;
  --pf-border:#2b4055;
  --pf-sidebar:#102136;
  --pf-sidebar-text:#c4d9e3;
  --pf-accent:#d6b778;
  --pf-turquoise:#45dcca;
  --pf-input:#1b3045;
  --pf-shadow:0 15px 45px rgba(0,0,0,.17);
}
.pfp, .pfp * { box-sizing:border-box; }
.pfp .pfp-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:24px;
}
.pfp .pfp-title {
  display:flex;
  align-items:center;
  gap:14px;
}
.pfp .pfp-title-icon {
  width:52px;
  height:52px;
  border-radius:15px;
  display:grid;
  place-items:center;
  color:var(--pf-accent);
  background:var(--pf-card);
  border:1px solid var(--pf-border);
}
.pfp h1 {
  font-size:27px;
  font-weight:750;
  letter-spacing:-.8px;
  margin:0;
  color:var(--pf-text);
}
.pfp .pfp-subtitle {
  color:var(--pf-muted);
  font-size:13px;
  margin:5px 0 0;
}
.pfp .pfp-theme {
  border:1px solid var(--pf-border);
  background:var(--pf-card);
  color:var(--pf-text);
  border-radius:30px;
  padding:10px 15px;
  display:flex;
  align-items:center;
  gap:9px;
  cursor:pointer;
  font-weight:600;
  font-size:13px;
}
.pfp .pfp-searchbox {
  background:var(--pf-card);
  border:1px solid var(--pf-border);
  border-radius:17px;
  box-shadow:var(--pf-shadow);
  padding:18px 22px;
  margin-bottom:22px;
  position:relative;
  z-index:3;
}
.pfp .pfp-search-label {
  display:block;
  color:var(--pf-muted);
  font-size:12px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:1px;
  margin-bottom:10px;
}
.pfp .pfp-search-field {
  display:flex;
  align-items:center;
  gap:12px;
  border:1px solid var(--pf-border);
  border-radius:11px;
  background:var(--pf-input);
  color:var(--pf-muted);
  padding:0 14px;
}
.pfp .pfp-search-field:focus-within {
  border-color:var(--pf-turquoise);
  box-shadow:0 0 0 3px rgba(23,183,166,.12);
}
.pfp .pfp-search-field input {
  width:100%;
  padding:13px 0;
  border:0;
  outline:0;
  background:transparent;
  color:var(--pf-text);
  font-size:14px;
}
.pfp .pfp-search-field input::placeholder {
  color:var(--pf-muted);
}
.pfp .pfp-results {
  margin-top:10px;
  border:1px solid var(--pf-border);
  border-radius:12px;
  overflow:hidden;
  background:var(--pf-card);
}
.pfp .pfp-result {
  width:100%;
  background:transparent;
  border:0;
  border-bottom:1px solid var(--pf-border);
  color:var(--pf-text);
  display:flex;
  align-items:center;
  gap:12px;
  padding:12px 15px;
  text-align:left;
  cursor:pointer;
}
.pfp .pfp-result:last-child { border-bottom:0; }
.pfp .pfp-result:hover { background:rgba(23,183,166,.08); }
.pfp .pfp-result-photo {
  width:39px;
  height:39px;
  flex-shrink:0;
  border-radius:50%;
  overflow:hidden;
  display:grid;
  place-items:center;
  background:rgba(23,183,166,.12);
  color:var(--pf-turquoise);
  font-weight:700;
}
.pfp .pfp-result-photo img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.pfp .pfp-result small {
  display:block;
  color:var(--pf-muted);
  margin-top:3px;
}
.pfp .pfp-patient {
  background:var(--pf-card);
  border:1px solid var(--pf-border);
  box-shadow:var(--pf-shadow);
  border-radius:19px;
  padding:23px 25px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:24px;
}
.pfp .pfp-profile {
  display:flex;
  align-items:center;
  gap:17px;
  min-width:0;
}
.pfp .pfp-photo {
  width:80px;
  height:80px;
  flex-shrink:0;
  border-radius:50%;
  overflow:hidden;
  border:3px solid var(--pf-accent);
  background:var(--pf-bg);
  display:grid;
  place-items:center;
  color:var(--pf-muted);
}
.pfp .pfp-photo img {
  width:100%;
  height:100%;
  object-fit:cover;
}
.pfp .pfp-profile h2 {
  font-size:22px;
  font-weight:750;
  color:var(--pf-text);
  margin:0 0 5px;
}
.pfp .pfp-profile p {
  color:var(--pf-muted);
  font-size:13px;
  margin:0;
}
.pfp .pfp-photo-edit {
  color:var(--pf-turquoise);
  font-size:12px;
  cursor:pointer;
  margin-top:8px;
  display:inline-flex;
  align-items:center;
  gap:6px;
}
.pfp .pfp-actions {
  display:flex;
  flex-wrap:wrap;
  justify-content:flex-end;
  gap:10px;
}
.pfp .pfp-primary, .pfp .pfp-secondary {
  border-radius:10px;
  padding:12px 16px;
  font-size:13px;
  font-weight:700;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  cursor:pointer;
  transition:transform .15s ease,opacity .15s ease;
}
.pfp .pfp-primary:hover,.pfp .pfp-secondary:hover {
  transform:translateY(-1px);
}
.pfp .pfp-primary {
  background:linear-gradient(110deg,#10313d,#18565b);
  border:1px solid #18565b;
  color:white;
}
.pfp.dark .pfp-primary {
  background:linear-gradient(135deg,#16b5a6,#0b827e);
}
.pfp .pfp-secondary {
  color:var(--pf-text);
  border:1px solid var(--pf-accent);
  background:var(--pf-card);
}
.pfp .pfp-layout {
  display:grid;
  grid-template-columns:210px minmax(0,1fr);
  gap:23px;
  align-items:start;
}
.pfp .pfp-sidebar {
  background:linear-gradient(120deg,#10313d,#174e52);
  border-radius:18px;
  padding:18px 11px;
  box-shadow:var(--pf-shadow);
}
.pfp .pfp-sidebar-label {
  color:var(--pf-accent);
  font-size:10px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  padding:6px 14px 17px;
  font-weight:700;
}
.pfp .pfp-menu-button {
  width:100%;
  display:flex;
  align-items:center;
  gap:12px;
  text-align:left;
  border:0;
  border-radius:11px;
  background:transparent;
  color:var(--pf-sidebar-text);
  padding:14px 13px;
  margin-bottom:4px;
  cursor:pointer;
  font-size:14px;
  font-weight:550;
}
.pfp .pfp-menu-button:hover {
  background:rgba(255,255,255,.07);
}
.pfp .pfp-menu-button.active {
  color:#ffffff;
  background:rgba(69,220,202,.15);
  box-shadow:inset 3px 0 0 var(--pf-turquoise);
}
.pfp .pfp-menu-button.active svg {
  color:var(--pf-turquoise);
}
.pfp .pfp-main { min-width:0; }
.pfp .pfp-panel {
  border:1px solid var(--pf-border);
  border-radius:17px;
  background:var(--pf-card);
  padding:24px;
  box-shadow:var(--pf-shadow);
  min-width:0;
}
.pfp .pfp-section-title {
  font-size:20px;
  color:var(--pf-text);
  font-weight:750;
  margin:0 0 8px;
}
.pfp .pfp-section-subtitle {
  color:var(--pf-muted);
  font-size:13px;
  margin:0 0 20px;
}
.pfp .pfp-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
}
.pfp .pfp-stat {
  background:var(--pf-card);
  border:1px solid var(--pf-border);
  border-radius:13px;
  padding:18px;
  min-width:0;
}
.pfp .pfp-stat-label {
  display:flex;
  align-items:center;
  gap:8px;
  color:var(--pf-muted);
  font-size:12px;
  margin-bottom:11px;
}
.pfp .pfp-stat-label svg { color:var(--pf-accent); }
.pfp .pfp-stat-value {
  font-weight:700;
  color:var(--pf-text);
  font-size:15px;
  overflow-wrap:anywhere;
}
.pfp .pfp-span-3 { grid-column:span 3; }
.pfp .pfp-muted { color:var(--pf-muted); }
.pfp .pfp-count {
  color:var(--pf-turquoise);
  font-size:30px;
  font-weight:800;
}
.pfp .pfp-divider {
  height:1px;
  background:var(--pf-border);
  margin:20px 0;
}
.pfp .pfp-chip {
  display:inline-block;
  padding:6px 10px;
  border:1px solid var(--pf-border);
  border-radius:20px;
  margin:4px 5px 4px 0;
  font-size:12px;
  background:rgba(23,183,166,.07);
  color:var(--pf-text);
}
.pfp .pfp-record {
  border:1px solid var(--pf-border);
  border-radius:12px;
  padding:16px;
  margin-bottom:12px;
  background:var(--pf-card);
  color:var(--pf-text);
}
.pfp .pfp-record-button {
  width:100%;
  text-align:left;
  cursor:pointer;
}
.pfp .pfp-record-button:hover {
  border-color:var(--pf-turquoise);
}
.pfp .pfp-photo-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
}
.pfp .pfp-clinical-photo {
  width:100%;
  height:170px;
  object-fit:cover;
  border-radius:9px;
}
.pfp .pfp-document-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:14px;
}
.pfp .pfp-document {
  border:1px solid var(--pf-border);
  border-radius:13px;
  padding:18px;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:10px;
}
.pfp .pfp-document h3 {
  font-size:16px;
  font-weight:700;
  margin:0;
  color:var(--pf-text);
}
.pfp .pfp-document p {
  font-size:13px;
  color:var(--pf-muted);
  flex:1;
  margin:0;
}
.pfp .pfp-document button {
  border:0;
  background:var(--pf-sidebar);
  color:white;
  border-radius:8px;
  padding:10px 13px;
  cursor:pointer;
  font-size:12px;
  font-weight:700;
}
.pfp .pfp-modal {
  position:fixed;
  inset:0;
  z-index:1055;
  background:rgba(0,0,0,.65);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}
.pfp .pfp-modal-box {
  width:min(650px,100%);
  max-height:90vh;
  overflow:auto;
  background:var(--pf-card);
  color:var(--pf-text);
  border:1px solid var(--pf-border);
  border-radius:18px;
  padding:24px;
}
.pfp .pfp-modal-box h3 {
  font-size:20px;
  margin:0 0 16px;
}
.pfp .pfp-modal-box h4 {
  font-size:14px;
  margin:18px 0 6px;
}
.pfp .pfp-modal-box p { white-space:pre-wrap; }
.pfp .pfp-modal-actions {
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:20px;
}
.pfp .pfp-modal-box input,
.pfp .pfp-modal-box select,
.pfp .pfp-modal-box textarea {
  width:100%;
  background:var(--pf-input);
  color:var(--pf-text);
  border:1px solid var(--pf-border);
  border-radius:8px;
  padding:10px;
  margin:6px 0 15px;
}
.pfp .pfp-modal-box label {
  font-size:13px;
  font-weight:650;
}
@media(max-width:950px) {
  .pfp .pfp-patient {
    flex-direction:column;
    align-items:stretch;
  }
  .pfp .pfp-actions { justify-content:flex-start; }
  .pfp .pfp-layout { grid-template-columns:155px minmax(0,1fr); }
  .pfp .pfp-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .pfp .pfp-span-3 { grid-column:span 2; }
  .pfp .pfp-document-grid { grid-template-columns:1fr; }
}
@media(max-width:650px) {
  .pfp { padding:15px; border-radius:12px; }
  .pfp h1 { font-size:21px; }
  .pfp .pfp-layout { grid-template-columns:1fr; }
  .pfp .pfp-sidebar {
    display:flex;
    overflow-x:auto;
    gap:5px;
    padding:9px;
  }
  .pfp .pfp-sidebar-label { display:none; }
  .pfp .pfp-menu-button {
    flex:0 0 auto;
    flex-direction:column;
    gap:5px;
    font-size:11px;
    padding:10px;
  }
  .pfp .pfp-menu-button.active {
    box-shadow:inset 0 -3px 0 var(--pf-turquoise);
  }
  .pfp .pfp-panel { padding:16px; }
  .pfp .pfp-grid { grid-template-columns:1fr; }
  .pfp .pfp-span-3 { grid-column:span 1; }
  .pfp .pfp-photo-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .pfp .pfp-header { align-items:flex-start; }
  .pfp .pfp-profile h2 { font-size:19px; }
}
`;

export default function Prontuario() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const {
    clients,
    clientsLoading,
    clientsError,
    getClient,
    salvarFotoPerfil,
  } = useApp();

  const clienteId = params.get("clienteId");
  const paciente = clienteId ? getClient(clienteId) : null;

  const [aba, setAba] = useState("resumo");
  const [busca, setBusca] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);
  const [mostrarAtestado, setMostrarAtestado] = useState(false);
  const [dataAtestado, setDataAtestado] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [tipoAtestado, setTipoAtestado] = useState("comparecimento");
  const [observacoesAtestado, setObservacoesAtestado] = useState("");

  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("proflex-prontuario-theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("proflex-prontuario-theme", tema);
    } catch {
      // A preferência visual continua funcionando nesta sessão.
    }
  }, [tema]);

  useEffect(() => {
    setBusca("");
    setMostrarResultados(false);
    setConsultaSelecionada(null);
    setAba("resumo");
  }, [clienteId]);

  const pacientesFiltrados = (clients || []).filter((item) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;

    return [item.nome, item.telefone, item.email, item.cpf]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(termo);
  });

  const selecionarPaciente = (item) => {
    setBusca("");
    setMostrarResultados(false);
    navigate(`/prontuario?clienteId=${encodeURIComponent(item.id)}`);
  };

  const atualizarFoto = async (event) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo || !clienteId) return;

    if (!arquivo.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    setSalvandoFoto(true);

    try {
      await salvarFotoPerfil(clienteId, arquivo);
      alert("Foto do paciente salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      alert("Não foi possível salvar a foto.");
    } finally {
      setSalvandoFoto(false);
      event.target.value = "";
    }
  };

  const gerarProntuarioPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = 50;

    const checkPage = (space = 40) => {
      if (y + space > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }
    };

    const addTitle = (value) => {
      checkPage(45);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(value, margin, y);
      y += 22;
    };

    const addText = (label, value) => {
      const lines = doc.splitTextToSize(
        String(value || "Não informado"),
        contentWidth - 120
      );

      checkPage(lines.length * 13 + 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + 120, y);
      y += Math.max(18, lines.length * 13);
    };

    const formatList = (items) =>
      Array.isArray(items) && items.length
        ? items.join(", ")
        : "Nenhuma registrada";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ProFlex", margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PRONTUÁRIO DO PACIENTE", margin, y);
    y += 12;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 28;

    addTitle("Identificação do paciente");
    addText("Nome", paciente.nome);
    addText("Nascimento", paciente.nascimento);
    addText("Telefone", paciente.telefone);
    addText("E-mail", paciente.email);
    addText("Endereço", paciente.endereco);

    y += 15;

    addTitle("Dados clínicos");
    addText("Peso", paciente.peso ? `${paciente.peso} kg` : "");
    addText("Altura", paciente.altura ? `${paciente.altura} cm` : "");
    addText("Gênero", paciente.genero);
    addText("Comorbidades", formatList(paciente.comorbidades));
    addText("Musculoesqueléticas", formatList(paciente.doencasExtras));
    addText("Neurológicas", formatList(paciente.doencasNeurologicas));
    addText("Síndrome", paciente.sindromeDescricao);
    addText("Medicamentos", paciente.remedios);
    addText("Diagnósticos", paciente.outrosDiagnosticos);
    addText("Histórico geral", paciente.anotacoesPaciente);

    y += 15;
    addTitle("Histórico de consultas");

    const consultas = paciente.consultas || [];

    if (!consultas.length) {
      addText("Consultas", "Nenhuma consulta registrada");
    } else {
      consultas.forEach((consulta, index) => {
        checkPage(130);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          `Consulta ${consulta.numero || index + 1} - ${consulta.dataISO || "-"} ${consulta.hora || ""}`,
          margin,
          y
        );

        y += 20;
        addText("Queixa", consulta.queixa);
        addText("Avaliação", consulta.avaliacao);
        addText("Procedimentos", consulta.procedimentos);
        addText("Evolução", consulta.evolucao);
        addText("Conduta / Plano", consulta.conduta);
        y += 12;
      });
    }

    checkPage(50);
    y += 10;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Prontuário gerado pelo ProFlex em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      y
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarConsultaPDF = (consulta) => {
    if (!paciente || !consulta) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = 50;

    const addField = (label, value) => {
      const lines = doc.splitTextToSize(
        String(value || "Não informado"),
        contentWidth
      );

      if (y + lines.length * 14 + 45 > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.text(lines, margin, y);
      y += lines.length * 14 + 22;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ProFlex", margin, y);
    y += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("REGISTRO DE CONSULTA", margin, y);
    y += 15;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(String(paciente.nome || ""), margin, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${consulta.dataISO || "-"} ${consulta.hora || ""}`, margin, y);
    y += 35;

    addField("Queixa principal", consulta.queixa);
    addField("Avaliação", consulta.avaliacao);
    addField("Procedimentos realizados", consulta.procedimentos);
    addField("Evolução", consulta.evolucao);
    addField("Conduta / Plano", consulta.conduta);

    if (y + 50 > pageHeight - 50) {
      doc.addPage();
      y = 50;
    }

    y += 10;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    doc.setFontSize(8);
    doc.text(
      `Documento gerado pelo ProFlex em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      y
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarRelatorioClinicoPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margem = 45;
    const largura = doc.internal.pageSize.getWidth() - margem * 2;
    const altura = doc.internal.pageSize.getHeight();
    let y = 50;

    const adicionarCampo = (titulo, conteudo) => {
      const linhas = doc.splitTextToSize(
        String(conteudo || "Não informado"),
        largura
      );

      if (y + linhas.length * 14 + 45 > altura - 50) {
        doc.addPage();
        y = 50;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(titulo, margem, y);
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(linhas, margem, y);
      y += linhas.length * 14 + 22;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", margem, y);
    y += 30;

    doc.setFontSize(14);
    doc.text("RELATÓRIO CLÍNICO", margem, y);
    y += 35;

    adicionarCampo("Paciente", paciente.nome);
    adicionarCampo("Data de emissão", new Date().toLocaleDateString("pt-BR"));

    const consultas = paciente.consultas || [];

    if (!consultas.length) {
      adicionarCampo("Histórico clínico", "Nenhuma consulta registrada.");
    } else {
      consultas.forEach((consulta, index) => {
        adicionarCampo(
          `Consulta ${consulta.numero || index + 1} - ${consulta.dataISO || ""}`,
          [
            `Avaliação: ${consulta.avaliacao || "Não informada"}`,
            `Evolução: ${consulta.evolucao || "Não informada"}`,
            `Conduta: ${consulta.conduta || "Não informada"}`,
          ].join("\n")
        );
      });
    }

    adicionarCampo(
      "Observação",
      "Documento gerado a partir dos registros clínicos disponíveis no ProFlex. Requer revisão e validação do profissional responsável."
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarAtestadoPDF = () => {
    if (!paciente || !dataAtestado) return;

    const doc = new jsPDF();
    const margem = 20;
    const largura = doc.internal.pageSize.getWidth() - 40;
    const data = dataAtestado.split("-").reverse().join("/");

    const titulo =
      tipoAtestado === "comparecimento"
        ? "DECLARAÇÃO DE COMPARECIMENTO"
        : "MINUTA DE ATESTADO DE AFASTAMENTO";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", margem, 25);

    doc.setFontSize(14);
    doc.text(titulo, margem, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const texto =
      tipoAtestado === "comparecimento"
        ? `Rascunho de declaração de comparecimento de ${paciente.nome}, referente ao atendimento em ${data}.`
        : `Minuta referente ao paciente ${paciente.nome}, com atendimento em ${data}. A necessidade e o período de afastamento dependem de avaliação profissional.`;

    doc.text(doc.splitTextToSize(texto, largura), margem, 65);

    let y = 100;

    if (observacoesAtestado.trim()) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", margem, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      const linhas = doc.splitTextToSize(observacoesAtestado, largura);
      const limite = doc.internal.pageSize.getHeight() - 50;

      linhas.forEach((linha) => {
        if (y > limite) {
          doc.addPage();
          y = 25;
        }
        doc.text(linha, margem, y);
        y += 7;
      });
    }

    const altura = doc.internal.pageSize.getHeight();

    doc.setFontSize(9);
    doc.text(
      "RASCUNHO - requer revisão e assinatura de profissional habilitado.",
      margem,
      altura - 20
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarReceitaPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", 20, 25);

    doc.setFontSize(15);
    doc.text("RECEITA - RASCUNHO", 20, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Paciente: ${paciente.nome}`, 20, 65);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 75);

    doc.text("Prescrição:", 20, 100);
    doc.line(20, 120, 190, 120);
    doc.line(20, 135, 190, 135);
    doc.line(20, 150, 190, 150);

    doc.text("________________________________", 20, 245);
    doc.text("Profissional responsável", 20, 255);

    doc.setFontSize(9);
    doc.text(
      "RASCUNHO - requer validação e assinatura profissional.",
      20,
      280
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  // CONTINUA NA PARTE 2, SEM FECHAR O COMPONENTE AQUI.
    const consultas = paciente?.consultas || [];

  const fotosClinicas = consultas.flatMap((consulta, index) =>
    (consulta.fotos || []).map((foto, fotoIndex) => ({
      id: `${consulta.id || index}-${fotoIndex}`,
      url:
        typeof foto === "string"
          ? foto
          : foto?.url || foto?.downloadURL || foto?.src || "",
      consulta: consulta.numero || index + 1,
      data: consulta.dataISO || "Sem data",
    }))
  );

  const selecionarAba = (chave) => {
    setAba(chave);
    setConsultaSelecionada(null);
  };

  const buscarPaciente = (
    <div className="pfp-searchbox">
      <label className="pfp-search-label" htmlFor="pfp-patient-search">
        Localizar paciente
      </label>

      <div className="pfp-search-field">
        <Icon name="search" size={20} />

        <input
          id="pfp-patient-search"
          type="text"
          autoComplete="off"
          placeholder="Digite o nome, telefone, e-mail ou CPF..."
          value={busca}
          onFocus={() => setMostrarResultados(true)}
          onChange={(event) => {
            setBusca(event.target.value);
            setMostrarResultados(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setMostrarResultados(false);
            }
          }}
        />
      </div>

      {mostrarResultados && (
        <div className="pfp-results">
          {clientsLoading && (
            <div className="pfp-result pfp-muted" role="status">
              Carregando pacientes...
            </div>
          )}

          {!clientsLoading && clientsError && (
            <div className="pfp-result" role="alert">
              Não foi possível carregar os pacientes.
            </div>
          )}

          {!clientsLoading &&
            !clientsError &&
            pacientesFiltrados.length === 0 && (
              <div className="pfp-result pfp-muted">
                Nenhum paciente encontrado.
              </div>
            )}

          {!clientsLoading &&
            !clientsError &&
            pacientesFiltrados.map((item) => {
              const iniciais = (item.nome || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((parte) => parte[0].toUpperCase())
                .join("");

              return (
                <button
                  key={item.id}
                  type="button"
                  className="pfp-result"
                  onClick={() => selecionarPaciente(item)}
                >
                  <span className="pfp-result-photo">
                    {item.fotoPerfilUrl ? (
                      <img
                        src={item.fotoPerfilUrl}
                        alt=""
                      />
                    ) : (
                      iniciais || <Icon name="user" />
                    )}
                  </span>

                  <span style={{ flex: 1 }}>
                    <strong>{item.nome}</strong>
                    <small>{item.telefone || "Sem telefone"}</small>
                  </span>

                  <Icon name="chevron" size={17} />
                </button>
              );
            })}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`pf-page pf-record-page pfp ${
        tema === "dark" ? "dark" : ""
      }`}
    >
      <style>{premiumCSS}</style>

      {/* CABEÇALHO PREMIUM */}
      <header className="pfp-header">
        <div className="pfp-title">
          <div className="pfp-title-icon">
            <Icon name="clipboard" size={27} />
          </div>

          <div>
            <h1>Prontuário clínico</h1>
            <p className="pfp-subtitle">
              ProFlex Premium · Gestão clínica
            </p>
          </div>
        </div>

        <button
          type="button"
          className="pfp-theme"
          onClick={() =>
            setTema((atual) =>
              atual === "light" ? "dark" : "light"
            )
          }
          title="Alternar tema claro e escuro"
        >
          <Icon name={tema === "light" ? "moon" : "sun"} size={18} />
          {tema === "light" ? "Dark" : "Light"}
        </button>
      </header>

      {/* BUSCA PERMANENTE DE PACIENTES */}
      {buscarPaciente}

      {!paciente ? (
        <section className="pfp-panel">
          <h2 className="pfp-section-title">
            Selecione um paciente
          </h2>

          <p className="pfp-section-subtitle">
            Utilize a busca acima para localizar um paciente
            e acessar seu prontuário clínico.
          </p>

          <div
            style={{
              padding: "45px 20px",
              textAlign: "center",
              color: "var(--pf-muted)",
            }}
          >
            <Icon name="user" size={45} />

            <p style={{ marginTop: 15 }}>
              Nenhum paciente selecionado.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* IDENTIFICAÇÃO DO PACIENTE */}
          <section className="pfp-patient">
            <div className="pfp-profile">
              <div className="pfp-photo">
                {paciente.fotoPerfilUrl ? (
                  <img
                    src={paciente.fotoPerfilUrl}
                    alt={`Foto de ${paciente.nome}`}
                  />
                ) : (
                  <Icon name="user" size={39} />
                )}
              </div>

              <div>
                <h2>{paciente.nome}</h2>

                <p>
                  {paciente.telefone || "Sem telefone"}
                  {paciente.email
                    ? ` · ${paciente.email}`
                    : ""}
                </p>

                <label className="pfp-photo-edit">
                  <Icon name="camera" size={15} />

                  {salvandoFoto
                    ? "Salvando foto..."
                    : "Adicionar / trocar foto"}

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={atualizarFoto}
                    disabled={salvandoFoto}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="pfp-actions">
              <button
                type="button"
                className="pfp-primary"
                onClick={() =>
                  navigate(
                    `/agendar?clienteId=${paciente.id}&tipo=completo&origem=prontuario`
                  )
                }
              >
                <Icon name="clipboard" size={18} />
                Avaliação inicial
              </button>

              <button
                type="button"
                className="pfp-secondary"
                onClick={() =>
                  navigate(`/consulta?clienteId=${paciente.id}`)
                }
              >
                <Icon name="plus" size={19} />
                Nova consulta
              </button>
            </div>
          </section>

          {/* MENU LATERAL E CONTEÚDO */}
          <div className="pfp-layout">
            <nav
              className="pfp-sidebar"
              aria-label="Seções do prontuário"
            >
              <div className="pfp-sidebar-label">
                Menu clínico
              </div>

              {MENU.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`pfp-menu-button ${
                    aba === item.key ? "active" : ""
                  }`}
                  onClick={() => selecionarAba(item.key)}
                  aria-current={
                    aba === item.key ? "page" : undefined
                  }
                >
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <main className="pfp-main">
              {/* RESUMO */}
              {aba === "resumo" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Resumo clínico
                  </h2>

                  <p className="pfp-section-subtitle">
                    Informações gerais e histórico do paciente.
                  </p>

                  <div className="pfp-grid">
                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        <Icon name="phone" size={17} />
                        Telefone
                      </div>

                      <div className="pfp-stat-value">
                        {paciente.telefone || "Não informado"}
                      </div>
                    </div>

                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        <Icon name="mail" size={17} />
                        E-mail
                      </div>

                      <div className="pfp-stat-value">
                        {paciente.email || "Não informado"}
                      </div>
                    </div>

                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        <Icon name="calendar" size={17} />
                        Consultas registradas
                      </div>

                      <div className="pfp-count">
                        {consultas.length}
                      </div>
                    </div>

                    <div className="pfp-stat pfp-span-3">
                      <div className="pfp-stat-label">
                        <Icon name="pin" size={17} />
                        Endereço
                      </div>

                      <div className="pfp-stat-value">
                        {paciente.endereco || "Não informado"}
                      </div>
                    </div>
                  </div>

                  <div className="pfp-divider" />

                  <div className="pfp-grid">
                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        Avaliações e atendimentos
                      </div>

                      <div className="pfp-count">
                        {consultas.length}
                      </div>
                    </div>

                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        Fotos clínicas
                      </div>

                      <div className="pfp-count">
                        {fotosClinicas.length}
                      </div>
                    </div>

                    <div className="pfp-stat">
                      <div className="pfp-stat-label">
                        Evoluções registradas
                      </div>

                      <div className="pfp-count">
                        {
                          consultas.filter((consulta) =>
                            consulta.evolucao?.trim()
                          ).length
                        }
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <button
                      type="button"
                      className="pfp-secondary"
                      onClick={gerarProntuarioPDF}
                    >
                      <Icon name="file" size={17} />
                      Visualizar prontuário em PDF
                    </button>
                  </div>
                </section>
              )}

              {/* AVALIAÇÃO */}
              {aba === "clinico" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Avaliação clínica
                  </h2>

                  <p className="pfp-section-subtitle">
                    Dados e condições clínicas registrados
                    para este paciente.
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <button
                      type="button"
                      className="pfp-primary"
                      onClick={() =>
                        navigate(
                          `/agendar?clienteId=${paciente.id}&tipo=completo&origem=prontuario`
                        )
                      }
                    >
                      <Icon name="clipboard" size={18} />
                      Abrir avaliação inicial
                    </button>
                  </div>

                  <div className="pfp-grid">
                    {[
                      ["Nascimento", paciente.nascimento],
                      [
                        "Peso",
                        paciente.peso
                          ? `${paciente.peso} kg`
                          : "",
                      ],
                      [
                        "Altura",
                        paciente.altura
                          ? `${paciente.altura} cm`
                          : "",
                      ],
                      ["Gênero", paciente.genero],
                    ].map(([titulo, valor]) => (
                      <div className="pfp-stat" key={titulo}>
                        <div className="pfp-stat-label">
                          {titulo}
                        </div>

                        <div className="pfp-stat-value">
                          {valor || "Não informado"}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pfp-divider" />

                  {[
                    ["Comorbidades", paciente.comorbidades],
                    [
                      "Condições musculoesqueléticas",
                      paciente.doencasExtras,
                    ],
                    [
                      "Condições neurológicas",
                      paciente.doencasNeurologicas,
                    ],
                  ].map(([titulo, valores]) => (
                    <div
                      className="pfp-record"
                      key={titulo}
                    >
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {titulo}
                      </h3>

                      {Array.isArray(valores) &&
                      valores.length ? (
                        <div>
                          {valores.map((valor) => (
                            <span
                              className="pfp-chip"
                              key={valor}
                            >
                              {valor}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="pfp-muted">
                          Nenhuma registrada.
                        </p>
                      )}

                      {titulo ===
                        "Condições neurológicas" &&
                        paciente.sindromeDescricao && (
                          <p>
                            <strong>Síndrome:</strong>{" "}
                            {paciente.sindromeDescricao}
                          </p>
                        )}
                    </div>
                  ))}

                  <div className="pfp-record">
                    <h3 style={{ fontSize: 15 }}>
                      Medicamentos
                    </h3>

                    <p>
                      {paciente.remedios ||
                        "Nenhum registrado."}
                    </p>
                  </div>

                  <div className="pfp-record">
                    <h3 style={{ fontSize: 15 }}>
                      Outros diagnósticos
                    </h3>

                    <p>
                      {paciente.outrosDiagnosticos ||
                        "Nenhum diagnóstico adicional registrado."}
                    </p>
                  </div>

                  {paciente.anotacoesPaciente && (
                    <div className="pfp-record">
                      <h3 style={{ fontSize: 15 }}>
                        Histórico geral
                      </h3>

                      <p>{paciente.anotacoesPaciente}</p>
                    </div>
                  )}
                </section>
              )}

              {/* CONSULTAS */}
              {aba === "consultas" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Histórico de consultas
                  </h2>

                  <p className="pfp-section-subtitle">
                    Consulte os atendimentos realizados.
                  </p>

                  {!consultas.length ? (
                    <p className="pfp-muted">
                      Nenhuma consulta registrada.
                    </p>
                  ) : (
                    [...consultas]
                      .reverse()
                      .map((consulta, index) => (
                        <button
                          key={consulta.id || index}
                          type="button"
                          className="pfp-record pfp-record-button"
                          onClick={() =>
                            setConsultaSelecionada(consulta)
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div>
                              <strong>
                                Consulta{" "}
                                {consulta.numero ||
                                  consultas.length - index}
                              </strong>

                              <div
                                className="pfp-muted"
                                style={{
                                  fontSize: 12,
                                  marginTop: 5,
                                }}
                              >
                                {consulta.dataISO || "-"}{" "}
                                {consulta.hora || ""}
                              </div>
                            </div>

                            <span
                              style={{
                                color: "var(--pf-turquoise)",
                                fontSize: 13,
                              }}
                            >
                              Visualizar →
                            </span>
                          </div>
                        </button>
                      ))
                  )}
                </section>
              )}

              {/* EVOLUÇÃO */}
              {aba === "evolucao" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Evolução clínica
                  </h2>

                  <p className="pfp-section-subtitle">
                    Histórico da evolução registrada
                    nas consultas do paciente.
                  </p>

                  {!consultas.some((consulta) =>
                    consulta.evolucao?.trim()
                  ) ? (
                    <p className="pfp-muted">
                      Nenhuma evolução clínica registrada.
                    </p>
                  ) : (
                    [...consultas]
                      .reverse()
                      .map((consulta, index) =>
                        consulta.evolucao?.trim() ? (
                          <div
                            className="pfp-record"
                            key={consulta.id || index}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                gap: 12,
                                marginBottom: 10,
                              }}
                            >
                              <strong>
                                Consulta{" "}
                                {consulta.numero ||
                                  consultas.length - index}
                              </strong>

                              <small className="pfp-muted">
                                {consulta.dataISO || "-"}{" "}
                                {consulta.hora || ""}
                              </small>
                            </div>

                            <p style={{ marginBottom: 0 }}>
                              {consulta.evolucao}
                            </p>
                          </div>
                        ) : null
                      )
                  )}
                </section>
              )}

              {/* FOTOS */}
              {aba === "fotos" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Fotos clínicas
                  </h2>

                  <p className="pfp-section-subtitle">
                    Fotografias vinculadas aos atendimentos
                    deste paciente.
                  </p>

                  {!fotosClinicas.length ? (
                    <p className="pfp-muted">
                      Nenhuma fotografia clínica registrada.
                    </p>
                  ) : (
                    <div className="pfp-photo-grid">
                      {fotosClinicas.map((foto) => (
                        <div
                          className="pfp-record"
                          key={foto.id}
                          style={{ marginBottom: 0 }}
                        >
                          {foto.url ? (
                            <a
                              href={foto.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                className="pfp-clinical-photo"
                                src={foto.url}
                                alt={`Foto da consulta ${foto.consulta}`}
                              />
                            </a>
                          ) : (
                            <p className="pfp-muted">
                              Foto sem endereço disponível.
                            </p>
                          )}

                          <div
                            className="pfp-muted"
                            style={{
                              fontSize: 12,
                              marginTop: 10,
                            }}
                          >
                            Consulta {foto.consulta}
                            <br />
                            {foto.data}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* DOCUMENTOS */}
              {aba === "documentos" && (
                <section className="pfp-panel">
                  <h2 className="pfp-section-title">
                    Documentos do paciente
                  </h2>

                  <p className="pfp-section-subtitle">
                    Consulte e gere documentos
                    relacionados ao atendimento.
                  </p>

                  <div className="pfp-document-grid">
                    <div className="pfp-document">
                      <Icon name="file" size={25} />

                      <h3>Relatório clínico</h3>

                      <p>
                        Resumo da avaliação e da
                        evolução do paciente.
                      </p>

                      <button
                        type="button"
                        onClick={gerarRelatorioClinicoPDF}
                      >
                        Gerar relatório
                      </button>
                    </div>

                    <div className="pfp-document">
                      <Icon name="clipboard" size={25} />

                      <h3>Atestado</h3>

                      <p>
                        Documento referente ao
                        atendimento realizado.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setMostrarAtestado(true)
                        }
                      >
                        Gerar atestado
                      </button>
                    </div>

                    <div className="pfp-document">
                      <Icon name="file" size={25} />

                      <h3>Receita</h3>

                      <p>
                        Espaço para documentos de
                        prescrição autorizados.
                      </p>

                      <button
                        type="button"
                        onClick={gerarReceitaPDF}
                      >
                        Gerar receita
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>

          {/* MODAL DE CONSULTA */}
          {consultaSelecionada && (
            <div
              className="pfp-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes da consulta"
              onClick={() =>
                setConsultaSelecionada(null)
              }
            >
              <div
                className="pfp-modal-box"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <h3>
                  Consulta{" "}
                  {consultaSelecionada.numero || ""}
                </h3>

                <p className="pfp-muted">
                  {consultaSelecionada.dataISO || "-"}{" "}
                  {consultaSelecionada.hora || ""}
                </p>

                {[
                  [
                    "Queixa principal",
                    consultaSelecionada.queixa,
                  ],
                  [
                    "Avaliação",
                    consultaSelecionada.avaliacao,
                  ],
                  [
                    "Procedimentos realizados",
                    consultaSelecionada.procedimentos,
                  ],
                  [
                    "Evolução",
                    consultaSelecionada.evolucao,
                  ],
                  [
                    "Conduta / Plano",
                    consultaSelecionada.conduta,
                  ],
                ].map(([titulo, valor]) => (
                  <div key={titulo}>
                    <h4>{titulo}</h4>
                    <p>
                      {valor || "Não informado"}
                    </p>
                  </div>
                ))}

                <div className="pfp-modal-actions">
                  <button
                    type="button"
                    className="pfp-secondary"
                    onClick={() =>
                      gerarConsultaPDF(consultaSelecionada)
                    }
                  >
                    Imprimir consulta
                  </button>

                  <button
                    type="button"
                    className="pfp-primary"
                    onClick={() =>
                      setConsultaSelecionada(null)
                    }
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DO ATESTADO */}
          {mostrarAtestado && (
            <div
              className="pfp-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Novo atestado"
              onClick={() =>
                setMostrarAtestado(false)
              }
            >
              <div
                className="pfp-modal-box"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <h3>Novo atestado</h3>

                <p className="pfp-muted">
                  Paciente: {paciente.nome}
                </p>

                <label htmlFor="pfp-data-atestado">
                  Data do atendimento
                </label>

                <input
                  id="pfp-data-atestado"
                  type="date"
                  value={dataAtestado}
                  onChange={(event) =>
                    setDataAtestado(event.target.value)
                  }
                />

                <label htmlFor="pfp-tipo-atestado">
                  Tipo de documento
                </label>

                <select
                  id="pfp-tipo-atestado"
                  value={tipoAtestado}
                  onChange={(event) =>
                    setTipoAtestado(event.target.value)
                  }
                >
                  <option value="comparecimento">
                    Declaração de comparecimento
                  </option>

                  <option value="afastamento">
                    Atestado de afastamento
                  </option>
                </select>

                <label htmlFor="pfp-observacoes-atestado">
                  Observações
                </label>

                <textarea
                  id="pfp-observacoes-atestado"
                  rows={3}
                  placeholder="Informações que serão incluídas no documento..."
                  value={observacoesAtestado}
                  onChange={(event) =>
                    setObservacoesAtestado(
                      event.target.value
                    )
                  }
                />

                <div className="pfp-modal-actions">
                  <button
                    type="button"
                    className="pfp-secondary"
                    onClick={() =>
                      setMostrarAtestado(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="pfp-primary"
                    disabled={!dataAtestado}
                    onClick={gerarAtestadoPDF}
                  >
                    Gerar PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}