
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MonitorSmartphone,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  Utensils,
  X,
} from "lucide-react";
import "./Marketing.css";

const beneficios = [
  {
    icon: CalendarDays,
    titulo: "Agenda sob controle",
    descricao:
      "Visualize seus compromissos, organize horários e acompanhe seus atendimentos em um só lugar.",
  },
  {
    icon: UsersRound,
    titulo: "Pacientes organizados",
    descricao:
      "Centralize informações cadastrais e encontre rapidamente o histórico de cada paciente.",
  },
  {
    icon: ClipboardList,
    titulo: "Evolução de atendimentos",
    descricao:
      "Registre informações importantes de cada consulta e acompanhe a evolução dos pacientes.",
  },
  {
    icon: FileText,
    titulo: "Relatórios profissionais",
    descricao:
      "Organize informações de atendimento e prepare documentos para acompanhamento profissional.",
  },
  {
    icon: MonitorSmartphone,
    titulo: "Uma experiência prática",
    descricao:
      "Uma interface pensada para facilitar a rotina, com navegação clara e menos trabalho repetitivo.",
  },
  {
    icon: Building2,
    titulo: "Para diferentes rotinas",
    descricao:
      "Uma proposta flexível para profissionais independentes, clínicas e quem atua nos dois formatos.",
  },
];

const profissoes = [
  { icon: Activity, nome: "Fisioterapeutas" },
  { icon: Stethoscope, nome: "Médicos" },
  { icon: HeartPulse, nome: "Psicólogos" },
  { icon: Utensils, nome: "Nutricionistas" },
  { icon: BadgeCheck, nome: "Dentistas" },
  { icon: PawPrint, nome: "Veterinários" },
  { icon: ClipboardList, nome: "Enfermeiros" },
  { icon: UsersRound, nome: "Fonoaudiólogos" },
];

const perfis = [
  {
    icon: UserRound,
    titulo: "Profissional autônomo",
    descricao:
      "Para quem atende por conta própria e deseja organizar pacientes, horários e registros.",
    itens: [
      "Organização individual",
      "Cadastro de pacientes",
      "Acompanhamento de atendimentos",
    ],
  },
  {
    icon: Building2,
    titulo: "Clínicas",
    descricao:
      "Para negócios que precisam organizar o atendimento de diferentes profissionais.",
    itens: [
      "Estrutura para equipes",
      "Organização da operação",
      "Visão centralizada da clínica",
    ],
  },
  {
    icon: CalendarCheck2,
    titulo: "Profissional híbrido",
    descricao:
      "Para quem concilia atendimentos particulares com atividades em clínicas.",
    itens: [
      "Diferentes contextos de trabalho",
      "Rotina profissional flexível",
      "Organização dos atendimentos",
    ],
  },
];

const perguntas = [
  {
    pergunta: "Para quem o ProFlex foi desenvolvido?",
    resposta:
      "O ProFlex foi pensado para profissionais da saúde e clínicas que precisam organizar pacientes, agendamentos e registros de atendimento.",
  },
  {
    pergunta: "Posso utilizar o ProFlex como profissional autônomo?",
    resposta:
      "Sim. O cadastro prevê o perfil autônomo, além dos perfis clínica e híbrido. As funcionalidades de cada modalidade serão definidas conforme a evolução da plataforma.",
  },
  {
    pergunta: "O ProFlex já está disponível para contratação?",
    resposta:
      "A plataforma está em desenvolvimento. O cadastro e as funcionalidades comerciais ainda estão sendo preparados. Informações definitivas sobre disponibilidade e assinatura serão divulgadas quando estiverem prontas.",
  },
  {
    pergunta: "Os lembretes por WhatsApp já são automáticos?",
    resposta:
      "A automação de lembretes faz parte da evolução planejada do produto. Ela não deve ser considerada disponível até que a integração esteja concluída.",
  },
  {
    pergunta: "Os dados dos pacientes ficam protegidos?",
    resposta:
      "A proteção de dados e a separação de informações entre profissionais e clínicas são requisitos do projeto. Antes do uso com dados reais de saúde, os controles de autenticação, acesso e segurança precisam estar implementados e validados.",
  },
];

const agendaExemplo = [
  {
    hora: "08:30",
    nome: "Paciente demonstrativo 01",
    tipo: "Avaliação inicial",
    status: "Confirmado",
    cor: "verde",
  },
  {
    hora: "10:00",
    nome: "Paciente demonstrativo 02",
    tipo: "Acompanhamento",
    status: "Agendado",
    cor: "azul",
  },
  {
    hora: "11:30",
    nome: "Paciente demonstrativo 03",
    tipo: "Retorno",
    status: "Agendado",
    cor: "azul",
  },
];

function Logo({ claro = false }) {
  return (
    <Link to="/marketing" className="pm-logo">
      <span className="pm-logo-icon">
        <Activity size={23} strokeWidth={2.6} />
      </span>
      <span className={claro ? "pm-logo-light" : "pm-logo-name"}>
        Pro<span>Flex</span>
      </span>
    </Link>
  );
}

function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header className="pm-header">
      <div className="pm-container pm-header-inner">
        <Logo />

        <nav className={`pm-nav ${menuAberto ? "pm-nav-open" : ""}`}>
          <a href="#beneficios" onClick={fecharMenu}>
            Benefícios
          </a>
          <a href="#demonstracao" onClick={fecharMenu}>
            Conheça o sistema
          </a>
          <a href="#profissionais" onClick={fecharMenu}>
            Profissionais
          </a>
          <a href="#perfis" onClick={fecharMenu}>
            Modalidades
          </a>
          <a href="#perguntas" onClick={fecharMenu}>
            Dúvidas
          </a>

          <Link
            to="/cadastro"
            className="pm-btn pm-btn-primary pm-nav-mobile-cta"
            onClick={fecharMenu}
          >
            Conhecer o cadastro
            <ArrowRight size={17} />
          </Link>
        </nav>

              <button
          type="button"
          className="pm-menu-toggle"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

function PreviewSistema({ grande = false }) {
  const [aba, setAba] = useState("agenda");

  const abas = [
    { id: "agenda", nome: "Agenda", icon: CalendarDays },
    { id: "pacientes", nome: "Pacientes", icon: UsersRound },
    { id: "relatorios", nome: "Relatórios", icon: FileText },
  ];

  return (
    <div className={`pm-preview ${grande ? "pm-preview-large" : ""}`}>
      <div className="pm-preview-topbar">
        <div className="pm-window-dots">
          <span />
          <span />
          <span />
        </div>

        <span className="pm-preview-topbar-title">
          ProFlex / Prévia do produto
        </span>

        <span className="pm-preview-demo-label">
          Demonstração ilustrativa
        </span>
      </div>

      <div className="pm-preview-layout">
        <aside className="pm-preview-sidebar">
          <div className="pm-preview-sidebar-brand">
            <Activity size={20} />
            <strong>ProFlex</strong>
          </div>

          <div className="pm-preview-sidebar-caption">ESPAÇO DE TRABALHO</div>

          {abas.map((item) => {
            const Icone = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                className={`pm-preview-navitem ${
                  aba === item.id ? "pm-preview-navitem-active" : ""
                }`}
                onClick={() => setAba(item.id)}
              >
                <Icone size={17} />
                {item.nome}
              </button>
            );
          })}

          <div className="pm-preview-sidebar-bottom">
            <ShieldCheck size={16} />
            Ambiente ilustrativo
          </div>
        </aside>

        <div className="pm-preview-content">
          <div className="pm-preview-heading">
            <div>
              <div className="pm-preview-eyebrow">
                Visão geral / {abas.find((item) => item.id === aba)?.nome}
              </div>
              <h3>
                {aba === "agenda"
                  ? "Minha agenda"
                  : aba === "pacientes"
                  ? "Meus pacientes"
                  : "Relatórios"}
              </h3>
              <p>
                {aba === "agenda"
                  ? "Uma visão clara da rotina de atendimentos."
                  : aba === "pacientes"
                  ? "Informações organizadas em um único espaço."
                  : "Registros preparados para acompanhamento."}
              </p>
            </div>

            <div className="pm-preview-date">
              <CalendarDays size={15} />
              Exemplo de visualização
            </div>
          </div>

          {aba === "agenda" && (
            <>
              <div className="pm-preview-stats">
                <div>
                  <span>Atendimentos</span>
                  <strong>08</strong>
                  <small>Exemplo</small>
                </div>
                <div>
                  <span>Confirmados</span>
                  <strong>05</strong>
                  <small>Exemplo</small>
                </div>
                <div>
                  <span>Em aberto</span>
                  <strong>03</strong>
                  <small>Exemplo</small>
                </div>
              </div>

              <div className="pm-preview-panel">
                <div className="pm-preview-panel-heading">
                  <strong>Próximos atendimentos</strong>
                  <span>Agenda ilustrativa</span>
                </div>

                {agendaExemplo.map((item) => (
                  <div className="pm-appointment" key={item.hora}>
                    <div className="pm-appointment-time">
                      {item.hora}
                    </div>

                    <div className="pm-appointment-avatar">
                      <UserRound size={17} />
                    </div>

                    <div className="pm-appointment-info">
                      <strong>{item.nome}</strong>
                      <span>{item.tipo}</span>
                    </div>

                    <span
                      className={`pm-status pm-status-${item.cor}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {aba === "pacientes" && (
            <div className="pm-preview-panel">
              <div className="pm-preview-panel-heading">
                <strong>Lista de pacientes</strong>
                <span>Dados fictícios</span>
              </div>

              <div className="pm-preview-search">
                <Search size={16} />
                Buscar paciente
              </div>

              {[
                ["Paciente demonstrativo 01", "Avaliação inicial"],
                ["Paciente demonstrativo 02", "Acompanhamento"],
                ["Paciente demonstrativo 03", "Retorno"],
              ].map(([nomePaciente, tipo], index) => (
                <div className="pm-patient-row" key={nomePaciente}>
                  <div className="pm-appointment-avatar">
                    <UserRound size={17} />
                  </div>

                  <div className="pm-appointment-info">
                    <strong>{nomePaciente}</strong>
                    <span>{tipo}</span>
                  </div>

                  <span className="pm-patient-id">
                    #{String(index + 1).padStart(3, "0")}
                  </span>
                </div>
              ))}
            </div>
          )}

          {aba === "relatorios" && (
            <div className="pm-preview-panel pm-report-preview">
              <div className="pm-report-icon">
                <FileText size={29} />
              </div>

              <h4>Relatório de atendimento</h4>

              <p>
                Exemplo de organização de informações para um
                documento profissional.
              </p>

              <div className="pm-report-line pm-report-line-long" />
              <div className="pm-report-line" />
              <div className="pm-report-line pm-report-line-medium" />

              <div className="pm-report-footer">
                <CheckCircle2 size={16} />
                Modelo ilustrativo de documento
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SecaoTitulo({ etiqueta, titulo, descricao }) {
  return (
    <div className="pm-section-heading">
      <span className="pm-eyebrow">{etiqueta}</span>
      <h2>{titulo}</h2>
      {descricao && <p>{descricao}</p>}
    </div>
  );
}

function PerguntasFrequentes() {
  const [aberta, setAberta] = useState(0);

  return (
    <div className="pm-faq-list">
      {perguntas.map((item, index) => (
        <div
          key={item.pergunta}
          className={`pm-faq-item ${
            aberta === index ? "pm-faq-item-open" : ""
          }`}
        >
          <button
            type="button"
            className="pm-faq-question"
            onClick={() =>
              setAberta(aberta === index ? -1 : index)
            }
            aria-expanded={aberta === index}
          >
            <span>{item.pergunta}</span>
            <ChevronDown size={20} />
          </button>

          {aberta === index && (
            <div className="pm-faq-answer">
              {item.resposta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Marketing() {
  return (
    <div className="pm-page">
      <Cabecalho />

      <main>
        {/* APRESENTAÇÃO PRINCIPAL */}
        <section className="pm-hero">
          <div className="pm-hero-glow pm-hero-glow-one" />
          <div className="pm-hero-glow pm-hero-glow-two" />

          <div className="pm-container pm-hero-grid">
            <div className="pm-hero-copy">
              <div className="pm-hero-label">
                <Sparkles size={15} />
                Gestão de atendimentos para profissionais da saúde
              </div>

              <h1>
                Mais organização.
                <br />
                Mais tempo para
                <br />
                <span>cuidar de pessoas.</span>
              </h1>

              <p className="pm-hero-description">
                Conheça o ProFlex, uma plataforma desenvolvida
                para reunir agenda, pacientes, registros de
                atendimento e relatórios em uma experiência
                simples, moderna e profissional.
              </p>

              <div className="pm-hero-actions">
                <Link
                  to="/cadastro"
                  className="pm-btn pm-btn-primary pm-btn-large"
                >
                  Conhecer o cadastro
                  <ArrowRight size={19} />
                </Link>

                <a
                  href="#demonstracao"
                  className="pm-btn pm-btn-outline pm-btn-large"
                >
                  Explorar o sistema
                </a>
              </div>

              <div className="pm-hero-highlights">
                <span>
                  <CheckCircle2 size={17} />
                  Para autônomos
                </span>
                <span>
                  <CheckCircle2 size={17} />
                  Para clínicas
                </span>
                <span>
                  <CheckCircle2 size={17} />
                  Para diferentes especialidades
                </span>
              </div>

              <p className="pm-development-note">
                Plataforma em desenvolvimento. Prévia ilustrativa.
              </p>
            </div>

            <div className="pm-hero-visual">
              <div className="pm-hero-visual-glow" />
              <PreviewSistema />

              <div className="pm-floating-card">
                <div className="pm-floating-icon">
                  <CalendarCheck2 size={21} />
                </div>
                <div>
                  <strong>Rotina mais organizada</strong>
                  <span>Informações em um só lugar</span>
                </div>
                <CheckCircle2 size={20} className="pm-floating-check" />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="pm-section" id="beneficios">
          <div className="pm-container">
            <SecaoTitulo
              etiqueta="POR QUE PROFLEX?"
              titulo="Menos tarefas espalhadas. Mais controle sobre sua rotina."
              descricao="Um espaço pensado para reduzir a desorganização do dia a dia e ajudar você a concentrar sua atenção no atendimento."
            />

            <div className="pm-benefits-grid">
              {beneficios.map((item) => {
                const Icone = item.icon;

                return (
                  <article className="pm-benefit-card" key={item.titulo}>
                    <div className="pm-benefit-icon">
                      <Icone size={25} strokeWidth={1.8} />
                    </div>
                    <h3>{item.titulo}</h3>
                    <p>{item.descricao}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* DEMONSTRAÇÃO */}
        <section
          className="pm-section pm-demo-section"
          id="demonstracao"
        >
          <div className="pm-container">
            <SecaoTitulo
              etiqueta="CONHEÇA A EXPERIÊNCIA"
              titulo="Veja como sua rotina pode ficar mais simples."
              descricao="Explore uma representação visual das áreas de agenda, pacientes e relatórios. Clique nas opções para conhecer a proposta da plataforma."
            />

            <div className="pm-demo-showcase">
              <PreviewSistema grande />
            </div>

            <p className="pm-demo-disclaimer">
              As telas acima são ilustrações da experiência
              proposta, não uma demonstração conectada ao sistema
              real. Os dados exibidos são fictícios.
            </p>
          </div>
        </section>

        {/* PROFISSÕES */}
        <section className="pm-section" id="profissionais">
          <div className="pm-container">
            <SecaoTitulo
              etiqueta="FEITO PARA SUA ÁREA"
              titulo="Diferentes profissões. Uma rotina mais organizada."
              descricao="O ProFlex está sendo pensado para atender diferentes especialidades e formas de trabalho na área da saúde."
            />

            <div className="pm-professions-grid">
              {profissoes.map((item) => {
                const Icone = item.icon;

                return (
                  <div className="pm-profession-card" key={item.nome}>
                    <div className="pm-profession-icon">
                      <Icone size={25} strokeWidth={1.8} />
                    </div>
                    <strong>{item.nome}</strong>
                  </div>
                );
              })}
            </div>

            <p className="pm-professions-note">
              A disponibilidade de recursos específicos por
              profissão será definida conforme a evolução do produto.
            </p>
          </div>
        </section>

        {/* PERFIS */}
        <section className="pm-section pm-profiles-section" id="perfis">
          <div className="pm-container">
            <SecaoTitulo
              etiqueta="UM SISTEMA FLEXÍVEL"
              titulo="O ProFlex acompanha a forma como você trabalha."
              descricao="Escolha o perfil que melhor representa sua atividade profissional."
            />

            <div className="pm-profiles-grid">
              {perfis.map((perfil, index) => {
                const Icone = perfil.icon;

                return (
                  <article
                    key={perfil.titulo}
                    className={`pm-profile-card ${
                      index === 1 ? "pm-profile-featured" : ""
                    }`}
                  >
                    {index === 1 && (
                      <span className="pm-profile-tag">
                        Gestão de equipes
                      </span>
                    )}

                    <div className="pm-profile-icon">
                      <Icone size={27} />
                    </div>

                    <h3>{perfil.titulo}</h3>
                    <p>{perfil.descricao}</p>

                    <ul>
                      {perfil.itens.map((item) => (
                        <li key={item}>
                          <Check size={17} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link to="/cadastro" className="pm-profile-link">
                      Conhecer este perfil
                      <ArrowRight size={17} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* POSICIONAMENTO */}
        <section className="pm-section pm-value-section">
          <div className="pm-container pm-value-grid">
            <div className="pm-value-copy">
              <span className="pm-eyebrow">UMA NOVA FORMA DE ORGANIZAR</span>

              <h2>
                Sua dedicação merece ferramentas à altura.
              </h2>

              <p>
                Seu trabalho exige atenção, responsabilidade e
                organização. O ProFlex nasce com a proposta de
                facilitar a gestão da rotina para que a tecnologia
                seja uma aliada, não mais uma preocupação.
              </p>

              <div className="pm-value-list">
                <div>
                  <span><Clock3 size={20} /></span>
                  <div>
                    <strong>Mais clareza no dia a dia</strong>
                    <p>
                      Visualize informações importantes de forma
                      organizada.
                    </p>
                  </div>
                </div>

                <div>
                  <span><LayoutDashboard size={20} /></span>
                  <div>
                    <strong>Uma experiência intuitiva</strong>
                    <p>
                      Encontre o que precisa com uma navegação
                      prática.
                    </p>
                  </div>
                </div>

                <div>
                  <span><ShieldCheck size={20} /></span>
                  <div>
                    <strong>Privacidade como prioridade</strong>
                    <p>
                      Segurança e controle de acesso são requisitos
                      fundamentais do desenvolvimento.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pm-value-visual">
              <div className="pm-value-visual-inner">
                <div className="pm-value-mini-header">
                  <div className="pm-value-mini-icon">
                    <Activity size={21} />
                  </div>
                  <span>Organização profissional</span>
                </div>

                <div className="pm-value-feature">
                  <div className="pm-value-feature-icon">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <strong>Agenda</strong>
                    <span>Compromissos organizados</span>
                  </div>
                  <CheckCircle2 size={20} />
                </div>

                <div className="pm-value-feature">
                  <div className="pm-value-feature-icon">
                    <UsersRound size={22} />
                  </div>
                  <div>
                    <strong>Pacientes</strong>
                    <span>Informações centralizadas</span>
                  </div>
                  <CheckCircle2 size={20} />
                </div>

                <div className="pm-value-feature">
                  <div className="pm-value-feature-icon">
                    <FileText size={22} />
                  </div>
                  <div>
                    <strong>Registros</strong>
                    <span>Histórico de atendimentos</span>
                  </div>
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pm-section pm-faq-section" id="perguntas">
          <div className="pm-container pm-faq-container">
            <SecaoTitulo
              etiqueta="PERGUNTAS FREQUENTES"
              titulo="Tudo o que você precisa saber."
              descricao="Conheça melhor a proposta do ProFlex e o estágio atual de desenvolvimento."
            />

            <PerguntasFrequentes />
          </div>
        </section>

        {/* CHAMADA FINAL */}
        <section className="pm-final-section">
          <div className="pm-container">
            <div className="pm-final-card">
              <div className="pm-final-glow" />

              <div className="pm-final-content">
                <span className="pm-final-label">
                  <Sparkles size={16} />
                  CONHEÇA O PROFLEX
                </span>

                <h2>
                  Seu próximo passo para uma rotina mais organizada.
                </h2>

                <p>
                  Conheça a proposta do ProFlex e explore as
                  possibilidades de uma gestão de atendimentos
                  mais moderna.
                </p>

                <Link
                  to="/cadastro"
                  className="pm-btn pm-btn-white pm-btn-large"
                >
                  Conhecer o cadastro
                  <ArrowRight size={19} />
                </Link>

                <small>
                  Cadastro em desenvolvimento. Ainda não realiza
                  contratação.
                </small>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="pm-footer">
        <div className="pm-container">
          <div className="pm-footer-main">
            <div className="pm-footer-brand">
              <Logo />
              <p>
                Tecnologia pensada para simplificar a organização
                de atendimentos na área da saúde.
              </p>
            </div>

            <div className="pm-footer-links">
              <strong>Explore</strong>
              <a href="#beneficios">Benefícios</a>
              <a href="#demonstracao">Conheça o sistema</a>
              <a href="#profissionais">Profissionais</a>
              <a href="#perfis">Modalidades</a>
            </div>

            <div className="pm-footer-links">
              <strong>Informações</strong>
              <a href="#perguntas">Perguntas frequentes</a>
              <Link to="/cadastro">Cadastro</Link>
            </div>
          </div>

          <div className="pm-footer-bottom">
            <span>
              © {new Date().getFullYear()} ProFlex.
              Todos os direitos reservados.
            </span>
            <span>
              Plataforma em desenvolvimento.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
