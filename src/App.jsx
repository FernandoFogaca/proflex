import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DevLogin from "./components/DevLogin";
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/devlogin" element={<DevLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
