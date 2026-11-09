
import React from "react";
import { useLocation } from "react-router-dom";
import {
  Sparkles,
  CalendarDays,
  CalendarClock,
  CalendarPlus,
  UsersRound,
  ClipboardList,
  HeartPulse,
  Stethoscope,
} from "lucide-react";

const pageDetails = {
  "/dashboard": {
    title: "Seu consultório, sob controle.",
    subtitle: "Pacientes, agenda e oportunidades em um só lugar.",
    label: "PROFLEX · VISÃO GERAL",
    icon: Sparkles,
  },
  "/agenda": {
    title: "Agenda profissional",
    subtitle: "Organize os seus horários e atendimentos.",
    label: "PROFLEX · AGENDA",
    icon: CalendarDays,
  },
  "/agendar": {
    title: "Agendamento de consultas",
    subtitle: "Registre e organize novos atendimentos.",
    label: "PROFLEX · AGENDAMENTOS",
    icon: CalendarPlus,
  },
  "/clientes": {
    title: "Gestão de pacientes",
    subtitle: "Cadastre, consulte e acompanhe seus pacientes.",
    label: "PROFLEX · PACIENTES",
    icon: UsersRound,
  },
  "/compromissos": {
    title: "Gestão de compromissos",
    subtitle: "Organize suas atividades e compromissos profissionais.",
    label: "PROFLEX · COMPROMISSOS",
    icon: CalendarClock,
  },
  "/prontuario": {
    title: "Prontuários clínicos",
    subtitle: "Acesse informações e históricos dos pacientes.",
    label: "PROFLEX · PRONTUÁRIOS",
    icon: ClipboardList,
  },
  "/consulta": {
    title: "Atendimento clínico",
    subtitle: "Registre consultas e acompanhe a evolução dos pacientes.",
    label: "PROFLEX · CONSULTAS",
    icon: Stethoscope,
  },
};

export default function PageHeader() {
  const { pathname } = useLocation();
  const page = pageDetails[pathname];

  if (!page) return null;

  const Icon = page.icon;

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>
        {`
          .proflex-page-header {
            background: linear-gradient(
              115deg,
              #102E3B 0%,
              #164D55 55%,
              #0F766E 100%
            );
            border-radius: 22px;
            padding: 30px 34px;
            color: #fff;
            position: relative;
            overflow: hidden;
            margin-bottom: 26px;
          }

          .proflex-page-header::after {
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

          .proflex-page-header-content {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
          }

          .proflex-page-header-label {
            display: flex;
            align-items: center;
            gap: 9px;
            font-size: 11px;
            font-weight: 750;
            letter-spacing: 2px;
            color: #99F6E4;
            margin-bottom: 12px;
          }

          .proflex-page-header-title {
            font-size: clamp(25px, 3vw, 34px);
            font-weight: 750;
            letter-spacing: -1px;
            margin: 0 0 8px;
            color: white;
          }

          .proflex-page-header-subtitle {
            color: #C6DEE1;
            font-size: 14px;
            margin: 0;
          }

          .proflex-page-header-date {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.08);
            border-radius: 11px;
            font-size: 13px;
            color: #E0F2F1;
            white-space: nowrap;
          }

          @media (max-width: 768px) {
            .proflex-page-header {
              padding: 24px 20px;
              border-radius: 18px;
            }
          }
        `}
      </style>

      <header className="proflex-page-header">
        <div className="proflex-page-header-content">
          <div>
            <div className="proflex-page-header-label">
              <Icon size={15} />
              {page.label}
            </div>

            <h1 className="proflex-page-header-title">
              {page.title}
            </h1>

            <p className="proflex-page-header-subtitle">
              {page.subtitle}
            </p>
          </div>

          <div className="proflex-page-header-date">
            <CalendarDays size={17} />
            {today}
          </div>
        </div>
      </header>
    </>
  );
}
