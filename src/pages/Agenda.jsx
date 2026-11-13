
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  Activity,
  ArrowRight,
  Bell,
  Cake,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Settings2,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function isoDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function shiftDate(value, days) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function minutes(value) {
  const [hour, minute] = String(value || "00:00").split(":").map(Number);
  return hour * 60 + minute;
}

function timeFromMinutes(value) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(
    value % 60
  ).padStart(2, "0")}`;
}

function dateLabel(value) {
  return parseDate(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function weekdayLabel(value) {
  const text = parseDate(value).toLocaleDateString("pt-BR", {
    weekday: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isPast(value, time) {
  const date = parseDate(value);
  const [hour, minute] = String(time).split(":").map(Number);
  date.setHours(hour, minute, 0, 0);
  return date.getTime() < Date.now();
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage indisponível.
  }
}

function normalizeStatus(status) {
  const value = String(status || "agendado").toLowerCase();
  if (["concluído", "realizado"].includes(value)) return "concluido";
  if (value === "cancelada") return "cancelado";
  return value;
}

function isCancelled(item) {
  return normalizeStatus(item.status) === "cancelado";
}

function isCompleted(item) {
  return normalizeStatus(item.status) === "concluido";
}

function whatsappLink(number, message = "") {
  const phone = String(number || "").replace(/\D/g, "");
  return `https://wa.me/${phone}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
}

const STATUS = {
  agendado: {
    label: "Agendado",
    color: "#3b82f6",
    background: "#eff6ff",
  },
  confirmado: {
    label: "Confirmado",
    color: "#059669",
    background: "#ecfdf5",
  },
  concluido: {
    label: "Concluído",
    color: "#0891b2",
    background: "#ecfeff",
  },
  cancelado: {
    label: "Cancelado",
    color: "#64748b",
    background: "#f1f5f9",
  },
  pendente: {
    label: "Pendente",
    color: "#d97706",
    background: "#fffbeb",
  },
};

function statusStyle(status) {
  return STATUS[normalizeStatus(status)] || STATUS.agendado;
}

function useClock() {
  const [clock, setClock] = useState(
    new Date().toLocaleTimeString("pt-BR", { hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(
        new Date().toLocaleTimeString("pt-BR", { hour12: false })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return clock;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia ☀️";
  if (hour < 18) return "Boa tarde 🌤️";
  return "Boa noite 🌙";
}

// =====================================================
// COMPONENTES
// =====================================================

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="pf-overlay" onMouseDown={onClose}>
      <div
        className="pf-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="d-flex justify-content-between gap-3 mb-4">
          <div>
            <h5 className="fw-bold mb-1">{title}</h5>
            {subtitle && (
              <div className="text-muted small">{subtitle}</div>
            )}
          </div>

          <button className="btn btn-light btn-sm" onClick={onClose}>
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, number, label, background, color }) {
  return (
    <div className="pf-metric" style={{ background }}>
      <div className="pf-metric-icon" style={{ color }}>
        <Icon size={21} />
      </div>
      <div>
        <div className="pf-metric-number">{number}</div>
        <div className="pf-metric-label">{label}</div>
      </div>
    </div>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function Agenda() {
  const navigate = useNavigate();
  const app = useApp();
  const tipoPerfil = app.tipoPerfil;


  const clients = app.clients || [];
  const appointments = app.appointments || [];
  const professionals = app.professionals || [];
  const setAppointments = app.setAppointments;

  const clock = useClock();

  const [selectedDate, setSelectedDate] = useState(isoDate());
  const [view, setView] = useState("dia");
  const [professionalFilter, setProfessionalFilter] = useState("todos");

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [slotModal, setSlotModal] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(null);

  const [addTimeModal, setAddTimeModal] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [createAfterTime, setCreateAfterTime] = useState(true);

  const [reminderTime, setReminderTime] = useState("14:00");
  const [reminderText, setReminderText] = useState("");
  const [reminderPhone, setReminderPhone] = useState("");

  const [reminders, setReminders] = useState(() =>
    readStorage("agendaLembretes", [])
  );

  const [extraSlots, setExtraSlots] = useState(() =>
    readStorage("extraSlots", {})
  );

  const [removedSlots, setRemovedSlots] = useState(() =>
    readStorage("removedSlots", {})
  );

  useEffect(() => {
    saveStorage("agendaLembretes", reminders);
  }, [reminders]);

  useEffect(() => {
    saveStorage("extraSlots", extraSlots);
  }, [extraSlots]);

  useEffect(() => {
    saveStorage("removedSlots", removedSlots);
  }, [removedSlots]);

  const activeProfessionals = useMemo(
    () => professionals.filter((person) => person.ativo !== false),
    [professionals]
  );

  const selectedProfessional = professionals.find(
    (person) => String(person.id) === professionalFilter
  );

  function professionalName(item) {
    return (
      item.profissionalNome ||
      professionals.find(
        (person) => String(person.id) === String(item.professionalId)
      )?.nome ||
      "Profissional não informado"
    );
  }

  function matchesProfessional(item) {
    if (professionalFilter === "todos") return true;
    return String(item.professionalId || "") === professionalFilter;
  }

  const filteredAppointments = useMemo(
    () => appointments.filter(matchesProfessional),
    [appointments, professionalFilter]
  );

  const dayAppointments = useMemo(
    () =>
      filteredAppointments
        .filter((item) => item.data === selectedDate)
        .sort((a, b) => minutes(a.hora) - minutes(b.hora)),
    [filteredAppointments, selectedDate]
  );

  const appointmentsByTime = useMemo(() => {
    const result = {};

    dayAppointments.forEach((item) => {
      if (!item.hora) return;
      if (!result[item.hora]) result[item.hora] = [];
      result[item.hora].push(item);
    });

    return result;
  }, [dayAppointments]);

  // Horários base. Quando um profissional está selecionado,
  // utiliza a configuração dele, quando disponível.
  const baseSlots = useMemo(() => {
    const start =
      selectedProfessional?.inicioExpediente ||
      selectedProfessional?.horaInicio ||
      "08:00";

    const end =
      selectedProfessional?.fimExpediente ||
      selectedProfessional?.horaFim ||
      "18:00";

    const duration = Math.max(
      5,
      Number(
        selectedProfessional?.duracaoConsulta ||
        selectedProfessional?.duracaoMin ||
        60
      )
    );

    const result = [];

    for (
      let current = minutes(start);
      current < minutes(end);
      current += duration
    ) {
      result.push(timeFromMinutes(current));
    }

    return result;
  }, [selectedProfessional]);

  const slots = useMemo(() => {
    const removed = new Set(removedSlots[selectedDate] || []);
    const result = new Set();

    baseSlots.forEach((time) => {
      if (!removed.has(time)) result.add(time);
    });

    (extraSlots[selectedDate] || []).forEach((time) => {
      if (!removed.has(time)) result.add(time);
    });

    Object.keys(appointmentsByTime).forEach((time) => result.add(time));

    return [...result].sort((a, b) => minutes(a) - minutes(b));
  }, [
    baseSlots,
    selectedDate,
    extraSlots,
    removedSlots,
    appointmentsByTime,
  ]);

  const metrics = useMemo(() => {
    const active = dayAppointments.filter(
      (item) => !isCancelled(item)
    );

    return {
      total: active.length,
      confirmed: active.filter(
        (item) => normalizeStatus(item.status) === "confirmado"
      ).length,
      completed: active.filter(isCompleted).length,
      available: slots.filter(
        (time) =>
          !(appointmentsByTime[time] || []).some(
            (item) => !isCancelled(item)
          )
      ).length,
    };
  }, [dayAppointments, slots, appointmentsByTime]);

  const monthDays = useMemo(() => {
    const first = parseDate(selectedDate);
    first.setDate(1);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(first);
      date.setDate(date.getDate() + index);
      return isoDate(date);
    });
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const first = parseDate(selectedDate);
    first.setDate(
      first.getDate() - ((first.getDay() + 6) % 7)
    );

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(first);
      date.setDate(date.getDate() + index);
      return isoDate(date);
    });
  }, [selectedDate]);

  const birthdays = useMemo(() => {
    const date = parseDate(selectedDate);

    return clients.filter((client) => {
      if (!client.nascimento) return false;

      const parts = String(client.nascimento).split("-");
      if (parts.length !== 3) return false;

      return (
        Number(parts[1]) === date.getMonth() + 1 &&
        Number(parts[2]) === date.getDate()
      );
    });
  }, [clients, selectedDate]);

  const dayReminders = reminders
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => minutes(a.time) - minutes(b.time));

  // =====================================================
  // BUSCA GLOBAL
  // =====================================================

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return { clients: [], appointments: [] };
    }

    const foundClients = clients
      .filter((client) =>
        [
          client.nome,
          client.telefone,
          client.email,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 6);

    const foundAppointments = appointments
      .filter((item) =>
        [
          item.clienteNome,
          item.hora,
          item.data,
          item.status,
          item.tipo,
          professionalName(item),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 8);

    return {
      clients: foundClients,
      appointments: foundAppointments,
    };
  }, [search, clients, appointments, professionals]);

  // =====================================================
  // NAVEGAÇÃO
  // =====================================================

  function changePeriod(direction) {
    if (view === "semana") {
      setSelectedDate(shiftDate(selectedDate, direction * 7));
      return;
    }

    if (view === "mes") {
      const date = parseDate(selectedDate);
      date.setDate(1);
      date.setMonth(date.getMonth() + direction);
      setSelectedDate(isoDate(date));
      return;
    }

    setSelectedDate(shiftDate(selectedDate, direction));
  }

  function openConsultation(date, time, clientId = null, item = null) {
    const params = new URLSearchParams({
      data: date,
      hora: time,
    });

    if (clientId) {
      params.set("clienteId", String(clientId));
    }

    if (item?.id) {
      params.set("appointmentId", String(item.id));
    }

    const professionalId =
      item?.professionalId ||
      (professionalFilter !== "todos" ? professionalFilter : "");

    if (professionalId) {
      params.set("professionalId", String(professionalId));
    }

    setNewMenuOpen(false);
    setSlotModal(null);
    setAppointmentModal(null);

    navigate(`/agendar?${params.toString()}`);
  }

  function openPersonalAppointment(date, time, item = null) {
    const params = new URLSearchParams({ data: date, hora: time });

    if (item?.id) {
      params.set("appointmentId", String(item.id));
    } else {
      params.set("novo", "1");
    }

    setNewMenuOpen(false);
    setSlotModal(null);
    setAppointmentModal(null);

    navigate(`/compromissos?${params.toString()}`);
  }

  function editAppointment(item) {
    const type = String(item.tipo || "").toLowerCase();

    if (["pessoal", "compromisso"].includes(type)) {
      openPersonalAppointment(item.data, item.hora, item);
    } else {
      openConsultation(
        item.data,
        item.hora,
        item.clienteId,
        item
      );
    }
  }

  function openTimeSlot(time) {
    const active = (appointmentsByTime[time] || []).filter(
      (item) => !isCancelled(item)
    );

    if (active.length === 1) {
      setAppointmentModal(active[0]);
      return;
    }

    if (active.length > 1) {
      setSlotModal({ time, appointments: active });
      return;
    }

    if (!isPast(selectedDate, time)) {
      setSlotModal({ time, appointments: [] });
    }
  }

  function updateStatus(item, status) {
    if (typeof setAppointments !== "function") {
      alert("Não foi possível atualizar o status.");
      return;
    }

    setAppointments((previous) =>
      previous.map((current) =>
        String(current.id) === String(item.id)
          ? { ...current, status }
          : current
      )
    );

    setAppointmentModal(null);
  }

  // =====================================================
  // HORÁRIOS EXTRAS
  // =====================================================

  function addExtraTime() {
    if (!newTime) return;

    setExtraSlots((previous) => ({
      ...previous,
      [selectedDate]: [
        ...new Set([
          ...(previous[selectedDate] || []),
          newTime,
        ]),
      ].sort((a, b) => minutes(a) - minutes(b)),
    }));

    setRemovedSlots((previous) => ({
      ...previous,
      [selectedDate]: (previous[selectedDate] || []).filter(
        (time) => time !== newTime
      ),
    }));

    setAddTimeModal(false);

    if (createAfterTime && !isPast(selectedDate, newTime)) {
      openTimeSlotAfterAdd(newTime);
    }
  }

  function openTimeSlotAfterAdd(time) {
    setSlotModal({ time, appointments: [] });
  }

  function removeTime(time) {
    const occupied = (appointmentsByTime[time] || []).some(
      (item) => !isCancelled(item)
    );

    if (occupied) {
      alert("Não é possível remover um horário com agendamento.");
      return;
    }

    setExtraSlots((previous) => ({
      ...previous,
      [selectedDate]: (previous[selectedDate] || []).filter(
        (value) => value !== time
      ),
    }));

    setRemovedSlots((previous) => ({
      ...previous,
      [selectedDate]: [
        ...new Set([
          ...(previous[selectedDate] || []),
          time,
        ]),
      ],
    }));
  }

  // =====================================================
  // LEMBRETES
  // =====================================================

  function addReminder() {
    if (!reminderText.trim() || !reminderTime) return;

    setReminders((previous) => [
      {
        id: `rem_${Date.now()}`,
        date: selectedDate,
        time: reminderTime,
        msg: reminderText.trim(),
        zap: reminderPhone.trim(),
        concluido: false,
        cancelado: false,
      },
      ...previous,
    ]);

    setReminderText("");
    setReminderPhone("");
  }

  function completeReminder(id) {
    setReminders((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, concluido: !item.concluido }
          : item
      )
    );
  }

  function deleteReminder(id) {
    setReminders((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  // =====================================================
  // CALENDÁRIO
  // =====================================================

  function renderCalendar(days, compact = false) {
    return (
      <div className={`pf-calendar ${compact ? "pf-compact" : ""}`}>
        {days.map((date) => {
          const dateAppointments = filteredAppointments.filter(
            (item) =>
              item.data === date && !isCancelled(item)
          );

          const selected = date === selectedDate;
          const sameMonth =
            date.slice(0, 7) === selectedDate.slice(0, 7);

          return (
            <button
              type="button"
              key={date}
              className={`pf-calendar-day ${
                selected ? "selected" : ""
              } ${!sameMonth ? "outside" : ""}`}
              onClick={() => {
                setSelectedDate(date);
                if (!compact) setView("dia");
              }}
              title={`${dateLabel(date)} · ${dateAppointments.length} agendamentos`}
            >
              <span>{parseDate(date).getDate()}</span>

              {compact ? (
                dateAppointments.length > 0 && (
                  <span className="pf-calendar-dot" />
                )
              ) : (
                <>
                  {dateAppointments.slice(0, 2).map((item) => (
                    <span
                      className="pf-calendar-event"
                      key={item.id}
                      style={{
                        background: statusStyle(item.status).background,
                        color: statusStyle(item.status).color,
                      }}
                    >
                      {item.hora} {item.clienteNome || item.tipo}
                    </span>
                  ))}

                  {dateAppointments.length > 2 && (
                    <small>+{dateAppointments.length - 2}</small>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function renderAppointment(item) {
    const style = statusStyle(item.status);

    return (
      <button
        key={item.id}
        className="pf-appointment"
        style={{
          background: style.background,
          borderLeft: `4px solid ${style.color}`,
        }}
        onClick={() => setAppointmentModal(item)}
      >
        <div className="flex-grow-1 text-start">
          <strong>{item.clienteNome || item.tipo || "Compromisso"}</strong>
          <small>
            {professionalName(item)}
            {item.duracaoMin ? ` · ${item.duracaoMin} min` : ""}
          </small>
        </div>

        <span
          className="pf-status"
          style={{ color: style.color }}
        >
          {style.label}
        </span>

        <ArrowRight size={16} color={style.color} />
      </button>
    );
  }

  function renderTimeRow(time) {
    const items = appointmentsByTime[time] || [];
    const active = items.filter((item) => !isCancelled(item));
    const past = isPast(selectedDate, time);

    return (
      <div className="pf-time-row" key={time}>
        <strong className="pf-time-label">{time}</strong>

        <div className="pf-time-content">
          {active.length > 0 ? (
            active.map(renderAppointment)
          ) : (
            <button
              className="pf-available"
              disabled={past}
              onClick={() => openTimeSlot(time)}
            >
              <span>
                <Plus size={15} />
                {past ? "Horário passado" : "Disponível"}
              </span>

              {!past && <strong>Agendar</strong>}
            </button>
          )}

          {items.filter(isCancelled).map(renderAppointment)}
        </div>

        <button
          className="pf-time-more"
          title="Opções do horário"
          onClick={() => {
            if (active.length > 0) {
              setAppointmentModal(active[0]);
            } else if (
              window.confirm(`Remover o horário ${time}?`)
            ) {
              removeTime(time);
            }
          }}
        >
          <MoreVertical size={17} />
        </button>
      </div>
    );
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <div className="pf-page">
      <style>{`
        .pf-page {
          max-width: 1580px;
          margin: 0 auto;
          padding: 18px 22px 36px;
          background: #f8fafc;
          color: #17243b;
        }

        .pf-card {
          background: white;
          border: 1px solid #e1e8f0;
          border-radius: 17px;
          box-shadow: 0 3px 16px rgba(15,23,42,.035);
        }

        .pf-primary {
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg,#14b8a6,#0f766e);
          color: white;
          padding: 10px 16px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .pf-primary:hover {
          color: white;
          filter: brightness(.95);
        }

        .pf-header {
          background: linear-gradient(
            115deg,#102e3b 0%,#164d55 55%,#0f766e 100%
          );
          border-radius: 23px;
          padding: 28px 32px 22px;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 7px 25px rgba(20,45,58,.09);
        }

        .pf-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .pf-header h1 {
          font-size: clamp(26px,3vw,35px);
          font-weight: 800;
          letter-spacing: -1px;
          margin: 9px 0 5px;
          color: white;
        }

        .pf-header-caption {
          color: #c8e3e4;
          font-size: 13px;
        }

        .pf-header-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,.15);
        }

        .pf-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .pf-tabs {
          display: flex;
          gap: 5px;
        }

        .pf-tab {
          border: 1px solid #d5dee8;
          background: white;
          border-radius: 8px;
          padding: 9px 13px;
          color: #64748b;
          font-size: 13px;
          font-weight: 650;
        }

        .pf-tab.active {
          background: #0d9488;
          color: white;
          border-color: #0d9488;
        }

        .pf-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .pf-search input {
          padding: 11px 13px 11px 40px;
          border: 1px solid #dbe4ed;
          border-radius: 10px;
          width: 100%;
          background: white;
        }

        .pf-search-icon {
          position: absolute;
          left: 13px;
          top: 13px;
          color: #94a3b8;
        }

        .pf-search-results {
          position: absolute;
          z-index: 60;
          top: calc(100% + 5px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #dbe4ed;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(15,23,42,.15);
          padding: 9px;
          max-height: 350px;
          overflow: auto;
        }

        .pf-search-result {
          width: 100%;
          border: 0;
          border-radius: 8px;
          background: transparent;
          padding: 10px;
          text-align: left;
          display: block;
        }

        .pf-search-result:hover {
          background: #f0fdfa;
        }

        .pf-search-result small {
          display: block;
          color: #64748b;
          margin-top: 3px;
        }

        .pf-metric {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border-radius: 15px;
          height: 100%;
        }

        .pf-metric-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,.75);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .pf-metric-number {
          font-size: 26px;
          line-height: 1.1;
          font-weight: 800;
        }

        .pf-metric-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .pf-time-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 9px;
        }

        .pf-time-label {
          width: 60px;
          flex-shrink: 0;
          font-size: 13px;
          color: #475569;
        }

        .pf-time-content {
          flex: 1;
          min-width: 0;
          display: grid;
          gap: 6px;
        }

        .pf-available {
          width: 100%;
          min-height: 55px;
          padding: 11px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          border: 1px dashed #d6e0e9;
          background: #fff;
          border-radius: 11px;
          color: #94a3b8;
          font-size: 12px;
        }

        .pf-available span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .pf-available:not(:disabled):hover {
          background: #f0fdfa;
          border-color: #14b8a6;
          color: #0f766e;
        }

        .pf-available strong {
          color: #0d9488;
          font-size: 12px;
        }

        .pf-available:disabled {
          cursor: default;
          opacity: .7;
        }

        .pf-appointment {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 11px 13px;
          min-height: 61px;
          text-align: left;
        }

        .pf-appointment strong {
          display: block;
          font-size: 13px;
        }

        .pf-appointment small {
          display: block;
          color: #64748b;
          margin-top: 3px;
          font-size: 11px;
        }

        .pf-status {
          font-size: 11px;
          font-weight: 700;
        }

        .pf-time-more {
          width: 34px;
          height: 34px;
          border: 0;
          background: #f8fafc;
          border-radius: 8px;
          color: #64748b;
          display: grid;
          place-items: center;
        }

        .pf-time-more:hover {
          background: #e2e8f0;
        }

        .pf-calendar {
          display: grid;
          grid-template-columns: repeat(7,minmax(0,1fr));
          gap: 5px;
        }

        .pf-calendar-day {
          min-width: 0;
          min-height: 94px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 8px;
          background: white;
          text-align: left;
          color: #334155;
          font-size: 12px;
          position: relative;
          overflow: hidden;
        }

        .pf-calendar-day.selected {
          border-color: #0d9488;
          background: #e6f8f4;
        }

        .pf-calendar-day.outside {
          opacity: .45;
        }

        .pf-calendar-event {
          display: block;
          padding: 4px;
          border-radius: 5px;
          margin-top: 5px;
          font-size: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .pf-compact .pf-calendar-day {
          min-height: 38px;
          border: 0;
          border-radius: 9px;
          padding: 7px 3px;
          text-align: center;
        }

        .pf-compact .pf-calendar-day.selected {
          background: #0f766e;
          color: white;
        }

        .pf-calendar-dot {
          display: block;
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #14b8a6;
          bottom: 3px;
          left: calc(50% - 2px);
        }

        .pf-compact .selected .pf-calendar-dot {
          background: white;
        }

        .pf-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15,23,42,.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .pf-modal {
          background: white;
          width: 100%;
          max-width: 470px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 25px 65px rgba(0,0,0,.2);
        }

        .pf-choice {
          display: flex;
          align-items: center;
          gap: 13px;
          width: 100%;
          padding: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          text-align: left;
          color: #334155;
        }

        .pf-choice:hover {
          background: #f0fdfa;
          border-color: #99f6e4;
        }

        .pf-choice-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: #e5f8f4;
          color: #0f766e;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .pf-choice strong {
          display: block;
          font-size: 13px;
        }

        .pf-choice small {
          display: block;
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }

        .pf-reminder {
          border-left: 3px solid #14b8a6;
          background: #f8fafc;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .pf-floating-menu {
          position: absolute;
          z-index: 50;
          right: 0;
          top: calc(100% + 7px);
          min-width: 210px;
          padding: 6px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          box-shadow: 0 12px 30px rgba(15,23,42,.13);
        }

        .pf-floating-menu button {
          width: 100%;
          border: 0;
          border-radius: 7px;
          background: transparent;
          padding: 10px;
          text-align: left;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .pf-floating-menu button:hover {
          background: #f0fdfa;
        }

        @media(max-width:768px) {
          .pf-page { padding: 12px; }
          .pf-header { padding: 22px; }
          .pf-time-label { width: 47px; }
          .pf-time-row { gap: 6px; }
          .pf-status { display: none; }
          .pf-calendar-day { min-height: 65px; padding: 5px; }
          .pf-calendar-event { display: none; }
        }
      `}</style>

      {/* CABEÇALHO PREMIUM PRESERVADO */}
      <header className="pf-header">
        <div className="pf-header-top">
          <div>
            <div
              className="d-flex align-items-center gap-2"
              style={{
                color: "#99f6e4",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              <CalendarDays size={16} />
              PROFLEX · AGENDA
            </div>

            <h1>Agenda profissional</h1>

            <div className="pf-header-caption">
              Organize os seus horários e atendimentos.
            </div>
          </div>

          <div className="text-end">
            <div className="pf-header-caption">
              {greeting()} · {weekdayLabel(isoDate())}
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {clock}
            </div>
          </div>
        </div>

        <div className="pf-header-bottom">
          <strong style={{ fontSize: 13 }}>
            {weekdayLabel(selectedDate)} ·{" "}
            {parseDate(selectedDate).toLocaleDateString("pt-BR")}
          </strong>

          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-light"
              onClick={() => changePeriod(-1)}
            >
              ‹ Anterior
            </button>

            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 155 }}
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />

            <button
              className="btn btn-sm btn-light"
              onClick={() => setSelectedDate(isoDate())}
            >
              Hoje
            </button>

            <button
              className="btn btn-sm btn-light"
              onClick={() => changePeriod(1)}
            >
              Próximo ›
            </button>
          </div>
        </div>
      </header>

      {/* BARRA SIMPLIFICADA */}
      <section className="pf-card p-3 mb-3">
        <div className="pf-toolbar">
          <div className="pf-tabs">
            {[
              ["dia", "Dia"],
              ["semana", "Semana"],
              ["mes", "Mês"],
              ["lista", "Lista"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={`pf-tab ${view === value ? "active" : ""}`}
                onClick={() => setView(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {activeProfessionals.length > 1 && (
              <select
                className="form-select form-select-sm"
                style={{ width: 205 }}
                value={professionalFilter}
                onChange={(event) =>
                  setProfessionalFilter(event.target.value)
                }
              >
                <option value="todos">Todos os profissionais</option>

                {activeProfessionals.map((person) => (
                  <option key={person.id} value={String(person.id)}>
                    {person.nome}
                  </option>
                ))}
              </select>
            )}

            <div className="position-relative">
              <button
                className="btn btn-outline-secondary"
                title="Configurações de horários"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings2 size={18} />
              </button>

              {settingsOpen && (
                <div className="pf-floating-menu">
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      setAddTimeModal(true);
                    }}
                  >
                    <Clock3 size={16} />
                    Adicionar horário extra
                  </button>
                </div>
              )}
            </div>

            <div className="position-relative">
              <button
                className="pf-primary"
                onClick={() => setNewMenuOpen(!newMenuOpen)}
              >
                <Plus size={18} />
                Novo
              </button>

              {newMenuOpen && (
                <div className="pf-floating-menu">
                  <button
                    onClick={() =>
                      openConsultation(selectedDate, "09:00")
                    }
                  >
                    <Stethoscope size={16} />
                    Nova consulta
                  </button>

                  <button
                    onClick={() =>
                      openPersonalAppointment(selectedDate, "09:00")
                    }
                  >
                    <CalendarClock size={16} />
                    Compromisso pessoal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BUSCA REAL */}
        <div className="pf-search">
          <Search className="pf-search-icon" size={17} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Buscar paciente ou agendamento..."
          />

          {searchFocused && search.trim() && (
            <div className="pf-search-results">
              <div className="d-flex justify-content-between align-items-center px-2 py-1">
                <strong className="small">Resultados</strong>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setSearchFocused(false)}
                >
                  <X size={15} />
                </button>
              </div>

              {searchResults.clients.length > 0 && (
                <>
                  <div className="small text-muted px-2 pt-2">
                    Pacientes
                  </div>

                  {searchResults.clients.map((client) => (
                    <button
                      key={client.id}
                      className="pf-search-result"
                      onClick={() => {
                        setSearchFocused(false);
                        setSearch("");
                        openConsultation(
                          selectedDate,
                          "09:00",
                          client.id
                        );
                      }}
                    >
                      <strong>{client.nome}</strong>
                      <small>
                        {client.telefone || "Paciente cadastrado"} · Agendar
                      </small>
                    </button>
                  ))}
                </>
              )}

              {searchResults.appointments.length > 0 && (
                <>
                  <div className="small text-muted px-2 pt-2">
                    Agendamentos
                  </div>

                  {searchResults.appointments.map((item) => (
                    <button
                      key={item.id}
                      className="pf-search-result"
                      onClick={() => {
                        setSelectedDate(item.data);
                        setView("dia");
                        setSearchFocused(false);
                        setSearch("");
                        setAppointmentModal(item);
                      }}
                    >
                      <strong>
                        {item.clienteNome || item.tipo || "Agendamento"}
                      </strong>
                      <small>
                        {item.data} · {item.hora} ·{" "}
                        {statusStyle(item.status).label}
                      </small>
                    </button>
                  ))}
                </>
              )}

              {searchResults.clients.length === 0 &&
                searchResults.appointments.length === 0 && (
                  <div className="small text-muted p-3">
                    Nenhum paciente ou agendamento encontrado.
                  </div>
                )}
            </div>
          )}
        </div>
      </section>

      {/* INDICADORES ÚTEIS */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <Metric
            icon={CalendarDays}
            number={metrics.total}
            label="Agendamentos"
            background="#dff7ef"
            color="#059669"
          />
        </div>

        <div className="col-6 col-md-4">
          <Metric
            icon={CheckCircle2}
            number={metrics.confirmed}
            label="Confirmados"
            background="#e8f7ed"
            color="#16a34a"
          />
        </div>

        <div className="col-6 col-md-4">
          <Metric
            icon={Clock3}
            number={metrics.available}
            label="Horários livres"
            background="#e8f4ff"
            color="#0284c7"
          />
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <section className="pf-card p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 className="fw-bold d-flex align-items-center gap-2 mb-1">
                  <CalendarDays size={20} color="#0f766e" />
                  {view === "dia"
                    ? "Agenda do dia"
                    : view === "semana"
                    ? "Agenda semanal"
                    : view === "mes"
                    ? "Agenda mensal"
                    : "Lista de agendamentos"}
                </h5>

                <div className="text-muted small">
                  {dateLabel(selectedDate)}
                </div>
              </div>

              <div
                className="small text-muted"
                style={{ paddingTop: 4 }}
              >
                {metrics.total} atendimento(s)
              </div>
            </div>

            {view === "dia" && (
              <>
                {slots.length > 0 ? (
                  slots.map(renderTimeRow)
                ) : (
                  <p className="text-muted small">
                    Nenhum horário configurado.
                  </p>
                )}
              </>
            )}

            {view === "semana" && (
              <>
                <div className="pf-calendar mb-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                    (day) => (
                      <div
                        className="text-center small fw-bold"
                        key={day}
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {renderCalendar(weekDays)}
              </>
            )}

            {view === "mes" && (
              <>
                <div className="pf-calendar mb-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                    (day) => (
                      <div
                        className="text-center small fw-bold"
                        key={day}
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {renderCalendar(monthDays)}
              </>
            )}

            {view === "lista" && (
              <div className="d-grid gap-2">
                {dayAppointments.length === 0 ? (
                  <p className="text-muted small">
                    Nenhum agendamento nesta data.
                  </p>
                ) : (
                  dayAppointments.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex align-items-center gap-3"
                    >
                      <strong
                        style={{
                          width: 50,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {item.hora}
                      </strong>

                      <div className="flex-grow-1">
                        {renderAppointment(item)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top">
              {Object.values(STATUS).map((status) => (
                <span
                  key={status.label}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: 11, color: "#64748b" }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: status.color,
                    }}
                  />
                  {status.label}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* PAINEL LATERAL */}
        <div className="col-12 col-xl-4">
          <div className="d-grid gap-3">
            {/* CALENDÁRIO PRESERVADO */}
            <section className="pf-card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => {
                    const date = parseDate(selectedDate);
                    date.setDate(1);
                    date.setMonth(date.getMonth() - 1);
                    setSelectedDate(isoDate(date));
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <strong style={{ fontSize: 14 }}>
                  {parseDate(selectedDate).toLocaleDateString(
                    "pt-BR",
                    { month: "long", year: "numeric" }
                  )}
                </strong>

                <button
                  className="btn btn-sm btn-light"
                  onClick={() => {
                    const date = parseDate(selectedDate);
                    date.setDate(1);
                    date.setMonth(date.getMonth() + 1);
                    setSelectedDate(isoDate(date));
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="pf-calendar mb-2">
                {["S", "T", "Q", "Q", "S", "S", "D"].map(
                  (day, index) => (
                    <div
                      className="text-center text-muted small fw-bold"
                      key={index}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {renderCalendar(monthDays, true)}

              <div className="small text-muted mt-3">
                Selecione um dia para visualizar os atendimentos.
              </div>
            </section>

            {/* LEMBRETES */}
            <section className="pf-card p-3">
              <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
                <Bell size={18} color="#0f766e" />
                Lembretes ({dayReminders.length})
              </h6>

              <div className="d-flex gap-2 mb-2">
                <input
                  type="time"
                  className="form-control form-control-sm"
                  style={{ width: 110 }}
                  value={reminderTime}
                  onChange={(event) =>
                    setReminderTime(event.target.value)
                  }
                />

                <input
                  className="form-control form-control-sm"
                  placeholder="O que lembrar?"
                  value={reminderText}
                  onChange={(event) =>
                    setReminderText(event.target.value)
                  }
                />
              </div>

              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control form-control-sm"
                  placeholder="WhatsApp (opcional)"
                  value={reminderPhone}
                  onChange={(event) =>
                    setReminderPhone(event.target.value)
                  }
                />

                <button
                  className="pf-primary"
                  onClick={addReminder}
                  style={{ padding: "7px 12px" }}
                >
                  Criar
                </button>
              </div>

              {dayReminders.length === 0 ? (
                <p className="small text-muted mb-0">
                  Sem lembretes nesta data.
                </p>
              ) : (
                dayReminders.map((item) => (
                  <div className="pf-reminder" key={item.id}>
                    <div className="d-flex justify-content-between gap-2">
                      <div
                        className="small"
                        style={{
                          textDecoration: item.concluido
                            ? "line-through"
                            : "none",
                        }}
                      >
                        <strong>{item.time}</strong> · {item.msg}
                      </div>

                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-light"
                          title="Concluir"
                          onClick={() => completeReminder(item.id)}
                        >
                          <Check size={15} />
                        </button>

                        <button
                          className="btn btn-sm btn-light text-danger"
                          title="Excluir"
                          onClick={() => deleteReminder(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {item.zap && (
                      <a
                        href={whatsappLink(item.zap)}
                        target="_blank"
                        rel="noreferrer"
                        className="small text-success"
                      >
                        Abrir WhatsApp
                      </a>
                    )}
                  </div>
                ))
              )}
            </section>

            {/* ANIVERSÁRIOS */}
            <section className="pf-card p-3">
              <h6 className="fw-bold d-flex align-items-center gap-2 mb-3">
                <Cake size={18} color="#0f766e" />
                Aniversários ({birthdays.length})
              </h6>

              {birthdays.length === 0 ? (
                <p className="small text-muted mb-0">
                  Sem aniversariantes nesta data.
                </p>
              ) : (
                birthdays.map((client) => (
                  <div
                    key={client.id}
                    className="d-flex align-items-center justify-content-between gap-2 py-2 border-bottom"
                  >
                    <strong className="small">{client.nome}</strong>

                    {client.telefone && (
                      <a
                        href={whatsappLink(
                          client.telefone,
                          `Parabéns, ${client.nome}! 🎉`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-success"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>

      {/* NOVO AGENDAMENTO NO HORÁRIO CLICADO */}
      {slotModal && (
        <Modal
          title={`Horário ${slotModal.time}`}
          subtitle={dateLabel(selectedDate)}
          onClose={() => setSlotModal(null)}
        >
          {slotModal.appointments.length > 0 ? (
            <div className="d-grid gap-2">
              {slotModal.appointments.map((item) => (
                <button
                  className="pf-choice"
                  key={item.id}
                  onClick={() => {
                    setSlotModal(null);
                    setAppointmentModal(item);
                  }}
                >
                  <span className="pf-choice-icon">
                    <UserRound size={20} />
                  </span>

                  <span className="flex-grow-1">
                    <strong>
                      {item.clienteNome || item.tipo}
                    </strong>
                    <small>{professionalName(item)}</small>
                  </span>

                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            <div className="d-grid gap-2">
              <button
                className="pf-choice"
                onClick={() =>
                  openConsultation(
                    selectedDate,
                    slotModal.time
                  )
                }
              >
                <span className="pf-choice-icon">
                  <Stethoscope size={20} />
                </span>

                <span className="flex-grow-1">
                  <strong>Agendar consulta</strong>
                  <small>Selecionar paciente e profissional</small>
                </span>

                <ArrowRight size={17} />
              </button>

              <button
                className="pf-choice"
                onClick={() =>
                  openPersonalAppointment(
                    selectedDate,
                    slotModal.time
                  )
                }
              >
                <span className="pf-choice-icon">
                  <CalendarClock size={20} />
                </span>

                <span className="flex-grow-1">
                  <strong>Compromisso pessoal</strong>
                  <small>Registrar um evento neste horário</small>
                </span>

                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}

      {/* DETALHES DO AGENDAMENTO */}
      {appointmentModal && (
        <Modal
          title="Detalhes do agendamento"
          subtitle={`${dateLabel(appointmentModal.data)} · ${
            appointmentModal.hora
          }`}
          onClose={() => setAppointmentModal(null)}
        >
          <div className="d-grid gap-2 small mb-4">
            <div>
              <strong>Paciente:</strong>{" "}
              {appointmentModal.clienteNome || "Não informado"}
            </div>

            <div>
              <strong>Profissional:</strong>{" "}
              {professionalName(appointmentModal)}
            </div>

            <div>
              <strong>Duração:</strong>{" "}
              {appointmentModal.duracaoMin || 60} minutos
            </div>

            <div>
              <strong>Status:</strong>{" "}
              {statusStyle(appointmentModal.status).label}
            </div>

            {appointmentModal.observacoes && (
              <div>
                <strong>Observações:</strong>{" "}
                {appointmentModal.observacoes}
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            {appointmentModal.clienteId && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  navigate(
                    `/prontuario?clienteId=${appointmentModal.clienteId}`
                  )
                }
              >
                <UserRound size={15} className="me-1" />
                Paciente
              </button>
            )}

            <button
              className="pf-primary"
              onClick={() => editAppointment(appointmentModal)}
            >
              <Pencil size={15} />
              Editar
            </button>

            <button
              className="btn btn-outline-success btn-sm"
              onClick={() =>
                updateStatus(appointmentModal, "confirmado")
              }
            >
              Confirmar
            </button>

            <button
              className="btn btn-outline-info btn-sm"
              onClick={() =>
                updateStatus(appointmentModal, "concluido")
              }
            >
              Concluir
            </button>

            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => {
                if (window.confirm("Cancelar este agendamento?")) {
                  updateStatus(appointmentModal, "cancelado");
                }
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {/* ADICIONAR HORÁRIO EXTRA */}
      {addTimeModal && (
        <Modal
          title="Adicionar horário extra"
          subtitle="Use apenas quando precisar de um horário fora da agenda habitual."
          onClose={() => setAddTimeModal(false)}
        >
          <label className="form-label small fw-semibold">
            Data
          </label>

          <input
            type="date"
            className="form-control mb-3"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
          />

          <label className="form-label small fw-semibold">
            Horário
          </label>

          <input
            type="time"
            className="form-control mb-3"
            value={newTime}
            onChange={(event) => setNewTime(event.target.value)}
          />

          <label className="d-flex align-items-center gap-2 small mb-4">
            <input
              type="checkbox"
              checked={createAfterTime}
              onChange={(event) =>
                setCreateAfterTime(event.target.checked)
              }
            />
            Agendar um paciente em seguida
          </label>

          <button
            className="pf-primary w-100"
            onClick={addExtraTime}
          >
            <Plus size={17} />
            Adicionar horário
          </button>
        </Modal>
      )}

      {/* IDENTIDADE VISUAL */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-2">
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            background:
              "linear-gradient(135deg,#14b8a6,#0f766e)",
            display: "grid",
            placeItems: "center",
            color: "white",
          }}
        >
          <Activity size={25} strokeWidth={2.5} />
        </div>

        <span
          style={{
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: "-1px",
          }}
        >
          Pro<span style={{ color: "#0d9488" }}>Flex</span>
        </span>
      </div>
    </div>
  );
}
