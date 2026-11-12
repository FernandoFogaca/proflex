import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Cake,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  HeartPulse,
  Mail,
  Megaphone,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  UserRound,
  UserRoundCheck,
  X,
  ChartNoAxesCombined,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ======================================================
// PROFLEX DESIGN SYSTEM
// ======================================================

const COLORS = {
  primary: "#0F766E",
  primaryDark: "#115E59",
  primaryLight: "#ECFDF5",
  navy: "#142D3A",
  text: "#253746",
  muted: "#718096",
  border: "#E5EDF1",
  background: "#F6F9FB",
  white: "#FFFFFF",
  blue: "#2563EB",
  amber: "#B45309",
  pink: "#BE185D",
  red: "#B91C1C",
};

const STATUS_COLORS = {
  Agendadas: "#6366F1",
  Confirmadas: "#0F766E",
  Concluídas: "#38BDF8",
  Canceladas: "#94A3B8",
  Outros: "#F59E0B",
};

const DEFAULT_MESSAGE =
  "Olá! Preparamos uma condição especial para novos agendamentos neste mês. " +
  "Se tiver interesse em conhecer nossa oferta, entre em contato conosco. " +
  "Caso prefira não receber novas comunicações promocionais, basta nos informar.";

const formatDateKey = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

function parseDate(value) {
  if (!value) return null;

  const text = String(value).trim();
  let year;
  let month;
  let day;

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    year = Number(text.slice(0, 4));
    month = Number(text.slice(5, 7));
    day = Number(text.slice(8, 10));
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    day = Number(text.slice(0, 2));
    month = Number(text.slice(3, 5));
    year = Number(text.slice(6, 10));
  } else {
    return null;
  }

  const result = new Date(year, month - 1, day);

  if (
    result.getFullYear() !== year ||
    result.getMonth() !== month - 1 ||
    result.getDate() !== day
  ) {
    return null;
  }

  return result;
}

function daysBetween(start, end) {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());

  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  return Math.floor((b - a) / 86400000);
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function getSituation(client) {
  return normalize(
    client.situacaoCadastro ||
      client.situacao ||
      client.statusCadastro ||
      client.statusPaciente ||
      "",
  );
}

function isBlocked(client) {
  const blocked = [
    "falecido",
    "falecida",
    "obito",
    "hospitalizado",
    "hospitalizada",
    "internado",
    "internada",
    "nao_contactar",
    "nao_contatar",
    "bloqueado",
    "bloqueada",
    "tratamento_encerrado",
  ];

  return (
    client.falecido === true ||
    client.hospitalizado === true ||
    client.naoContactar === true ||
    client.naoContatar === true ||
    client.bloquearContato === true ||
    blocked.includes(getSituation(client))
  );
}

function getLastAttendance(client) {
  const records = Array.isArray(client.consultas) ? client.consultas : [];

  const dates = records
    .map((record) => parseDate(record.dataISO || record.data))
    .filter(Boolean)
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] || null;
}

function getConsent(client, channel) {
  if (channel === "email") {
    return client.consentimentoEmailMarketing === true;
  }

  if (channel === "whatsapp") {
    return client.consentimentoWhatsappMarketing === true;
  }

  return false;
}

function getEmail(client) {
  return String(client.email || "").trim();
}

function getPhone(client) {
  return String(client.whatsapp || client.telefone || "").trim();
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : "—";
}

function formatDateBR(value) {
  const date = parseDate(value);

  return date ? date.toLocaleDateString("pt-BR") : String(value || "—");
}

function sortByTime(items) {
  return [...items].sort((a, b) =>
    String(a.hora || "").localeCompare(String(b.hora || "")),
  );
}

// ======================================================
// PREMIUM METRIC CARD
// ======================================================

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
  iconBackground,
  onClick,
  active,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pf-metric ${active ? "pf-metric-active" : ""}`}
      style={{ "--pf-accent": accent }}
      aria-expanded={active || undefined}
    >
      <div className="pf-metric-top">
        <div className="pf-metric-icon" style={{ background: iconBackground }}>
          <Icon size={23} strokeWidth={1.8} color={accent} />
        </div>

        <ArrowUpRight size={18} strokeWidth={1.8} color="#94A3B8" />
      </div>

      <div className="pf-metric-value">{value}</div>
      <div className="pf-metric-title">{title}</div>
      <div className="pf-metric-description">{description}</div>
    </button>
  );
}

function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="pf-section-heading">
      <div className="pf-section-heading-main">
        <div className="pf-section-icon">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <div>
          <h5 className="pf-section-title">{title}</h5>
          {subtitle && <p className="pf-section-subtitle">{subtitle}</p>}
        </div>
      </div>

      {action}
    </div>
  );
}

function TimeRow({ time, title, subtitle, icon: Icon = CalendarCheck2 }) {
  return (
    <div className="pf-time-row">
      <div className="pf-time">{time}</div>

      <div className="pf-time-info">
        <div className="pf-time-title">{title}</div>
        <div className="pf-time-subtitle">{subtitle}</div>
      </div>

      <Icon size={17} color="#94A3B8" />
    </div>
  );
}

// ======================================================
// DASHBOARD
// ======================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsOwner(false);

      if (!user || !user.emailVerified) return;

      try {
        const snapshot = await getDoc(doc(db, "usuarios", user.uid));
        const data = snapshot.data();

        if (active && auth.currentUser?.uid === user.uid) {
          setIsOwner(
            snapshot.exists() &&
              data.uid === user.uid &&
              data.email === user.email,
          );
        }
      } catch (error) {
        console.error("Erro ao verificar proprietário:", error);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  const { clients = [], appointments = [] } = useApp();

  const [chartView, setChartView] = useState("days");
  const [activePanel, setActivePanel] = useState(null);

  const [campaignOpen, setCampaignOpen] = useState(false);
  const [inactiveDays, setInactiveDays] = useState(90);
  const [recipientLimit, setRecipientLimit] = useState(10);
  const [channel, setChannel] = useState("email");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmSend, setConfirmSend] = useState(false);

  const now = new Date();
  const today = formatDateKey(now);

  // ====================================================
  // APPOINTMENTS
  // ====================================================

  const consultations = appointments.filter(
    (item) => item.tipo !== "pessoal" && item.tipo !== "compromisso",
  );

  const todayConsultations = sortByTime(
    consultations.filter(
      (item) => item.data === today && normalize(item.status) !== "cancelado",
    ),
  );

  const personalToday = sortByTime(
    appointments.filter(
      (item) =>
        ["pessoal", "compromisso"].includes(item.tipo) &&
        item.data === today &&
        normalize(item.status) !== "cancelado",
    ),
  );

  const upcomingConsultations = consultations
    .filter(
      (item) =>
        typeof item.data === "string" &&
        item.data > today &&
        normalize(item.status) !== "cancelado",
    )
    .sort(
      (a, b) =>
        String(a.data).localeCompare(String(b.data)) ||
        String(a.hora || "").localeCompare(String(b.hora || "")),
    )
    .slice(0, 5);

  const birthdays = clients.filter((client) => {
    const birth = parseDate(client.nascimento);

    if (!birth || isBlocked(client)) return false;

    return (
      birth.getDate() === now.getDate() && birth.getMonth() === now.getMonth()
    );
  });

  const getPatientName = (appointment) => {
    const direct =
      appointment.nomePaciente ||
      appointment.pacienteNome ||
      appointment.nome ||
      appointment.paciente;

    if (typeof direct === "string" && direct.trim()) {
      return direct;
    }

    const clientId =
      appointment.clienteId || appointment.clientId || appointment.pacienteId;

    const client = clients.find((item) => String(item.id) === String(clientId));

    return client?.nome || "Paciente não identificado";
  };

  const getCommitmentTitle = (item) =>
    item.titulo ||
    item.descricao ||
    item.nome ||
    item.observacoes ||
    "Compromisso pessoal";

  // ====================================================
  // CAMPAIGN ELIGIBILITY
  // ====================================================

  const candidates = useMemo(() => {
    return clients
      .map((client) => {
        const lastAttendance = getLastAttendance(client);

        return {
          ...client,
          lastAttendance,
          daysInactive: lastAttendance
            ? daysBetween(lastAttendance, now)
            : null,
        };
      })
      .filter(
        (client) =>
          client.daysInactive !== null && client.daysInactive >= inactiveDays,
      )
      .sort((a, b) => b.daysInactive - a.daysInactive);
  }, [clients, inactiveDays, today]);

  function eligibility(client) {
    if (isBlocked(client)) {
      return {
        allowed: false,
        label: "Contato bloqueado",
      };
    }

    if (getSituation(client) !== "ativo") {
      return {
        allowed: false,
        label: "Situação do cadastro não confirmada",
      };
    }

    if (
      (channel === "email" || channel === "both") &&
      (!getEmail(client) || !getConsent(client, "email"))
    ) {
      return {
        allowed: false,
        label: "E-mail ou autorização ausente",
      };
    }

    if (
      (channel === "whatsapp" || channel === "both") &&
      (!getPhone(client) || !getConsent(client, "whatsapp"))
    ) {
      return {
        allowed: false,
        label: "WhatsApp ou autorização ausente",
      };
    }

    return {
      allowed: true,
      label: "Apto para revisão",
    };
  }

  const eligibleCandidates = candidates.filter(
    (client) => eligibility(client).allowed,
  );

  const filteredCandidates = candidates.filter((client) =>
    String(client.nome || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const selectedRecipients = candidates.filter(
    (client) =>
      selectedIds.includes(String(client.id)) &&
      reviewedIds.includes(String(client.id)) &&
      eligibility(client).allowed,
  );

  function resetSelection() {
    setSelectedIds([]);
    setReviewedIds([]);
    setFeedback(null);
    setConfirmSend(false);
  }

  function toggleSelected(id) {
    setSelectedIds((previous) => {
      if (previous.includes(id)) {
        return previous.filter((item) => item !== id);
      }

      if (previous.length >= recipientLimit) {
        return previous;
      }

      return [...previous, id];
    });

    setConfirmSend(false);
  }

  function toggleReviewed(id) {
    setReviewedIds((previous) => {
      if (previous.includes(id)) {
        setSelectedIds((selected) => selected.filter((item) => item !== id));

        return previous.filter((item) => item !== id);
      }

      return [...previous, id];
    });

    setConfirmSend(false);
  }

  // ====================================================
  // CAMPAIGN SENDING
  // ====================================================

  async function sendCampaign() {
    if (sending) return;

    // Revalidate against the current patient data.
    const recipients = selectedRecipients.filter(
      (client) => eligibility(client).allowed,
    );

    if (
      recipients.length === 0 ||
      recipients.length > recipientLimit ||
      !message.trim() ||
      !confirmSend
    ) {
      setFeedback({
        type: "error",
        text: "Revise os destinatários, a mensagem e a confirmação de envio.",
      });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/campaigns/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          channel,
          message: message.trim(),
          recipientIds: recipients.map((client) => client.id),
          inactiveDays,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serviço de envio indisponível (${response.status}).`);
      }

      const result = await response.json();

      if (result.success !== true) {
        throw new Error(result.message || "O serviço não confirmou o envio.");
      }

      setFeedback({
        type: "success",
        text:
          result.message ||
          "Campanha processada. Consulte o histórico de envio para verificar os resultados.",
      });

      resetSelection();
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Não foi possível enviar a campanha.",
      });
    } finally {
      setSending(false);
    }
  }

  // ====================================================
  // CHART DATA
  // ====================================================

  const validAppointments = consultations.filter(
    (item) =>
      normalize(item.status) !== "cancelado" &&
      typeof item.data === "string" &&
      typeof item.hora === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(item.data) &&
      /^\d{2}:\d{2}/.test(item.hora),
  );

  const weekdayData = [
    { day: "Dom", total: 0 },
    { day: "Seg", total: 0 },
    { day: "Ter", total: 0 },
    { day: "Qua", total: 0 },
    { day: "Qui", total: 0 },
    { day: "Sex", total: 0 },
    { day: "Sáb", total: 0 },
  ];

  validAppointments.forEach((item) => {
    const date = parseDate(item.data);

    if (date) {
      weekdayData[date.getDay()].total += 1;
    }
  });

  const hourlyData = [];

  validAppointments.forEach((item) => {
    const hour = item.hora.slice(0, 2) + "h";
    const existing = hourlyData.find((entry) => entry.hour === hour);

    if (existing) {
      existing.total += 1;
    } else {
      hourlyData.push({ hour, total: 1 });
    }
  });

  hourlyData.sort((a, b) => a.hour.localeCompare(b.hour));

  const statusData = [
    {
      name: "Agendadas",
      value: consultations.filter(
        (item) => !item.status || normalize(item.status) === "agendado",
      ).length,
    },
    {
      name: "Confirmadas",
      value: consultations.filter(
        (item) => normalize(item.status) === "confirmado",
      ).length,
    },
    {
      name: "Concluídas",
      value: consultations.filter(
        (item) => normalize(item.status) === "concluido",
      ).length,
    },
    {
      name: "Canceladas",
      value: consultations.filter(
        (item) => normalize(item.status) === "cancelado",
      ).length,
    },
    {
      name: "Outros",
      value: consultations.filter(
        (item) =>
          item.status &&
          !["agendado", "confirmado", "concluido", "cancelado"].includes(
            normalize(item.status),
          ),
      ).length,
    },
  ];

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0);

  const completedConsultations = clients.flatMap(
    (client) => client.consultas || [],
  );

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    const key = `${year}-${month}`;

    return {
      month: date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      total: completedConsultations.filter(
        (consultation) =>
          typeof consultation.dataISO === "string" &&
          consultation.dataISO.startsWith(key),
      ).length,
    };
  });

  const activityData = chartView === "days" ? weekdayData : hourlyData;

  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <div className="pf-dashboard">
      <style>
        {`
          .pf-dashboard {
            --pf-primary: #0F766E;
            --pf-border: #E5EDF1;
            --pf-text: #253746;
            --pf-muted: #718096;
            max-width: 1480px;
            margin: 0 auto;
            padding: 30px 20px 50px;
            color: var(--pf-text);
          }

          .pf-dashboard * {
            box-sizing: border-box;
          }

          .pf-hero {
            background: linear-gradient(
              115deg,
              #102E3B 0%,
              #164D55 55%,
              #0F766E 100%
            );
            border-radius: 22px;
            padding: 30px 34px;
            color: white;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
          }

          .pf-hero::after {
            content: "";
            position: absolute;
            width: 240px;
            height: 240px;
            border-radius: 50%;
            background: rgba(255,255,255,0.035);
            right: -60px;
            top: -130px;
            pointer-events: none;
          }

          .pf-hero-eyebrow {
            font-size: 11px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: 700;
            color: #99F6E4;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .pf-hero-title {
            font-size: clamp(25px, 3vw, 34px);
            font-weight: 750;
            letter-spacing: -1px;
            margin: 0 0 8px;
            color: #fff;
          }

          .pf-hero-subtitle {
            color: #C6DEE1;
            font-size: 14px;
            margin: 0;
          }

          .pf-hero-date {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.08);
            border-radius: 11px;
            font-size: 13px;
            color: #E0F2F1;
          }

          .pf-metric {
            display: block;
            width: 100%;
            height: 100%;
            border: 1px solid var(--pf-border);
            background: white;
            border-radius: 18px;
            padding: 22px;
            text-align: left;
            cursor: pointer;
            box-shadow: 0 5px 25px rgba(20,45,58,0.04);
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              border-color 0.2s ease;
          }

          .pf-metric:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(20,45,58,0.09);
            border-color: var(--pf-accent);
          }

          .pf-metric-active {
            border-color: var(--pf-accent);
            box-shadow: 0 8px 28px rgba(20,45,58,0.08);
          }

          .pf-metric:focus-visible,
          .pf-button:focus-visible,
          .pf-tab:focus-visible {
            outline: 3px solid #5EEAD4;
            outline-offset: 3px;
          }

          .pf-metric-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .pf-metric-icon {
            width: 49px;
            height: 49px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
          }

          .pf-metric-value {
            font-size: 34px;
            font-weight: 780;
            letter-spacing: -1.4px;
            color: #142D3A;
            line-height: 1.1;
          }

          .pf-metric-title {
            font-size: 14px;
            font-weight: 700;
            margin-top: 12px;
          }

          .pf-metric-description {
            font-size: 12px;
            color: var(--pf-muted);
            margin-top: 5px;
          }

          .pf-card {
            background: white;
            border: 1px solid var(--pf-border);
            border-radius: 18px;
            box-shadow: 0 5px 25px rgba(20,45,58,0.04);
            padding: 25px;
            height: 100%;
          }

          .pf-section-heading {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
          }

          .pf-section-heading-main {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .pf-section-icon {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            background: #ECFDF5;
            color: #0F766E;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .pf-section-title {
            font-size: 16px;
            font-weight: 750;
            color: #142D3A;
            margin: 2px 0 5px;
          }

          .pf-section-subtitle {
            font-size: 12px;
            color: var(--pf-muted);
            margin: 0;
          }

          .pf-time-row {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 14px 0;
            border-bottom: 1px solid #EDF2F5;
          }

          .pf-time-row:last-child {
            border-bottom: none;
          }

          .pf-time {
            background: #ECFDF5;
            color: #0F766E;
            font-size: 13px;
            font-weight: 750;
            padding: 9px 11px;
            border-radius: 9px;
            min-width: 65px;
            text-align: center;
            font-variant-numeric: tabular-nums;
          }

          .pf-time-info {
            flex: 1;
            min-width: 0;
          }

          .pf-time-title {
            font-size: 13px;
            font-weight: 700;
            color: #253746;
          }

          .pf-time-subtitle {
            font-size: 12px;
            color: #718096;
            margin-top: 3px;
          }

          .pf-button {
            border: none;
            border-radius: 10px;
            padding: 11px 17px;
            font-size: 13px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            cursor: pointer;
            transition: opacity 0.2s ease;
          }

          .pf-button:hover:not(:disabled) {
            opacity: 0.88;
          }

          .pf-button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
          }

          .pf-button-primary {
            background: #0F766E;
            color: white;
          }

          .pf-button-light {
            background: #F1F5F9;
            color: #334155;
          }

          .pf-button-outline {
            border: 1px solid #DCE6EA;
            background: white;
            color: #475569;
          }

          .pf-tab {
            border: 1px solid #E2E8F0;
            background: white;
            border-radius: 9px;
            padding: 9px 15px;
            font-size: 12px;
            font-weight: 700;
            color: #64748B;
            cursor: pointer;
          }

          .pf-tab.active {
            background: #0F766E;
            color: white;
            border-color: #0F766E;
          }

          .pf-chart {
            width: 100%;
            height: 250px;
            min-width: 0;
          }

          .pf-legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px 18px;
            margin-top: 16px;
          }

          .pf-legend-item {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 12px;
            color: #64748B;
          }

          .pf-legend-dot {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .pf-campaign-header {
            background: linear-gradient(
              110deg,
              #F0FDFA,
              #FFFFFF 75%
            );
            border-radius: 14px;
            padding: 20px;
            border: 1px solid #CCFBF1;
          }

          .pf-input {
            width: 100%;
            border: 1px solid #DCE6EA;
            background: white;
            border-radius: 10px;
            padding: 11px 13px;
            color: #253746;
            font-size: 13px;
          }

          .pf-input:focus {
            outline: 2px solid #99F6E4;
            border-color: #0F766E;
          }

          .pf-field-label {
            display: block;
            font-size: 12px;
            font-weight: 750;
            color: #334155;
            margin-bottom: 8px;
          }

          .pf-mini-stat {
            border-radius: 12px;
            padding: 18px;
            background: #F8FAFC;
            height: 100%;
          }

          .pf-mini-stat-value {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -1px;
          }

          .pf-mini-stat-label {
            font-size: 12px;
            color: #718096;
            margin-top: 5px;
          }

          .pf-candidate-list {
            border: 1px solid #E5EDF1;
            border-radius: 12px;
            padding: 0 16px;
            max-height: 380px;
            overflow-y: auto;
          }

          .pf-candidate {
            padding: 16px 0;
            border-bottom: 1px solid #EDF2F5;
          }

          .pf-candidate:last-child {
            border-bottom: none;
          }

          .pf-candidate-name {
            font-size: 13px;
            font-weight: 750;
            color: #253746;
          }

          .pf-candidate-detail {
            font-size: 12px;
            color: #718096;
            margin-top: 4px;
          }

          .pf-notice {
            display: flex;
            align-items: flex-start;
            gap: 11px;
            padding: 15px;
            border-radius: 11px;
            font-size: 12px;
            line-height: 1.6;
          }

          .pf-notice-info {
            background: #F0FDFA;
            border: 1px solid #CCFBF1;
            color: #115E59;
          }

          .pf-notice-warning {
            background: #FFFBEB;
            border: 1px solid #FDE68A;
            color: #92400E;
          }

          .pf-notice-error {
            background: #FEF2F2;
            border: 1px solid #FECACA;
            color: #991B1B;
          }

         .pf-empty {
  text-align: center;
  padding: 16px 15px;
  color: #94A3B8;
  font-size: 13px;
}

          .pf-empty svg {
            display: block;
            margin: 0 auto 12px;
          }

          @media (max-width: 768px) {
            .pf-dashboard {
              padding: 16px 12px 35px;
            }

            .pf-hero {
              padding: 24px 20px;
            }

            .pf-card {
              padding: 19px;
            }

            .pf-chart {
              height: 210px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .pf-metric,
            .pf-button {
              transition: none;
            }

            .pf-metric:hover {
              transform: none;
            }
          }
        `}
      </style>

      {/* ============================================= */}
      {/* HERO */}
      {/* ============================================= */}

      <header className="pf-hero">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <div className="pf-hero-eyebrow">
              <Sparkles size={15} />
              ProFlex · Visão geral
            </div>

            <h1 className="pf-hero-title">Seu consultório, sob controle.</h1>

            <p className="pf-hero-subtitle">
              Pacientes, agenda e oportunidades em um só lugar.
            </p>
          </div>
          {isOwner && (
            <button
              type="button"
              className="btn btn-warning fw-semibold"
              onClick={() => navigate("/admin-premium")}
            >
              Central Premium
            </button>
          )}

          <div className="pf-hero-date">
            <CalendarDays size={17} />

            {now.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* ============================================= */}
      {/* METRICS */}
      {/* ============================================= */}

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Pacientes cadastrados"
            value={clients.length}
            description="Abrir lista e cadastrar pacientes"
            icon={UsersRound}
            accent={COLORS.primary}
            iconBackground="#DFF5EE"
            onClick={() => navigate("/clientes")}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Consultas de hoje"
            value={todayConsultations.length}
            description="Ver horários e próximas consultas"
            icon={CalendarCheck2}
            accent={COLORS.blue}
            iconBackground="#E1EDFF"
            active={activePanel === "consultations"}
            onClick={() =>
              setActivePanel((previous) =>
                previous === "consultations" ? null : "consultations",
              )
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Compromissos de hoje"
            value={personalToday.length}
            description="Consultar atividades e horários"
            icon={CalendarClock}
            accent={COLORS.amber}
            iconBackground="#FFF1CF"
            active={activePanel === "commitments"}
            onClick={() =>
              setActivePanel((previous) =>
                previous === "commitments" ? null : "commitments",
              )
            }
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <MetricCard
            title="Aniversariantes de hoje"
            value={birthdays.length}
            description="Ver pacientes aniversariantes"
            icon={Cake}
            accent={COLORS.pink}
            iconBackground="#FCE7F3"
            active={activePanel === "birthdays"}
            onClick={() =>
              setActivePanel((previous) =>
                previous === "birthdays" ? null : "birthdays",
              )
            }
          />
        </div>
      </div>

      {/* ============================================= */}
      {/* QUICK ACCESS PANEL */}
      {/* ============================================= */}

      {activePanel && (
        <div className="pf-card mb-4">
          <SectionHeading
            icon={
              activePanel === "consultations"
                ? CalendarCheck2
                : activePanel === "commitments"
                  ? CalendarClock
                  : Cake
            }
            title={
              activePanel === "consultations"
                ? "Consultas e próximos atendimentos"
                : activePanel === "commitments"
                  ? "Compromissos de hoje"
                  : "Aniversariantes de hoje"
            }
            action={
              <button
                type="button"
                className="pf-button pf-button-light"
                onClick={() => setActivePanel(null)}
                aria-label="Fechar painel"
              >
                <X size={16} />
              </button>
            }
          />

          {activePanel === "consultations" && (
            <>
              <h6 className="fw-bold mb-2">Consultas de hoje</h6>

              {todayConsultations.length ? (
                todayConsultations.map((item) => (
                  <TimeRow
                    key={item.id}
                    time={formatTime(item.hora)}
                    title={getPatientName(item)}
                    subtitle={"Situação: " + (item.status || "agendado")}
                  />
                ))
              ) : (
                <p className="text-muted small">Nenhuma consulta hoje.</p>
              )}

              <div className="mt-4">
                <h6 className="fw-bold mb-2">Próximos atendimentos</h6>

                {upcomingConsultations.length ? (
                  upcomingConsultations.map((item) => (
                    <TimeRow
                      key={item.id}
                      time={formatTime(item.hora)}
                      title={getPatientName(item)}
                      subtitle={formatDateBR(item.data)}
                      icon={CalendarPlus}
                    />
                  ))
                ) : (
                  <p className="text-muted small">
                    Nenhuma consulta futura registrada.
                  </p>
                )}
              </div>
            </>
          )}

          {activePanel === "commitments" &&
            (personalToday.length ? (
              personalToday.map((item) => (
                <TimeRow
                  key={item.id}
                  time={formatTime(item.hora)}
                  title={getCommitmentTitle(item)}
                  subtitle="Compromisso pessoal"
                  icon={Clock3}
                />
              ))
            ) : (
              <p className="text-muted small mb-0">Nenhum compromisso hoje.</p>
            ))}

          {activePanel === "birthdays" &&
            (birthdays.length ? (
              birthdays.map((client) => (
                <TimeRow
                  key={client.id}
                  time="Hoje"
                  title={client.nome}
                  subtitle="Aniversário"
                  icon={Cake}
                />
              ))
            ) : (
              <p className="text-muted small mb-0">Nenhum aniversário hoje.</p>
            ))}
        </div>
      )}

      {/* ============================================= */}
      {/* CHARTS */}
      {/* ============================================= */}

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="pf-card">
            <SectionHeading
              icon={HeartPulse}
              title="Situação dos agendamentos"
              subtitle="Distribuição das consultas por situação"
            />

            {totalStatus > 0 ? (
              <div className="pf-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={83}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {statusData.map((item) => (
                        <Cell key={item.name} fill={STATUS_COLORS[item.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="pf-empty">
                <CalendarDays size={29} />
                Nenhum agendamento registrado.
              </div>
            )}

            <div className="pf-legend">
              {statusData.map((item) => (
                <div key={item.name} className="pf-legend-item">
                  <span
                    className="pf-legend-dot"
                    style={{
                      background: STATUS_COLORS[item.name],
                    }}
                  />
                  {item.name}: <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

       
<div className="col-12 col-lg-6">
  <div className="pf-card">
    <SectionHeading
      icon={ChartNoAxesCombined}
      title="Evolução dos atendimentos"
      subtitle="Consultas registradas nos últimos seis meses"
    />

    {monthlyData.some((item) => item.total > 0) ? (
      <div className="pf-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyData}
            margin={{
              top: 15,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="#EDF2F5"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 12,
                fill: "#718096",
              }}
            />
            <YAxis
              allowDecimals={false}
              tick={{
                fontSize: 12,
                fill: "#718096",
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              name="Consultas registradas"
              stroke={COLORS.primary}
              strokeWidth={3}
              dot={{
                r: 4,
                fill: COLORS.primary,
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <div className="pf-empty">
        <ChartNoAxesCombined size={29} />
        Nenhum atendimento registrado nos últimos seis meses.
      </div>
    )}
  </div>
</div>

      </div>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="pf-card">
            <SectionHeading
              icon={Clock3}
              title="Dias e horários mais movimentados"
              subtitle="Distribuição dos agendamentos por dia da semana ou horário"
            />

            <div className="d-flex gap-2 mb-3">
              <button
                type="button"
                className={`pf-tab ${chartView === "days" ? "active" : ""}`}
                onClick={() => setChartView("days")}
              >
                Por dia
              </button>

              <button
                type="button"
                className={`pf-tab ${chartView === "hours" ? "active" : ""}`}
                onClick={() => setChartView("hours")}
              >
                Por horário
              </button>
            </div>

            {validAppointments.length ? (
              <div className="pf-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid stroke="#EDF2F5" strokeDasharray="3 3" />
                    <XAxis
                      dataKey={chartView === "days" ? "day" : "hour"}
                      tick={{
                        fontSize: 12,
                        fill: "#718096",
                      }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      name="Consultas"
                      fill={COLORS.primary}
                      radius={[6, 6, 0, 0]}
                      maxBarSize={55}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="pf-empty">
                <Clock3 size={29} />
                Nenhuma consulta com data e horário.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* REACTIVATION CAMPAIGNS */}
      {/* ============================================= */}

      <section className="pf-card">
        <div className="pf-campaign-header">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="pf-section-icon"
                style={{
                  width: 49,
                  height: 49,
                  background: "#D1FAE5",
                }}
              >
                <Megaphone size={23} />
              </div>

              <div>
                <div
                  className="d-flex align-items-center gap-2 mb-1"
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: COLORS.primary,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  <Sparkles size={13} />
                  Relacionamento com pacientes
                </div>

                <h5 className="pf-section-title mb-1">
                  Campanhas de reativação
                </h5>

                <p className="pf-section-subtitle">
                  Recupere oportunidades com uma comunicação personalizada e
                  responsável.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="pf-button pf-button-primary"
              onClick={() => setCampaignOpen((previous) => !previous)}
              aria-expanded={campaignOpen}
            >
              <Megaphone size={17} />

              {campaignOpen ? "Fechar campanha" : "Criar campanha"}

              {campaignOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        <div className="pf-notice pf-notice-info mt-3">
          <ShieldCheck size={19} style={{ flexShrink: 0 }} />

          <div>
            <strong>Comunicação segura</strong>
            <div>
              O ProFlex só permite selecionar pacientes com situação ativa,
              consentimento registrado para o canal escolhido e revisão
              individual concluída. A informação de falecimento ou
              hospitalização precisa estar atualizada no cadastro.
            </div>
          </div>
        </div>

        {campaignOpen && (
          <div className="mt-4">
            {/* CONFIGURATION */}

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="pf-field-label" htmlFor="pf-inactive-days">
                  Sem atendimento há
                </label>

                <select
                  id="pf-inactive-days"
                  className="pf-input"
                  value={inactiveDays}
                  onChange={(event) => {
                    setInactiveDays(Number(event.target.value));
                    resetSelection();
                  }}
                >
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                  <option value={120}>120 dias</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="pf-field-label" htmlFor="pf-recipient-limit">
                  Limite de pacientes
                </label>

                <select
                  id="pf-recipient-limit"
                  className="pf-input"
                  value={recipientLimit}
                  onChange={(event) => {
                    setRecipientLimit(Number(event.target.value));
                    resetSelection();
                  }}
                >
                  <option value={5}>5 pacientes</option>
                  <option value={10}>10 pacientes</option>
                  <option value={20}>20 pacientes</option>
                  <option value={50}>50 pacientes</option>
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="pf-field-label" htmlFor="pf-channel">
                  Canal de envio
                </label>

                <select
                  id="pf-channel"
                  className="pf-input"
                  value={channel}
                  onChange={(event) => {
                    setChannel(event.target.value);
                    resetSelection();
                  }}
                >
                  <option value="email">E-mail</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="both">E-mail e WhatsApp</option>
                </select>
              </div>
            </div>

            {/* STATS */}

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className="pf-mini-stat">
                  <div className="pf-mini-stat-value">{candidates.length}</div>
                  <div className="pf-mini-stat-label">
                    Pacientes sem atendimento
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="pf-mini-stat" style={{ background: "#ECFDF5" }}>
                  <div
                    className="pf-mini-stat-value"
                    style={{ color: COLORS.primary }}
                  >
                    {eligibleCandidates.length}
                  </div>
                  <div className="pf-mini-stat-label">Aptos para revisão</div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="pf-mini-stat" style={{ background: "#EFF6FF" }}>
                  <div
                    className="pf-mini-stat-value"
                    style={{ color: COLORS.blue }}
                  >
                    {selectedRecipients.length}
                  </div>
                  <div className="pf-mini-stat-label">
                    Selecionados e revisados
                  </div>
                </div>
              </div>
            </div>

            {/* PATIENT SEARCH */}

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h6 className="fw-bold mb-1">Selecionar destinatários</h6>

                <p className="pf-section-subtitle">
                  Confira individualmente antes de incluir cada paciente.
                </p>
              </div>

              <div style={{ minWidth: 230 }}>
                <div className="position-relative">
                  <Search
                    size={17}
                    color="#94A3B8"
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                    }}
                  />

                  <input
                    type="search"
                    className="pf-input"
                    style={{ paddingLeft: 39 }}
                    placeholder="Pesquisar paciente"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* PATIENT LIST */}

            <div className="pf-candidate-list">
              {filteredCandidates.length ? (
                filteredCandidates.map((client) => {
                  const id = String(client.id);
                  const check = eligibility(client);

                  const reviewed = reviewedIds.includes(id);

                  const selected = selectedIds.includes(id);

                  return (
                    <div className="pf-candidate" key={id}>
                      <div className="d-flex align-items-start gap-3">
                        <div
                          className="pf-section-icon"
                          style={{
                            background: "#F1F5F9",
                            color: "#64748B",
                            width: 40,
                            height: 40,
                          }}
                        >
                          <UserRound size={19} />
                        </div>

                        <div className="flex-grow-1">
                          <div className="pf-candidate-name">
                            {client.nome || "Sem nome"}
                          </div>

                          <div className="pf-candidate-detail">
                            Último atendimento:{" "}
                            {client.lastAttendance?.toLocaleDateString(
                              "pt-BR",
                            ) || "Não informado"}
                            {" · "}
                            {client.daysInactive} dias
                          </div>

                          <div
                            className="d-flex align-items-center gap-2 mt-2"
                            style={{
                              fontSize: 12,
                              color: check.allowed
                                ? COLORS.primary
                                : COLORS.amber,
                            }}
                          >
                            {check.allowed ? (
                              <BadgeCheck size={15} />
                            ) : (
                              <CircleAlert size={15} />
                            )}

                            {check.label}
                          </div>

                          {check.allowed && (
                            <label
                              className="d-flex align-items-start gap-2 mt-3"
                              style={{
                                fontSize: 12,
                                cursor: "pointer",
                                color: "#475569",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={reviewed}
                                onChange={() => toggleReviewed(id)}
                              />
                              Confirmei que a situação do paciente está
                              atualizada e que o contato é apropriado.
                            </label>
                          )}
                        </div>

                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${client.nome}`}
                          checked={selected}
                          disabled={
                            !check.allowed ||
                            !reviewed ||
                            (!selected && selectedIds.length >= recipientLimit)
                          }
                          onChange={() => toggleSelected(id)}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="pf-empty">
                  <UsersRound size={30} />
                  Nenhum paciente encontrado para esse filtro.
                </div>
              )}
            </div>

            {/* MESSAGE */}

            <div className="mt-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <MessageCircle size={19} color={COLORS.primary} />

                <h6 className="fw-bold mb-0">Mensagem da promoção</h6>
              </div>

              <p className="pf-section-subtitle mb-3">
                Utilize o modelo ou escreva sua própria oferta.
              </p>

              <textarea
                className="pf-input"
                rows={5}
                maxLength={1000}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setConfirmSend(false);
                }}
              />

              <div
                className="text-end mt-1"
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                }}
              >
                {message.length}/1000 caracteres
              </div>
            </div>

            {/* PREVIEW */}

            <div className="mt-3">
              <h6 className="fw-bold mb-3">Resumo da campanha</h6>

              <div
                className="p-3"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E5EDF1",
                  borderRadius: 12,
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <UsersRound size={16} color={COLORS.primary} />

                  <strong style={{ fontSize: 13 }}>
                    {selectedRecipients.length} destinatário(s)
                  </strong>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {channel === "email" ? (
                    <Mail size={16} color={COLORS.blue} />
                  ) : channel === "whatsapp" ? (
                    <MessageCircle size={16} color={COLORS.primary} />
                  ) : (
                    <CheckCheck size={16} color={COLORS.primary} />
                  )}

                  <span
                    style={{
                      fontSize: 13,
                      color: "#64748B",
                    }}
                  >
                    {channel === "email"
                      ? "Envio por e-mail"
                      : channel === "whatsapp"
                        ? "Envio por WhatsApp"
                        : "Envio por e-mail e WhatsApp"}
                  </span>
                </div>
              </div>
            </div>

            {/* SAFETY */}

            <div className="pf-notice pf-notice-warning mt-3">
              <ShieldCheck size={19} style={{ flexShrink: 0 }} />

              <div>
                <strong>Verificação obrigatória</strong>
                <div>
                  Não envie campanhas para pacientes falecidos, hospitalizados,
                  com restrição de contato ou sem consentimento promocional
                  válido. O sistema não descobre automaticamente falecimentos ou
                  internações. A verificação deve ocorrer antes do envio.
                </div>
              </div>
            </div>

            {/* FINAL CONFIRMATION */}

            <label
              className="d-flex align-items-start gap-2 mt-4"
              style={{
                fontSize: 13,
                color: "#334155",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={confirmSend}
                onChange={(event) => setConfirmSend(event.target.checked)}
              />

              <span>
                Confirmo que revisei os destinatários, o conteúdo da campanha e
                as autorizações para os canais selecionados.
              </span>
            </label>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
              <div
                style={{
                  fontSize: 12,
                  color: "#718096",
                }}
              >
                <ShieldCheck size={16} className="me-2" />
                Envio sujeito à integração segura dos canais.
              </div>

              <button
                type="button"
                className="pf-button pf-button-primary"
                disabled={
                  sending ||
                  !confirmSend ||
                  !message.trim() ||
                  selectedRecipients.length === 0
                }
                onClick={sendCampaign}
              >
                <Send size={17} />

                {sending
                  ? "Processando..."
                  : `Enviar para ${selectedRecipients.length} selecionado(s)`}
              </button>
            </div>

            {feedback && (
              <div
                role="status"
                className={`pf-notice mt-3 ${
                  feedback.type === "success"
                    ? "pf-notice-info"
                    : "pf-notice-error"
                }`}
              >
                {feedback.type === "success" ? (
                  <Check size={19} />
                ) : (
                  <CircleAlert size={19} />
                )}

                <span>{feedback.text}</span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
