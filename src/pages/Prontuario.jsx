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
  const [mostrarAtestado, setMostrarAtestado] = useState(false);
  const [dataAtestado, setDataAtestado] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [tipoAtestado, setTipoAtestado] = useState("comparecimento");
  const [observacoesAtestado, setObservacoesAtestado] = useState("");
  const [busca, setBusca] = useState("");
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  const pacientesFiltrados = (clients || []).filter((item) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;

    return [item.nome, item.telefone, item.email, item.cpf]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(termo);
  });

  const gerarProntuarioPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
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

    const addTitle = (value) => {
      checkPage(45);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(value, margin, y);
      y += 22;
    };

    const addText = (label, value) => {
      const lines = doc.splitTextToSize(
        String(value || "Não informado"),
        contentWidth - 120,
      );

      checkPage(lines.length * 13 + 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(lines, margin + 120, y);
      y += Math.max(18, lines.length * 13);
    };

    const formatList = (items) =>
      Array.isArray(items) && items.length
        ? items.join(", ")
        : "Nenhuma registrada";

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

    addTitle("Identificação do paciente");
    addText("Nome", paciente.nome);
    addText("Nascimento", paciente.nascimento);
    addText("Telefone", paciente.telefone);
    addText("E-mail", paciente.email);
    addText("Endereço", paciente.endereco);

    y += 15;

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

    addTitle("Histórico de consultas");

    const consultas = paciente.consultas || [];

    if (!consultas.length) {
      addText("Consultas", "Nenhuma consulta registrada");
    } else {
      consultas.forEach((consulta, index) => {
        checkPage(130);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(
          `Consulta ${consulta.numero || index + 1} - ${consulta.dataISO || "-"} ${consulta.hora || ""}`,
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

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarConsultaPDF = (consulta) => {
    if (!paciente || !consulta) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = 50;

    const addField = (label, value) => {
      const lines = doc.splitTextToSize(
        String(value || "Não informado"),
        contentWidth,
      );

      if (y + lines.length * 14 + 45 > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(label, margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
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
    doc.text(String(paciente.nome || ""), margin, y);
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

    if (y + 50 > pageHeight - 50) {
      doc.addPage();
      y = 50;
    }

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

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarRelatorioClinicoPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margem = 45;
    const largura = doc.internal.pageSize.getWidth() - margem * 2;
    const altura = doc.internal.pageSize.getHeight();
    let y = 50;

    const adicionarCampo = (titulo, conteudo) => {
      const linhas = doc.splitTextToSize(
        String(conteudo || "Não informado"),
        largura,
      );

      if (y + linhas.length * 14 + 45 > altura - 50) {
        doc.addPage();
        y = 50;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(titulo, margem, y);
      y += 18;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(linhas, margem, y);
      y += linhas.length * 14 + 22;
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", margem, y);
    y += 30;

    doc.setFontSize(14);
    doc.text("RELATÓRIO CLÍNICO", margem, y);
    y += 35;

    adicionarCampo("Paciente", paciente.nome);
    adicionarCampo("Data de emissão", new Date().toLocaleDateString("pt-BR"));

    const consultas = paciente.consultas || [];

    if (!consultas.length) {
      adicionarCampo("Histórico clínico", "Nenhuma consulta registrada.");
    } else {
      consultas.forEach((consulta, index) => {
        adicionarCampo(
          `Consulta ${consulta.numero || index + 1} - ${consulta.dataISO || ""}`,
          [
            `Avaliação: ${consulta.avaliacao || "Não informada"}`,
            `Evolução: ${consulta.evolucao || "Não informada"}`,
            `Conduta: ${consulta.conduta || "Não informada"}`,
          ].join("\n"),
        );
      });
    }

    adicionarCampo(
      "Observação",
      "Documento gerado a partir dos registros clínicos disponíveis no ProFlex. Requer revisão e validação do profissional responsável.",
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarAtestadoPDF = () => {
    if (!paciente || !dataAtestado) return;

    const doc = new jsPDF();
    const margem = 20;
    const largura = doc.internal.pageSize.getWidth() - 40;
    const data = dataAtestado.split("-").reverse().join("/");

    const titulo =
      tipoAtestado === "comparecimento"
        ? "DECLARAÇÃO DE COMPARECIMENTO"
        : "MINUTA DE ATESTADO DE AFASTAMENTO";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", margem, 25);

    doc.setFontSize(14);
    doc.text(titulo, margem, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const texto =
      tipoAtestado === "comparecimento"
        ? `Rascunho de declaração de comparecimento de ${paciente.nome}, referente ao atendimento em ${data}.`
        : `Minuta referente ao paciente ${paciente.nome}, com atendimento em ${data}. A necessidade e o período de afastamento dependem de avaliação profissional.`;

    doc.text(doc.splitTextToSize(texto, largura), margem, 65);

    let y = 100;

    if (observacoesAtestado.trim()) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", margem, y);
      y += 10;

      doc.setFont("helvetica", "normal");

      const linhas = doc.splitTextToSize(observacoesAtestado, largura);

      const limite = doc.internal.pageSize.getHeight() - 50;

      linhas.forEach((linha) => {
        if (y > limite) {
          doc.addPage();
          y = 25;
        }
        doc.text(linha, margem, y);
        y += 7;
      });
    }

    const altura = doc.internal.pageSize.getHeight();

    doc.setFontSize(9);
    doc.text(
      "RASCUNHO - requer revisão e assinatura de profissional habilitado.",
      margem,
      altura - 20,
    );

    window.open(doc.output("bloburl"), "_blank");
  };

  const gerarReceitaPDF = () => {
    if (!paciente) return;

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ProFlex", 20, 25);

    doc.setFontSize(15);
    doc.text("RECEITA - RASCUNHO", 20, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Paciente: ${paciente.nome}`, 20, 65);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 75);

    doc.text("Prescrição:", 20, 100);

    doc.line(20, 120, 190, 120);
    doc.line(20, 135, 190, 135);
    doc.line(20, 150, 190, 150);

    doc.text("________________________________", 20, 245);
    doc.text("Profissional responsável", 20, 255);

    doc.setFontSize(9);
    doc.text("RASCUNHO - requer validação e assinatura profissional.", 20, 280);

    window.open(doc.output("bloburl"), "_blank");
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
      {/* CABEÇALHO */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <button
            type="button"
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
            className="btn btn-outline-primary"
            onClick={() =>
              navigate(`/agendar?clienteId=${paciente.id}&tipo=completo`)
            }
          >
            ✏️ Completar / editar cadastro
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

      {/* NAVEGAÇÃO */}
      <div className="border-bottom mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {[
            ["resumo", "Resumo"],
            ["clinico", "Dados clínicos"],
            ["consultas", "Consultas"],
            ["evolucao", "Evolução"],
            ["documentos", "Documentos"],
          ].map(([chave, titulo]) => (
            <button
              key={chave}
              type="button"
              className={`btn ${aba === chave ? "btn-dark" : "btn-light"}`}
              onClick={() => setAba(chave)}
            >
              {titulo}
            </button>
          ))}
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
          <div className="mb-3">
            <h4 className="mb-1">Dados clínicos</h4>
            <p className="text-muted mb-0">
              Informações clínicas registradas para este paciente.
            </p>
          </div>

          <div className="row g-3">
            {[
              ["Nascimento", paciente.nascimento],
              ["Peso", paciente.peso ? `${paciente.peso} kg` : ""],
              ["Altura", paciente.altura ? `${paciente.altura} cm` : ""],
              ["Gênero", paciente.genero],
            ].map(([titulo, valor]) => (
              <div className="col-md-3" key={titulo}>
                <div className="card h-100">
                  <div className="card-body">
                    <small className="text-muted">{titulo}</small>
                    <div className="fw-semibold">{valor || "-"}</div>
                  </div>
                </div>
              </div>
            ))}

            {[
              ["Comorbidades", paciente.comorbidades],
              ["Condições musculoesqueléticas", paciente.doencasExtras],
              ["Condições neurológicas", paciente.doencasNeurologicas],
            ].map(([titulo, valores]) => (
              <div className="col-md-6" key={titulo}>
                <div className="card h-100">
                  <div className="card-body">
                    <h6>{titulo}</h6>

                    {valores?.length ? (
                      <div className="d-flex flex-wrap gap-2">
                        {valores.map((item) => (
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

                    {titulo === "Condições neurológicas" &&
                      paciente.sindromeDescricao && (
                        <div className="mt-2">
                          <strong>Síndrome:</strong>{" "}
                          {paciente.sindromeDescricao}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}

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
                      {[
                        ["Queixa principal", consultaSelecionada.queixa],
                        ["Avaliação", consultaSelecionada.avaliacao],
                        [
                          "Procedimentos realizados",
                          consultaSelecionada.procedimentos,
                        ],
                        ["Evolução", consultaSelecionada.evolucao],
                        ["Conduta / Plano", consultaSelecionada.conduta],
                      ].map(([titulo, valor]) => (
                        <div className="mb-4" key={titulo}>
                          <h6>{titulo}</h6>
                          <p>{valor || "Não informado"}</p>
                        </div>
                      ))}
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
          <div className="mb-4">
            <h4 className="mb-1">Evolução clínica</h4>
            <p className="text-muted mb-0">
              Histórico da evolução registrada nas consultas do paciente.
            </p>
          </div>

          {!paciente.consultas?.some((consulta) =>
            consulta.evolucao?.trim(),
          ) ? (
            <p className="text-muted">Nenhuma evolução clínica registrada.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {[...paciente.consultas].reverse().map((consulta, index) =>
                consulta.evolucao?.trim() ? (
                  <div key={consulta.id || index} className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong>
                          Consulta{" "}
                          {consulta.numero || paciente.consultas.length - index}
                        </strong>
                        <small className="text-muted">
                          {consulta.dataISO || "-"} {consulta.hora || ""}
                        </small>
                      </div>
                      <p className="mb-0">{consulta.evolucao}</p>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTOS */}
      {aba === "documentos" && (
        <div>
          <div className="mb-4">
            <h4>Documentos do paciente</h4>
            <p className="text-muted">
              Consulte e gere documentos relacionados ao atendimento.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5>Relatório clínico</h5>
                  <p className="text-muted">
                    Resumo da avaliação e da evolução do paciente.
                  </p>
                  <button
                    type="button"
                    className="proflex-button"
                    onClick={gerarRelatorioClinicoPDF}
                  >
                    Gerar relatório
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5>Atestado</h5>
                  <p className="text-muted">
                    Documento referente ao atendimento realizado.
                  </p>
                  <button
                    type="button"
                    className="proflex-button"
                    onClick={() => setMostrarAtestado(true)}
                  >
                    Gerar atestado
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5>Receita</h5>
                  <p className="text-muted">
                    Espaço para documentos de prescrição autorizados.
                  </p>
                  <button
                    type="button"
                    className="proflex-button"
                    onClick={gerarReceitaPDF}
                  >
                    Gerar receita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JANELA DO ATESTADO */}
      {mostrarAtestado && (
        <>
          <div
            className="modal-backdrop show"
            onClick={() => setMostrarAtestado(false)}
          />

          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Novo atestado</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setMostrarAtestado(false)}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted">Paciente: {paciente.nome}</p>

                  <label className="form-label">Data do atendimento</label>
                  <input
                    type="date"
                    className="form-control mb-3"
                    value={dataAtestado}
                    onChange={(e) => setDataAtestado(e.target.value)}
                  />

                  <label className="form-label">Tipo de documento</label>
                  <select
                    className="form-select mb-3"
                    value={tipoAtestado}
                    onChange={(e) => setTipoAtestado(e.target.value)}
                  >
                    <option value="comparecimento">
                      Declaração de comparecimento
                    </option>
                    <option value="afastamento">Atestado de afastamento</option>
                  </select>

                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Informações que serão incluídas no documento..."
                    value={observacoesAtestado}
                    onChange={(e) => setObservacoesAtestado(e.target.value)}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setMostrarAtestado(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className="proflex-button"
                    onClick={gerarAtestadoPDF}
                    disabled={!dataAtestado}
                  >
                    Gerar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
