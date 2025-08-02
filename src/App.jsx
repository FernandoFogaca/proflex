import { Routes, Route, useLocation } from "react-router-dom";
import Marketing from "./components/Marketing";
import Home from "./pages/Home";
import DevLogin from "./components/DevLogin";
import Header from "./components/Header";
import Login from "./pages/Login";
import Agenda from "./pages/Agenda";
import AgendamentoPage from "./pages/AgendamentoPage";


export default function App() {
  const location = useLocation();

  return (
    <>
       <Header />

      <Routes>
        <Route path="/agendar" element={<AgendamentoPage />} />
        <Route path="/marketing" element={<Marketing/>}  />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/devlogin" element={<DevLogin />} />
         
      </Routes>
    </>
  );
}
