import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Agenda() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [weather, setWeather] = useState("Carregando...");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia ☀️");
    else if (hour < 18) setGreeting("Boa tarde 🌤️");
    else setGreeting("Boa noite 🌙");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
          .then(res => res.json())
          .then(data => {
            const w = data.current_weather;
            setWeather(`${w.temperature}°C, ${w.weathercode === 0 ? 'Céu limpo' : 'Tempo instável'}`);
          })
          .catch(() => setWeather("Erro ao carregar"));
      }, () => setWeather("Localização negada"));
    } else {
      setWeather("Geolocalização não suportada");
    }
  }, []);

  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const hourBlocks = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  const handleHourClick = (hour) => {
    const date = selectedDate.toISOString().split("T")[0];
    navigate(`/agenda/novo?data=${date}&hora=${hour}`);
  };

  return (
    
    <div className="min-vh-100 bg-light">
      {/* Header fixo com fundo azul */}
      <header className="bg-primary text-white py-3 mb-0">
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="h4 m-0">ProFlex</h1>
         <nav className="d-flex gap-3">
  <button className="btn btn-link text-white text-decoration-none fw-semibold opacity-100" onClick={() => navigate("/")}>
    Home
  </button>
  <button className="btn btn-link text-white text-decoration-none fw-semibold opacity-100" onClick={() => navigate("/agenda")}>
    Agenda
  </button>
  <button className="btn btn-link text-white text-decoration-none fw-semibold opacity-100" onClick={() => navigate("/clientes")}>
    Clientes
  </button>
</nav>
        </div>
      </header>

      {/* Saudação, data e tempo */}
      <div className="text-center p-4">
        <h4>{greeting}</h4>
        <p className="text-white bg-primary d-inline-block px-3 py-1 rounded">Hoje é {formattedDate}</p>
        <p className="text-info">🌦️ Previsão do tempo: {weather}</p>
        <input
          type="date"
          className="form-control w-auto mx-auto my-3"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>

      {/* Horários disponíveis */}
      <div className="container pb-5">
        <h5 className="mb-3">Horários disponíveis:</h5>
        <div className="row row-cols-2 row-cols-md-3 g-3">
          {hourBlocks.map((hour) => (
            <div key={hour} className="col">
              <div
                className="p-3 text-center shadow-sm border border-secondary rounded bg-white cursor-pointer"
                style={{ minHeight: "60px" }}
                onClick={() => handleHourClick(hour)}
              >
                {hour}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé */}
      <footer className="text-center text-muted py-4 border-top">
        <p>🕒 Agora: {new Date().toLocaleTimeString("pt-BR")}</p>
      </footer>
    </div>
  );
}
