import React from "react";
import AvaliacaoUsuario from "./AvaliacaoUsuario";

export default function Marketing() {
  return (
    <div className="container py-5">

      {/* Título principal */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">Conheça o ProFlex</h1>
        <p
          style={{
            fontSize: "1.2rem",
            fontWeight: 400,
            color: "#444",
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "0.5px",
            lineHeight: "1.6",
            marginTop: "-10px"
          }}
        >
          Organize seus atendimentos com inteligência, sem papelada, sem confusão.
        </p>
        <button className="btn btn-primary px-4 py-2 mt-3">Assine Já</button>
      </div>

      {/* Seção de Benefícios */}
      <div className="mb-4">
        <h2 className="text-center fw-semibold mb-4">Por que escolher o ProFlex?</h2>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {/* Card 1 */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Agenda organizada sem papel
                </h5>
                <p className="card-text">
                  Antes eu esquecia cliente ou me enrolava com horário. Agora tá tudo num só lugar, rápido e visual.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Cliente recebe lembrete automático
                </h5>
                <p className="card-text">
                  O sistema manda aviso por WhatsApp ou e-mail, e o cliente lembra do horário. Quase ninguém falta mais.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Mais profissionalismo no atendimento
                </h5>
                <p className="card-text">
                  O cliente sente que você é organizado. Isso passa confiança e dá outra imagem do seu trabalho.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Tudo acessível no celular ou computador
                </h5>
                <p className="card-text">
                  Você pode acessar seus agendamentos de onde estiver. Não depende de caderno, agenda ou lembrança.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 - Persuasivo */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Seu negócio mais moderno e lucrativo
                </h5>
                <p className="card-text">
                  Profissionais que usam o ProFlex ganham mais tempo, fidelizam clientes e passam uma imagem moderna,  seu serviço merece essa evolução.
                </p>
              </div>
            </div>
          </div>

          {/* Card 6 - Impactante */}
          <div className="col">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-semibold" style={{ color: "#4390a1" }}>
                  Não fique para trás no mercado
                </h5>
                <p className="card-text">
                  Seus concorrentes estão evoluindo. Com o ProFlex, você mostra profissionalismo, gera confiança e transforma agendamentos em fidelização real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avaliacao */}
      <AvaliacaoUsuario />

    </div>
  );
}
