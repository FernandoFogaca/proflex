
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  UsersRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./Home.css";

const telas = ["dashboard", "agenda", "prontuario"];

const funcionalidades = [
  {
    icon: CalendarDays,
    titulo: "Agenda integrada",
    texto: "Organize horários e acompanhe os atendimentos com facilidade.",
  },
  {
    icon: HeartPulse,
    titulo: "Prontuário clínico",
    texto: "Avaliações, consultas e histórico clínico num só lugar.",
  },
  {
    icon: FileText,
    titulo: "Relatórios em PDF",
    texto: "Prepare documentos clínicos de forma prática e organizada.",
  },
];

function SimboloProFlex({ size = 48 }) {
  return (
    <svg
      className="pfh-logo-symbol"
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="56"
        height="56"
        rx="16"
        fill="url(#pfh-logo-gradient)"
      />
      <path
        className="pfh-logo-pulse"
        d="M9 31 H19 L24 19 L31 43 L38 14 L43 31 H51"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="pfh-logo-gradient"
          x1="0"
          y1="0"
          x2="60"
          y2="60"
        >
          <stop stopColor="#18DAC1" />
          <stop offset="1" stopColor="#087E84" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Demonstracao({ tela, setTela }) {
  return (
    <div className="pfh-demo-area">
      <div className="pfh-demo-glow" aria-hidden="true" />

      <div className="pfh-demo-window">
        <div className="pfh-demo-topbar">
          <div className="pfh-demo-topbrand">
            <Activity size={17} />
            <strong>ProFlex</strong>
            <span>/ Plataforma</span>
          </div>
          <div className="pfh-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>

        <div className="pfh-demo-layout">
          <nav className="pfh-demo-sidebar" aria-label="Prévia de funcionalidades">
            {[
              { id: "dashboard", Icon: Activity, label: "Dashboard" },
              { id: "agenda", Icon: CalendarDays, label: "Agenda" },
              { id: "prontuario", Icon: ClipboardList, label: "Prontuário" },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={`Mostrar ${label}`}
                aria-pressed={tela === id}
                onClick={() => setTela(id)}
                className={`pfh-demo-nav ${tela === id ? "active" : ""}`}
              >
                <Icon size={19} />
              </button>
            ))}
          </nav>

          <div className="pfh-demo-content" key={tela}>
            {tela === "dashboard" && (
              <>
                <div className="pfh-demo-heading">
                  <div>
                    <small>VISÃO GERAL</small>
                    <h3>Seu consultório em ordem.</h3>
                  </div>
                  <Sparkles size={21} />
                </div>

                <div className="pfh-demo-metrics">
                  <article>
                    <span>Atendimentos do dia</span>
                    <strong>08</strong>
                    <small>Agenda organizada</small>
                  </article>
                  <article>
                    <span>Próximos horários</span>
                    <strong>03</strong>
                    <small>Programados</small>
                  </article>
                </div>

                <div className="pfh-demo-section-title">
                  <span>Actividade semanal</span>
                  <span className="pfh-mini-tag">Resumo</span>
                </div>

                <div className="pfh-chart" aria-hidden="true">
                  {[38, 57, 46, 78, 63, 91, 72].map((altura, index) => (
                    <div
                      key={index}
                      className="pfh-chart-column"
                      style={{ "--bar-height": `${altura}%` }}
                    >
                      <span />
                    </div>
                  ))}
                </div>
              </>
            )}

            {tela === "agenda" && (
              <>
                <div className="pfh-demo-heading">
                  <div>
                    <small>ORGANIZAÇÃO</small>
                    <h3>Agenda profissional</h3>
                  </div>
                  <CalendarDays size={21} />
                </div>

                <div className="pfh-calendar-week">
                  {["S", "T", "Q", "Q", "S", "S", "D"].map((dia, index) => (
                    <div
                      key={index}
                      className={index === 3 ? "selected" : ""}
                    >
                      <small>{dia}</small>
                      <strong>{23 + index}</strong>
                    </div>
                  ))}
                </div>

                <div className="pfh-demo-section-title">
                  <span>Próximos atendimentos</span>
                  <span className="pfh-mini-tag">Hoje</span>
                </div>

                <div className="pfh-agenda-item">
                  <span className="pfh-agenda-time">09:00</span>
                  <div>
                    <strong>Avaliação inicial</strong>
                    <small>Atendimento agendado</small>
                  </div>
                  <CheckCircle2 size={17} />
                </div>

                <div className="pfh-agenda-item">
                  <span className="pfh-agenda-time">10:30</span>
                  <div>
                    <strong>Consulta de retorno</strong>
                    <small>Acompanhamento clínico</small>
                  </div>
                  <Clock3 size={17} />
                </div>
              </>
            )}

            {tela === "prontuario" && (
              <>
                <div className="pfh-demo-heading">
                  <div>
                    <small>GESTÃO CLÍNICA</small>
                    <h3>Prontuário do paciente</h3>
                  </div>
                  <ClipboardList size={21} />
                </div>

                <div className="pfh-record-summary">
                  <div className="pfh-record-avatar">
                    <UsersRound size={23} />
                  </div>
                  <div>
                    <strong>Histórico clínico</strong>
                    <small>Avaliações e consultas organizadas</small>
                  </div>
                </div>

                <div className="pfh-demo-section-title">
                  <span>Linha de acompanhamento</span>
                  <span className="pfh-mini-tag">PDF</span>
                </div>

                <div className="pfh-timeline-item">
                  <span className="pfh-timeline-dot" />
                  <div>
                    <strong>Consulta 01 — Avaliação Inicial</strong>
                    <small>Registo clínico organizado</small>
                  </div>
                  <CheckCircle2 size={17} />
                </div>

                <div className="pfh-timeline-item">
                  <span className="pfh-timeline-dot" />
                  <div>
                    <strong>Consulta 02 — Evolução</strong>
                    <small>Acompanhamento do tratamento</small>
                  </div>
                  <CheckCircle2 size={17} />
                </div>

                <div className="pfh-record-export">
                  <FileText size={15} />
                  Relatório clínico disponível em PDF
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pfh-floating-card pfh-floating-top">
        <CheckCircle2 size={20} />
        <div>
          <strong>Atendimento registado</strong>
          <small>Informações organizadas</small>
        </div>
      </div>

      <div className="pfh-floating-card pfh-floating-bottom">
        <Clock3 size={20} />
        <div>
          <strong>Mais organização</strong>
          <small>Para a rotina clínica</small>
        </div>
      </div>

      <div className="pfh-demo-controls">
        {telas.map((item) => (
          <button
            key={item}
            type="button"
            className={tela === item ? "active" : ""}
            onClick={() => setTela(item)}
            aria-label={`Visualizar ${item}`}
            aria-pressed={tela === item}
          />
        ))}
      </div>
      <p className="pfh-demo-disclaimer">
        Demonstração ilustrativa, sem dados reais de pacientes.
      </p>
    </div>
  );
}

export default function Home() {
  const [tela, setTela] = useState("dashboard");

  useEffect(() => {
    const reduzirMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduzirMovimento) return;

    const intervalo = window.setInterval(() => {
      setTela((anterior) => {
        const indice = telas.indexOf(anterior);
        return telas[(indice + 1) % telas.length];
      });
    }, 6000);

    return () => window.clearInterval(intervalo);
  }, []);

  return (
    <main className="pfh-home">
      <section className="pfh-hero">
        <div className="pfh-background-grid" aria-hidden="true" />

        <svg
          className="pfh-background-ecg"
          viewBox="0 0 1600 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="pfh-ecg-base"
            d="M0 150 H230 L270 150 L295 120 L324 196
               L356 52 L388 150 H640 L677 150
               L705 124 L729 186 L764 68 L799 150
               H1090 L1120 150 L1155 119 L1186 194
               L1219 56 L1255 150 H1600"
          />
          <path
            className="pfh-ecg-light"
            d="M0 150 H230 L270 150 L295 120 L324 196
               L356 52 L388 150 H640 L677 150
               L705 124 L729 186 L764 68 L799 150
               H1090 L1120 150 L1155 119 L1186 194
               L1219 56 L1255 150 H1600"
          />
        </svg>

        <div className="pfh-hero-container">
          <div className="pfh-intro-brand">
            <SimboloProFlex size={55} />
            <div>
              <div className="pfh-animated-name">ProFlex</div>
              <span>GESTÃO CLÍNICA INTELIGENTE</span>
            </div>
          </div>

          <div className="pfh-hero-layout">
            <div className="pfh-hero-copy">
              <div className="pfh-welcome" aria-label="Boas-vindas ao ProFlex">
                <span>Welcome to ProFlex</span>
                <span>Bienvenue chez ProFlex</span>
                <span>Bem-vindo ao ProFlex</span>
              </div>

              <div className="pfh-eyebrow">
                <span className="pfh-status-dot" />
                TECNOLOGIA PARA PROFISSIONAIS DE SAÚDE
              </div>

              <h1>
                Mais tempo para <em>cuidar.</em>
                <br />
                Menos tempo para administrar.
              </h1>

              <p className="pfh-hero-description">
                Agenda, pacientes, prontuários e relatórios numa experiência
                moderna, organizada e pensada para o seu dia a dia.
              </p>

              <div className="pfh-hero-actions">
                <Link to="/marketing" className="pfh-cta-primary">
                  Conhecer planos
                  <ArrowUpRight size={19} />
                </Link>

                <a href="#funcionalidades" className="pfh-cta-secondary">
                  Explorar funcionalidades
                </a>
              </div>

              <div className="pfh-hero-note">
                <ShieldCheck size={17} />
                Desenvolvido para simplificar a gestão clínica.
              </div>
            </div>

            <Demonstracao tela={tela} setTela={setTela} />
          </div>
        </div>
      </section>

      <section className="pfh-features" id="funcionalidades">
        <div className="pfh-section-heading">
          <span>UM SISTEMA, MAIS POSSIBILIDADES</span>
          <h2>Tudo o que importa, no mesmo lugar.</h2>
          <p>
            Menos tarefas dispersas. Mais clareza para gerir o seu
            trabalho e acompanhar cada atendimento.
          </p>
        </div>

        <div className="pfh-features-grid">
          {funcionalidades.map(({ icon: Icon, titulo, texto }) => (
            <article className="pfh-feature-card" key={titulo}>
              <div className="pfh-feature-icon">
                <Icon size={27} />
              </div>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pfh-final-cta">
        <div>
          <span>CONHEÇA O PROFLEX</span>
          <h2>Uma nova experiência para gerir a sua rotina.</h2>
          <p>Descubra as funcionalidades e escolha o próximo passo.</p>
        </div>

        <Link to="/marketing" className="pfh-cta-primary">
          Conhecer planos
          <ArrowUpRight size={19} />
        </Link>
      </section>

      <footer className="pfh-footer">
        <div>
          <Activity size={19} />
          <strong>ProFlex</strong>
        </div>
        <span>
          © {new Date().getFullYear()} ProFlex. Todos os direitos reservados.
        </span>
      </footer>
    </main>
  );
}
