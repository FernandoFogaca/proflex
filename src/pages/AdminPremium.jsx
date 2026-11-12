
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UsersRound,
  ChartNoAxesCombined,
  History,
  ShieldCheck,
  Building2,
  Settings,
  ArrowLeft,
  Crown,
} from "lucide-react";

import Team from "./Team.jsx";
import "./AdminPremium.css";

const menuItems = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "team", label: "Equipe", icon: UsersRound },
  { id: "performance", label: "Produtividade", icon: ChartNoAxesCombined },
  { id: "history", label: "Histórico", icon: History },
  { id: "access", label: "Acessos e permissões", icon: ShieldCheck },
  { id: "units", label: "Unidades", icon: Building2 },
  { id: "settings", label: "Configurações", icon: Settings },
];

export default function AdminPremium() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const currentItem = menuItems.find(
    (item) => item.id === activeTab
  );

  return (
    <div className="admin-premium">
      <aside className="admin-premium-sidebar">
        <div className="admin-premium-brand">
          <Crown size={22} />
          <div>
            <strong>ProFlex Premium</strong>
            <small>Central Administrativa</small>
          </div>
        </div>

        <nav aria-label="Menu da administração Premium">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={
                activeTab === id
                  ? "admin-premium-nav active"
                  : "admin-premium-nav"
              }
              onClick={() => setActiveTab(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="admin-premium-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Voltar ao Home
        </button>
      </aside>

      <main className="admin-premium-content">
        <div className="admin-premium-heading">
          <small>PROFLEX / ADMINISTRAÇÃO PREMIUM</small>
          <h1>{currentItem.label}</h1>
          <p>Gestão inteligente, organizada e segura.</p>
        </div>

        {activeTab === "overview" && (
          <div className="admin-premium-grid">
            <article>
              <UsersRound />
              <h3>Equipe</h3>
              <p>Cadastros e profissionais da clínica.</p>
              <button onClick={() => setActiveTab("team")}>
                Gerenciar equipe
              </button>
            </article>

            <article>
              <ChartNoAxesCombined />
              <h3>Produtividade</h3>
              <p>Consultas, agendamentos e dias trabalhados.</p>
              <button onClick={() => setActiveTab("performance")}>
                Ver indicadores
              </button>
            </article>

            <article>
              <History />
              <h3>Histórico</h3>
              <p>Atividades e alterações registradas.</p>
              <button onClick={() => setActiveTab("history")}>
                Consultar histórico
              </button>
            </article>

            <article>
              <ShieldCheck />
              <h3>Segurança</h3>
              <p>Permissões e controle de acessos.</p>
              <button onClick={() => setActiveTab("access")}>
                Ver acessos
              </button>
            </article>
          </div>
        )}

        {activeTab === "team" && <Team />}

        {activeTab === "performance" && (
          <section className="admin-premium-panel">
            <h2>Produtividade da equipe</h2>
            <p>
              Aqui vamos apresentar os indicadores reais de
              consultas, agendamentos e dias trabalhados.
            </p>
          </section>
        )}

        {activeTab === "history" && (
          <section className="admin-premium-panel">
            <h2>Histórico de atividades</h2>
            <p>
              Aqui ficarão os registros de atividades e
              alterações realizadas pelos profissionais.
            </p>
          </section>
        )}

        {activeTab === "access" && (
          <section className="admin-premium-panel">
            <h2>Acessos e permissões</h2>
            <p>
              Controle de permissões, sessões e segurança
              dos profissionais.
            </p>
          </section>
        )}

        {activeTab === "units" && (
          <section className="admin-premium-panel">
            <h2>Unidades da clínica</h2>
            <p>Cadastro e organização das unidades.</p>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="admin-premium-panel">
            <h2>Configurações administrativas</h2>
            <p>Preferências e regras da organização.</p>
          </section>
        )}
      </main>
    </div>
  );
}
