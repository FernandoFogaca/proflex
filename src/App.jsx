import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import DevLogin from "./components/DevLogin";
import Header from "./components/Header";
import Login from "./pages/Login";
import Agenda from "./pages/Agenda";

export default function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/" && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/devlogin" element={<DevLogin />} />
         <Route path="/agenda" element={<Agenda />} />
      </Routes>
    </>
  );
}
