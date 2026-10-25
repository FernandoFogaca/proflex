import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function Consulta() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { getClient, addConsulta } = useApp();

  const clienteId = params.get("clienteId");
  const paciente = clienteId ? getClient(clienteId) : null;

  const [queixa, setQueixa] = useState("");
  const [avaliacao, setAvaliacao] = useState("");
  const [procedimentos, setProcedimentos] = useState("");
  const [evolucao, setEvolucao] = useState("");
  const [conduta, setConduta] = useState("");

  if (!paciente) {
    return (
      <div className="container py-4">
        <h3>Consulta</h3>

        <div className="alert alert-warning">
          Paciente não encontrado.
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/prontuario")}
        >
          Voltar para prontuários
        </button>
      </div>
    );
  }

  const salvarConsulta = (e) => {
    e.preventDefault();

    const agora = new Date();

    addConsulta(paciente.id, {
      dataISO: agora.toISOString().slice(0, 10),
      hora: agora.toTimeString().slice(0, 5),
      queixa: queixa.trim(),
      avaliacao: avaliacao.trim(),
      procedimentos: procedimentos.trim(),
      evolucao: evolucao.trim(),
      conduta: conduta.trim(),
      texto: "",
    });

    navigate(`/prontuario?clienteId=${paciente.id}`);
  };

  return (
    <div className="container py-4">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary mb-3"
        onClick={() =>
          navigate(`/prontuario?clienteId=${paciente.id}`)
        }
      >
        ← Voltar ao prontuário
      </button>

      <div className="mb-4">
        <h2 className="mb-1">Consulta</h2>

        <div className="text-muted">
          <strong>{paciente.nome}</strong>
        </div>
      </div>

      <form onSubmit={salvarConsulta}>
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Queixa principal
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Descreva a queixa principal do paciente..."
                value={queixa}
                onChange={(e) => setQueixa(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Avaliação
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Registre os achados da avaliação..."
                value={avaliacao}
                onChange={(e) => setAvaliacao(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Procedimentos realizados
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Registre os procedimentos realizados..."
                value={procedimentos}
                onChange={(e) => setProcedimentos(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Evolução do paciente
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Descreva a evolução observada nesta sessão..."
                value={evolucao}
                onChange={(e) => setEvolucao(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Conduta / Plano
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Registre a conduta e o plano para as próximas sessões..."
                value={conduta}
                onChange={(e) => setConduta(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate(`/prontuario?clienteId=${paciente.id}`)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="proflex-button"
              >
                Salvar consulta
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}