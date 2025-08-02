import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import LembretesDoDia from "../components/LembretesDoDia";

export default function Agenda() {
  const navigate = useNavigate();

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [saudacao, setSaudacao] = useState("");
  const [tempo, setTempo] = useState("Carregando...");

  const [horarios, setHorarios] = useState([
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00"
  ]);

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao("Bom dia ☀️");
    else if (hora < 18) setSaudacao("Boa tarde 🌤️");
    else setSaudacao("Boa noite 🌙");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`)
          .then((res) => res.json())
          .then((dados) => {
            const clima = dados.current_weather;
            const texto = `${clima.temperature}°C, ${
              clima.weathercode === 0 ? "Céu limpo" : "Tempo instável"
            }`;
            setTempo(texto);
          })
          .catch(() => setTempo("Erro ao carregar"));
      }, () => setTempo("Localização negada"));
    } else {
      setTempo("Geolocalização não suportada");
    }
  }, []);

  const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  function abrirAgenda(hora) {
    const data = dataSelecionada.toISOString().split("T")[0];
    navigate(`/agendar?data=${data}&hora=${hora}`);
  }

  function adicionarHorarioManual() {
    const hora = prompt("Digite a hora (ex: 17)");
    const minuto = prompt("Digite os minutos (ex: 30)");

    if (hora !== null && minuto !== null) {
      const h = hora.padStart(2, "0");
      const m = minuto.padStart(2, "0");
      const novoHorario = `${h}:${m}`;
      if (!horarios.includes(novoHorario)) {
        setHorarios([...horarios, novoHorario]);
      }
    }
  }

  function removerHorario(horario) {
    const confirmar = window.confirm(`Deseja realmente remover o horário ${horario}?`);
    if (confirmar) {
      setHorarios(horarios.filter((h) => h !== horario));
    }
  }

  return (
    <div className="min-vh-100 bg-light">
     

      {/* Saudação, data e tempo */}
      <div className="text-center p-4">
        <h4>{saudacao}</h4>
        <p className="text-white bg-primary d-inline-block px-3 py-1 rounded">
          Hoje é {dataFormatada}
        </p>
        <p className="text-info">🌦️ Previsão do tempo: {tempo}</p>
        <input
          type="date"
          className="form-control w-auto mx-auto my-3"
          value={dataSelecionada.toISOString().split("T")[0]}
          onChange={(e) => setDataSelecionada(new Date(e.target.value))}
        />
      </div>

      {/* Display dos lembretes do dia */}
      <LembretesDoDia data={dataSelecionada.toISOString().split("T")[0]} />

      <div className="container pb-5">
        <h5 className="mb-3">Horários disponíveis:</h5>
        <div className="row row-cols-2 row-cols-md-3 g-3">
          {horarios.map((hora) => (
            <div key={hora} className="col">
              <div
                className="p-3 text-center shadow-sm border border-secondary rounded bg-white cursor-pointer position-relative"
                style={{ minHeight: "60px" }}
                onClick={() => abrirAgenda(hora)}
              >
                {hora}
                <button
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removerHorario(hora);
                  }}
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button className="proflex-button" onClick={adicionarHorarioManual}>
            ➕ Adicionar outro horário
          </button>
        </div>
      </div>

      <footer className="text-center text-muted py-4 border-top">
        <p>🕒 Agora: {new Date().toLocaleTimeString("pt-BR")}</p>
      </footer>
    </div>
  );
}
