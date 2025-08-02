import React, { useState } from "react";
import NovoAgendamento from "../components/NovoAgendamento";
import { useSearchParams } from "react-router-dom";

export default function AgendamentoPage() {
  const [params] = useSearchParams();
  const dataSelecionada = params.get("data");
  const horaSelecionada = params.get("hora");

  const [usuario, setUsuario] = useState({
    nome: "",
    email: "",
    telefone: "",
    // ...outros campos se precisar
  });

  return (
    <div className="container py-4">
      <h3 className="mb-4">Agendamento</h3>
      <p><strong>Data:</strong> {dataSelecionada} | <strong>Hora:</strong> {horaSelecionada}</p>

      <NovoAgendamento usuario={usuario} setUsuario={setUsuario} />
    </div>
  );
}
