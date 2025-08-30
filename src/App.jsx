import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Agenda from "./pages/Agenda";
import AgendamentoPage from "./pages/AgendamentoPage.jsx";
import Clientes from "./pages/Clientes";
import Marketing from "./components/Marketing";
import DevLogin from "./components/DevLogin";
import Compromissos from "./pages/Compromissos";
import { AppProvider } from "./context/AppContext.jsx";
import ProtectedRoute from "./authentication/ProtectedRoute"; // << guarda

export default function App() {
  return (
    <AppProvider>
      <Header />
      <Routes>
        {/* públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/devlogin" element={<DevLogin />} />

        {/* protegidas */}
        <Route
          path="/agenda"
          element={<ProtectedRoute><Agenda /></ProtectedRoute>}
        />
        <Route
          path="/agendar"
          element={<ProtectedRoute><AgendamentoPage /></ProtectedRoute>}
        />
        <Route
          path="/clientes"
          element={<ProtectedRoute><Clientes /></ProtectedRoute>}
        />
        <Route
          path="/compromissos"
          element={<ProtectedRoute><Compromissos /></ProtectedRoute>}
        />
      </Routes>
    </AppProvider>
  );
}
