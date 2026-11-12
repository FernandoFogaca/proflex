import { Routes, Route } from "react-router-dom";
import OwnerRoute from "./authentication/OwnerRoute";
import Header from "./components/Header";
import PageHeader from "./components/PageHeader";
import Team from "./pages/Team.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro.jsx";
import Agenda from "./pages/Agenda";
import AgendamentoPage from "./pages/AgendamentoPage.jsx";
import Clientes from "./pages/Clientes";
import Marketing from "./components/Marketing";
import DevLogin from "./components/DevLogin";
import Compromissos from "./pages/Compromissos";
import Prontuario from "./pages/Prontuario";
import Dashboard from "./pages/Dashboard";
import Consulta from "./pages/Consulta";
import AdminPremium from "./pages/AdminPremium.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import ProtectedRoute from "./authentication/ProtectedRoute";

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <div
        style={{
          maxWidth: 1480,
          margin: "0 auto",
          padding: "26px 20px 0",
        }}
      >
        <PageHeader />
      </div>

      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Header />

      <Routes>
        {/* PUBLIC PAGES */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/devlogin" element={<DevLogin />} />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-premium"
          element={
            <OwnerRoute>
              <AdminPremium />
            </OwnerRoute>
          }
        />

        {/* AGENDA - WITHOUT DUPLICATE HEADER */}

        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          }
        />

        {/* OTHER PROTECTED PAGES WITH PREMIUM HEADER */}

        <Route
          path="/agendar"
          element={
            <ProtectedPage>
              <AgendamentoPage />
            </ProtectedPage>
          }
        />

        <Route
          path="/clientes"
          element={
            <ProtectedPage>
              <Clientes />
            </ProtectedPage>
          }
        />

        <Route
          path="/compromissos"
          element={
            <ProtectedPage>
              <Compromissos />
            </ProtectedPage>
          }
        />

        <Route
          path="/prontuario"
          element={
            <ProtectedPage>
              <Prontuario />
            </ProtectedPage>
          }
        />
        <Route
          path="/team"
          element={
            <OwnerRoute>
              <Team />
            </OwnerRoute>
          }
        />

        <Route
          path="/consulta"
          element={
            <ProtectedPage>
              <Consulta />
            </ProtectedPage>
          }
        />
      </Routes>
    </AppProvider>
  );
}
