
import React, { useState, useEffect } from "react";
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
  Moon,
  Sun,
  Plus,
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
    title: "Avaliação inicial",
    subtitle: "ProFlex Premium • Prontuário clínico",
    label: "PROFLEX · AVALIAÇÃO",
    icon: Plus,
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
  title: "Prontuário clínico",
  subtitle: "ProFlex Premium • Gestão clínica",
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

 const isAvaliacao =
  pathname === "/agendar" ||
  pathname === "/prontuario";

  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem("proflex-tema") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    if (!isAvaliacao) return;

    try {
      localStorage.setItem("proflex-tema", tema);
    } catch {
      // Armazenamento indisponível
    }

    document.documentElement.dataset.proflexTheme = tema;

    // Informa outros componentes sobre a mudança.
    window.dispatchEvent(
      new CustomEvent("proflex-theme-change", {
        detail: { tema },
      })
    );
  }, [tema, isAvaliacao]);

  if (!page) return null;

  const Icon = page.icon;

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const alternarTema = () => {
    setTema((anterior) =>
      anterior === "dark" ? "light" : "dark"
    );
  };

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

          /* ESTILO EXCLUSIVO DA AVALIAÇÃO */

          
.proflex-page-header.avaliacao {
  border-radius: 22px;
  padding: 28px 34px;
  overflow: hidden;
}


          .proflex-avaliacao-brand {
            display: flex;
            align-items: center;
            gap: 22px;
          }

          .proflex-avaliacao-icon {
            width: 76px;
            height: 76px;
            flex-shrink: 0;
            border: 2px solid #D4AA56;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #D4AA56;
          }

          .proflex-page-header.avaliacao
          .proflex-page-header-title {
            font-size: clamp(30px, 4vw, 46px);
            font-weight: 800;
            margin-bottom: 5px;
          }

          .proflex-page-header.avaliacao
          .proflex-page-header-subtitle {
            font-size: clamp(14px, 1.6vw, 20px);
          }

          .proflex-avaliacao-actions {
            display: flex;
            flex-direction: column;
            gap: 7px;
            align-items: stretch;
            min-width: 270px;
          }

          .proflex-avaliacao-actions
          .proflex-page-header-date {
            justify-content: center;
            font-size: 16px;
            font-weight: 600;
            padding: 12px 18px;
            border-radius: 15px;
          }

          .proflex-theme-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 11px 18px;
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.3);
            background: rgba(255,255,255,0.07);
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .proflex-theme-toggle:hover {
            background: rgba(255,255,255,0.16);
          }

          .proflex-theme-toggle svg {
            color: #D4AA56;
          }

          @media (max-width: 768px) {
            .proflex-page-header {
              padding: 24px 20px;
              border-radius: 18px;
            }

            .proflex-page-header.avaliacao {
              padding: 22px 18px;
            }

            .proflex-avaliacao-brand {
              gap: 13px;
            }

            .proflex-avaliacao-icon {
              width: 53px;
              height: 53px;
              border-radius: 12px;
            }

            .proflex-avaliacao-icon svg {
              width: 29px;
              height: 29px;
            }

            .proflex-avaliacao-actions {
              width: 100%;
              min-width: 0;
            }

            .proflex-avaliacao-actions
            .proflex-page-header-date {
              font-size: 14px;
            }
          }
        `}
      </style>

      <header
        className={`proflex-page-header ${
          isAvaliacao ? "avaliacao" : ""
        }`}
      >
        {isAvaliacao ? (
          <div className="proflex-page-header-content">
            <div className="proflex-avaliacao-brand">
              <div className="proflex-avaliacao-icon">
               {pathname === "/prontuario" ? (
  <ClipboardList size={40} strokeWidth={2.5} />
) : (
  <Plus size={46} strokeWidth={4} />
)}
              </div>

              <div>
               <h1 className="proflex-page-header-title">
  {page.title}
</h1>

<p className="proflex-page-header-subtitle">
  {page.subtitle}
</p>
              </div>
            </div>

            <div className="proflex-avaliacao-actions">
              <div className="proflex-page-header-date">
                <CalendarDays size={22} />
                {today}
              </div>

              <button
                type="button"
                className="proflex-theme-toggle"
                onClick={alternarTema}
                aria-label={
                  tema === "dark"
                    ? "Ativar modo claro"
                    : "Ativar modo escuro"
                }
              >
                {tema === "dark" ? (
                  <>
                    <Sun size={21} />
                    Light
                  </>
                ) : (
                  <>
                    <Moon size={21} />
                    Dark
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </header>
    </>
  );
}
