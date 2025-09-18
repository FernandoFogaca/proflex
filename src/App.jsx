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
import Emails from "./pages/Emails";              
import { AppProvider } from "./context/AppContext.jsx";
import ProtectedRoute from "./authentication/ProtectedRoute";
import News from "./pages/News.jsx";

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
        <Route path="/news" element={<News />} />

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
        <Route
          path="/emails"                          
          element={<ProtectedRoute><Emails /></ProtectedRoute>}
        />
      </Routes>
    </AppProvider>
  );
}
