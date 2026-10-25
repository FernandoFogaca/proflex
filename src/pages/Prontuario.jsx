import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { jsPDF } from "jspdf";

export default function Prontuario() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clients, getClient } = useApp();

  const clienteId = params.get("clienteId");
  const paciente = clienteId ? getClient(clienteId) : null;

  const [aba, setAba] = useState("resumo");
  const [busca, setBusca] = useState("");
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  const pacientesFiltrados = (clients || []).filter((paciente) => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return true;

    return [paciente.nome, paciente.telefone, paciente.email, paciente.cpf]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(termo);
  });
  const gerarProntuarioPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;

    let y = 50;

    const checkPage = (space = 40) => {
      if (y + space > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }
    };

    const addTitle = (text) => {
      checkPage(45);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(text, margin, y);
      y += 22;
    };

    const addText = (label, value) => {
      checkPage();

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);

      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(
        value || "Não informado",
        contentWidth - 120,
      );

      doc.text(lines, margin + 120, y);

      y += Math.max(18, lines.length * 13);
    };

    const formatList = (items) =>
      Array.isArray(items) && items.length
        ? items.join(", ")
        : "Nenhuma registrada";

    // Cabeçalho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ProFlex", margin, y);

    y += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PRONTUÁRIO DO PACIENTE", margin, y);

    y += 12;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);

    y += 28;

    // Paciente
    addTitle("Identificação do paciente");

    addText("Nome", paciente.nome);
    addText("Nascimento", paciente.nascimento);
    addText("Telefone", paciente.telefone);
    addText("E-mail", paciente.email);
    addText("Endereço", paciente.endereco);

    y += 15;

    // Dados clínicos
    addTitle("Dados clínicos");

    addText("Peso", paciente.peso ? `${paciente.peso} kg` : "");
    addText("Altura", paciente.altura ? `${paciente.altura} cm` : "");
    addText("Gênero", paciente.genero);

    addText("Comorbidades", formatList(paciente.comorbidades));

    addText("Musculoesqueléticas", formatList(paciente.doencasExtras));

    addText("Neurológicas", formatList(paciente.doencasNeurologicas));

    addText("Síndrome", paciente.sindromeDescricao);
    addText("Medicamentos", paciente.remedios);
    addText("Diagnósticos", paciente.outrosDiagnosticos);
    addText("Histórico geral", paciente.anotacoesPaciente);

    y += 15;

    // Consultas
    addTitle("Histórico de consultas");

    const consultas = paciente.consultas || [];

    if (consultas.length === 0) {
      addText("Consultas", "Nenhuma consulta registrada");
    } else {
      consultas.forEach((consulta, index) => {
        checkPage(130);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        doc.text(
          `Consulta ${consulta.numero || index + 1} — ${consulta.dataISO || "-"} ${consulta.hora || ""}`,
          margin,
          y,
        );

        y += 20;

        addText("Queixa", consulta.queixa);
        addText("Avaliação", consulta.avaliacao);
        addText("Procedimentos", consulta.procedimentos);
        addText("Evolução", consulta.evolucao);
        addText("Conduta / Plano", consulta.conduta);

        y += 12;
      });
    }

    // Rodapé final
    checkPage(50);

    y += 10;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);

    y += 18;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
      `Prontuário gerado pelo ProFlex em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      y,
    );

    // Abrir para visualização
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };
  const gerarConsultaPDF = (consulta) => {
    if (!paciente || !consulta) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    let y = 50;

    const addField = (label, value) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, margin, y);

      y += 16;

      doc.setFont("helvetica", "normal");

      const lines = doc.splitTextToSize(value || "Não informado", contentWidth);

      doc.text(lines, margin, y);

      y += lines.length * 14 + 22;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ProFlex", margin, y);

    y += 20;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("REGISTRO DE CONSULTA", margin, y);

    y += 15;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);

    y += 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(paciente.nome, margin, y);

    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`${consulta.dataISO || "-"} ${consulta.hora || ""}`, margin, y);

    y += 35;

    addField("Queixa principal", consulta.queixa);
    addField("Avaliação", consulta.avaliacao);
    addField("Procedimentos realizados", consulta.procedimentos);
    addField("Evolução", consulta.evolucao);
    addField("Conduta / Plano", consulta.conduta);

    y += 10;

    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);

    y += 18;

    doc.setFontSize(8);
    doc.text(
      `Documento gerado pelo ProFlex em ${new Date().toLocaleString("pt-BR")}`,
      margin,
      y,
    );

    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank");
  };

  if (!paciente) {
    return (
      <div className="container py-4">
        <div className="mb-4">
          <h2 className="mb-1">Prontuários</h2>
          <p className="text-muted mb-0">
            Localize um paciente para acessar o prontuário clínico.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <label className="form-label fw-semibold">Buscar paciente</label>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="Nome, telefone, e-mail ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <div className="list-group">
              {pacientesFiltrados.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => navigate(`/prontuario?clienteId=${item.id}`)}
                >
                  <div>
                    <div className="fw-semibold">{item.nome}</div>

                    <small className="text-muted">
                      {item.telefone || "Sem telefone"}
                      {item.email ? ` • ${item.email}` : ""}
                    </small>
                  </div>

                  <span>→</span>
                </button>
              ))}

              {pacientesFiltrados.length === 0 && (
                <div className="list-group-item text-muted">
                  Nenhum paciente encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container py-4">
      {/* Cabeçalho */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button
            className="btn btn-sm btn-outline-secondary mb-3"
            onClick={() => navigate("/clientes")}
          >
            ← Pacientes
          </button>

          <h2 className="mb-1">{paciente.nome}</h2>

          <div className="text-muted">
            {paciente.telefone || "Sem telefone"}
            {paciente.email ? ` • ${paciente.email}` : ""}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={gerarProntuarioPDF}
          >
            📄 Visualizar prontuário
          </button>

          <button
            type="button"
            className="proflex-button"
            onClick={() => navigate(`/consulta?clienteId=${paciente.id}`)}
          >
            + Iniciar consulta
          </button>
        </div>
      </div>

      {/* Navegação do prontuário */}
      <div className="border-bottom mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn ${aba === "resumo" ? "btn-dark" : "btn-light"}`}
            onClick={() => setAba("resumo")}
          >
            Resumo
          </button>

          <button
            className={`btn ${aba === "clinico" ? "btn-dark" : "btn-light"}`}
            onClick={() => setAba("clinico")}
          >
            Dados clínicos
          </button>

          <button
            className={`btn ${aba === "consultas" ? "btn-dark" : "btn-light"}`}
            onClick={() => setAba("consultas")}
          >
            Consultas
          </button>

          <button
            className={`btn ${aba === "evolucao" ? "btn-dark" : "btn-light"}`}
            onClick={() => setAba("evolucao")}
          >
            Evolução
          </button>

          <button
            className={`btn ${aba === "documentos" ? "btn-dark" : "btn-light"}`}
            onClick={() => setAba("documentos")}
          >
            Documentos
          </button>
        </div>
      </div>

      {/* RESUMO */}
      {aba === "resumo" && (
        <div>
          <h4 className="mb-3">Resumo do paciente</h4>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Telefone</small>
                  <div className="fw-semibold">{paciente.telefone || "-"}</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Email</small>
                  <div className="fw-semibold">{paciente.email || "-"}</div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Consultas registradas</small>

                  <div className="fs-4 fw-semibold">
                    {paciente.consultas?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DADOS CLÍNICOS */}
      {aba === "clinico" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">Dados clínicos</h4>
              <p className="text-muted mb-0">
                Informações clínicas registradas para este paciente.
              </p>
            </div>
          </div>

          <div className="row g-3">
            {/* Informações gerais */}
            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Nascimento</small>
                  <div className="fw-semibold">
                    {paciente.nascimento || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Peso</small>
                  <div className="fw-semibold">
                    {paciente.peso ? `${paciente.peso} kg` : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Altura</small>
                  <div className="fw-semibold">
                    {paciente.altura ? `${paciente.altura} cm` : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100">
                <div className="card-body">
                  <small className="text-muted">Gênero</small>
                  <div className="fw-semibold">{paciente.genero || "-"}</div>
                </div>
              </div>
            </div>

            {/* Comorbidades */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6>Comorbidades</h6>

                  {paciente.comorbidades?.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {paciente.comorbidades.map((item) => (
                        <span
                          key={item}
                          className="badge bg-light text-dark border"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Nenhuma registrada.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Musculoesqueléticas */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6>Condições musculoesqueléticas</h6>

                  {paciente.doencasExtras?.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {paciente.doencasExtras.map((item) => (
                        <span
                          key={item}
                          className="badge bg-light text-dark border"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Nenhuma registrada.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Neurológicas */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6>Condições neurológicas</h6>

                  {paciente.doencasNeurologicas?.length ? (
                    <div className="d-flex flex-wrap gap-2">
                      {paciente.doencasNeurologicas.map((item) => (
                        <span
                          key={item}
                          className="badge bg-light text-dark border"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted">Nenhuma registrada.</span>
                  )}

                  {paciente.sindromeDescricao && (
                    <div className="mt-2">
                      <strong>Síndrome:</strong> {paciente.sindromeDescricao}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="col-md-6">
              <div className="card h-100">
                <div className="card-body">
                  <h6>Medicamentos</h6>

                  <p className="mb-0">
                    {paciente.remedios || "Nenhum registrado."}
                  </p>
                </div>
              </div>
            </div>

            {/* Outros diagnósticos */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h6>Outros diagnósticos</h6>

                  <p className="mb-0">
                    {paciente.outrosDiagnosticos ||
                      "Nenhum diagnóstico adicional registrado."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CONSULTAS */}
      {aba === "consultas" && (
        <div>
          <h4 className="mb-3">Histórico de consultas</h4>

          {!paciente.consultas?.length ? (
            <p className="text-muted">Nenhuma consulta registrada.</p>
          ) : (
            <div className="list-group">
              {[...paciente.consultas].reverse().map((consulta, index) => (
                <button
                  key={consulta.id || index}
                  type="button"
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => setConsultaSelecionada(consulta)}
                >
                  <div className="text-start">
                    <div className="fw-semibold">
                      Consulta{" "}
                      {consulta.numero || paciente.consultas.length - index}
                    </div>

                    <small className="text-muted">
                      {consulta.dataISO || "-"} {consulta.hora || ""}
                    </small>
                  </div>

                  <span>Visualizar →</span>
                </button>
              ))}
            </div>
          )}

          {consultaSelecionada && (
            <>
              <div
                className="modal-backdrop show"
                onClick={() => setConsultaSelecionada(null)}
              />

              <div className="modal show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <div>
                        <h5 className="modal-title">
                          Consulta {consultaSelecionada.numero || ""}
                        </h5>

                        <small className="text-muted">
                          {consultaSelecionada.dataISO || "-"}{" "}
                          {consultaSelecionada.hora || ""}
                        </small>
                      </div>

                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setConsultaSelecionada(null)}
                      />
                    </div>

                    <div className="modal-body">
                      <div className="mb-4">
                        <h6>Queixa principal</h6>
                        <p>{consultaSelecionada.queixa || "Não informado"}</p>
                      </div>

                      <div className="mb-4">
                        <h6>Avaliação</h6>
                        <p>
                          {consultaSelecionada.avaliacao || "Não informado"}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h6>Procedimentos realizados</h6>
                        <p>
                          {consultaSelecionada.procedimentos || "Não informado"}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h6>Evolução</h6>
                        <p>{consultaSelecionada.evolucao || "Não informado"}</p>
                      </div>

                      <div>
                        <h6>Conduta / Plano</h6>
                        <p className="mb-0">
                          {consultaSelecionada.conduta || "Não informado"}
                        </p>
                      </div>
                    </div>

                    <div className="modal-footer d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() => gerarConsultaPDF(consultaSelecionada)}
                      >
                        🖨️ Imprimir consulta
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setConsultaSelecionada(null)}
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* EVOLUÇÃO */}
      {aba === "evolucao" && (
        <div>
          <h4>Evolução</h4>
          <p className="text-muted">
            A evolução clínica do paciente será apresentada aqui.
          </p>
        </div>
      )}

      {/* DOCUMENTOS */}
      {aba === "documentos" && (
        <div>
          <h4>Documentos</h4>
          <p className="text-muted">
            Relatórios, atestados, receitas e arquivos do paciente.
          </p>
        </div>
      )}
    </div>
  );
}
