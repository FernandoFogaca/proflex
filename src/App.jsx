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
import { AppProvider } from "./context/AppContext.jsx"; // ⬅️

export default function App() {
  return (
    <AppProvider> {/* ⬅️ obrigatório p/ useApp funcionar */}
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/devlogin" element={<DevLogin />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/agendar" element={<AgendamentoPage />} /> {/* ⬅️ página usa o componente */}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/compromissos" element={<Compromissos />} />
      </Routes>
    </AppProvider>
  );
}
