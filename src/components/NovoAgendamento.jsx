import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useApp } from "../context/AppContext.jsx";

function calcIdade(yyyy_mm_dd){
  if(!yyyy_mm_dd) return "";
  const [y,m,d] = yyyy_mm_dd.split("-").map(Number);
  const nasc = new Date(y, (m||1)-1, d||1);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const antes = (hoje.getMonth() < nasc.getMonth()) || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate());
  if (antes) idade--;
  return idade >= 0 ? idade : "";
}

// lista extra de doenças (além das COMORBIDADES do contexto)
const DOENCAS_COMUNS = [
  "Artrite", "Artrose", "Tendinite", "Bursite", "Hérnia de disco",
  "Lombalgia", "Cervicalgia", "Escoliose", "Osteoporose", "Fibromialgia",
  "Enxaqueca", "Sinusite", "Refluxo", "Hipotireoidismo", "Hipertireoidismo",
  "Ansiedade", "Depressão", "Insônia", "Dermatite", "Varizes"
];

// grupos de áreas do corpo e subpartes
const AREAS = {
  "Membros inferiores": ["Pés", "Dedos dos pés", "Tornozelos", "Panturrilhas", "Joelhos", "Coxas", "Quadris"],
  "Membros superiores": ["Mãos", "Dedos das mãos", "Punhos", "Antebraços", "Cotovelos", "Braços", "Ombros"],
  "Tronco": ["Coluna cervical", "Coluna torácica", "Coluna lombar", "Tórax", "Abdome", "Sacro/Quadril"],
  "Cabeça / Face": ["Crânio", "Face", "Mandíbula", "Olhos", "Ouvidos", "Nariz", "Boca"],
  "Neurológico": ["Sensibilidade", "Força", "Equilíbrio", "Coordenação", "Reflexos", "Marcha"]
};

const loadLS = (k, fb) => { try { const s = localStorage.getItem(k); return s ? JSON.parse(s) : fb; } catch { return fb; } };
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default function NovoAgendamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const {
    getClient, addClient, updateClient,
    addAppointment,
    addConsulta, updateConsulta, deleteConsultas,
    deleteClient, gerarRelatorioPDF, COMORBIDADES
  } = useApp();

  // ----- Query params -----
  const clienteIdParam = params.get("clienteId") || "";
  const dataInicial    = params.get("data") || new Date().toISOString().split("T")[0];
  const horaInicial    = params.get("hora") || "09:00";
  const tipoQuery      = params.get("tipo"); // opcional

  const clienteExistente = clienteIdParam ? getClient(clienteIdParam) : null;

  // ----- Estado do formulário (paciente) -----
  const [tipo, setTipo] = useState(tipoQuery || (clienteExistente ? "completo" : "rapido"));
  const [data, setData] = useState(dataInicial);
  const [hora, setHora] = useState(horaInicial);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");

  const [nascimento, setNascimento] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [genero, setGenero] = useState("");

  const [comorb, setComorb] = useState([]);              // do contexto
  const [doencasExtras, setDoencasExtras] = useState([]); // lista extra
  const [outrosDiagnosticos, setOutrosDiagnosticos] = useState("");
  const [remedios, setRemedios] = useState("");

  const [anotacoesPaciente, setAnotacoesPaciente] = useState(""); // campo geral de notas

  // Áreas do corpo: { [grupo]: { parts: string[], note: string } }
  const [areas, setAreas] = useState(() =>
    Object.fromEntries(Object.keys(AREAS).map(k => [k, { parts: [], note: "" }]))
  );

  // Consulta atual
  const [observacoes, setObservacoes] = useState("");           // observações gerais p/ agendamento
  const [textoConsultaAtual, setTextoConsultaAtual] = useState(""); // “Consulta 01”

  const [carimbo, setCarimbo] = useState("");

  // Dados do profissional (no localStorage, sem mexer no contexto)
  const [prof, setProf] = useState(() =>
    loadLS("profissional", { nome: "", registro: "", email: "", telefone: "", endereco: "" })
  );

  // preencher estados se edição
  useEffect(() => {
    if (clienteExistente) {
      setNome(clienteExistente.nome || "");
      setTelefone(clienteExistente.telefone || "");
      setEmail(clienteExistente.email || "");
      setEndereco(clienteExistente.endereco || "");
      setNascimento(clienteExistente.nascimento || "");
      setPeso(clienteExistente.peso || "");
      setAltura(clienteExistente.altura || "");
      setGenero(clienteExistente.genero || "");
      setComorb(Array.isArray(clienteExistente.comorbidades) ? clienteExistente.comorbidades : []);
      setDoencasExtras(Array.isArray(clienteExistente.doencasExtras) ? clienteExistente.doencasExtras : []);
      setOutrosDiagnosticos(clienteExistente.outrosDiagnosticos || "");
      setRemedios(clienteExistente.remedios || "");
      setAnotacoesPaciente(clienteExistente.anotacoesPaciente || "");

      // áreas salvas anteriormente (se houver)
      if (clienteExistente.areas) {
        setAreas(prev => {
          const base = { ...prev };
          for (const k of Object.keys(AREAS)) {
            base[k] = clienteExistente.areas[k] || { parts: [], note: "" };
          }
          return base;
        });
      }
      setTipo(tipoQuery || "completo");
    }
    setCarimbo(new Date().toLocaleString("pt-BR"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteIdParam]);

  const consultas = useMemo(() => clienteExistente?.consultas || [], [clienteExistente?.consultas]);
  const [sel, setSel] = useState([]); // consultas selecionadas (relatório/exclusão)

  const toggle = (arr, val, set) => set(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);
  const toggleComorb = (nome) => setComorb(prev => prev.includes(nome) ? prev.filter(x=>x!==nome) : [...prev, nome]);
  const toggleDoenca = (nome) => setDoencasExtras(prev => prev.includes(nome) ? prev.filter(x=>x!==nome) : [...prev, nome]);

  const toggleAreaPart = (grupo, part) => {
    setAreas(prev => {
      const g = prev[grupo] || { parts: [], note: "" };
      const parts = g.parts.includes(part) ? g.parts.filter(x=>x!==part) : [...g.parts, part];
      return { ...prev, [grupo]: { ...g, parts } };
    });
  };
  const setAreaNote = (grupo, note) => setAreas(prev => ({ ...prev, [grupo]: { ...prev[grupo], note } }));

  const selecionarTudo = (marcar) => setSel(marcar ? (consultas.map(c=>c.id)) : []);

  const novaConsulta = () => {
    if (!clienteExistente) { alert("Salve o paciente primeiro para criar consultas sequenciais."); return; }
    const agora = new Date();
    addConsulta(clienteExistente.id, { dataISO: agora.toISOString().slice(0,10), hora: agora.toTimeString().slice(0,5), texto: "" });
  };

  const setTextoConsulta = (cid, texto) => {
    if (!clienteExistente) return;
    updateConsulta(clienteExistente.id, cid, { texto });
  };

  const gerarPDFSelecionadas = () => {
    if (!clienteExistente) return;
    const selecionadas = consultas.filter(c => sel.includes(c.id)).sort((a,b)=> a.numero.localeCompare(b.numero));
    if (!selecionadas.length){ alert("Selecione ao menos uma consulta."); return; }
    gerarRelatorioPDF(clienteExistente, selecionadas);
  };

  const excluirSelecionadas = () => {
    if (!clienteExistente) return;
    deleteConsultas(clienteExistente.id, sel);
    setSel([]);
  };

  const idade = calcIdade(nascimento);

  // ----- salvar/atualizar paciente + agendamento + consulta 01 (com extras) -----
  const handleSubmit = (e) => {
    e.preventDefault();

    const baseCliente = {
      nome: nome || "Sem nome",
      telefone, email, endereco,
      anotacoesPaciente
    };

    const extras =
      tipo === "completo"
        ? {
            nascimento, peso, altura, genero,
            comorbidades: comorb,
            doencasExtras,
            outrosDiagnosticos,
            remedios,
            areas
          }
        : {};

    let cliente = clienteExistente;

    if (cliente) {
      updateClient(cliente.id, { ...baseCliente, ...extras });
    } else {
      cliente = addClient({ ...baseCliente, ...extras, consultas: [], receitas: [], atestados: [] });
    }

    // injeta um sumário das áreas e doenças no texto da consulta atual, para constar no relatório
    const resumoExtras = (() => {
      const linhas = [];
      if (doencasExtras.length) linhas.push(`Doenças adicionais: ${doencasExtras.join(", ")}`);
      const blocos = Object.entries(areas)
        .filter(([_,v]) => v.parts.length || v.note)
        .map(([g,v]) => `${g}: ${v.parts.join(", ")}${v.note ? ` — Obs: ${v.note}` : ""}`);
      if (blocos.length) linhas.push(`Áreas afetadas: ${blocos.join(" | ")}`);
      return linhas.length ? linhas.join("\n") + "\n\n" : "";
    })();

    if (textoConsultaAtual.trim()) {
      const dataISO = data || new Date().toISOString().slice(0,10);
      const horaOK  = hora || new Date().toTimeString().slice(0,5);
      addConsulta(cliente.id, {
        dataISO, hora: horaOK,
        texto: resumoExtras + textoConsultaAtual.trim()
      });
    }

    if (data && hora) {
      addAppointment({ data, hora, clienteId: cliente.id, clienteNome: cliente.nome, observacoes, tipo });
    }

    alert("✅ Cadastro salvo!");
    navigate("/agenda");
  };

  // ----- Profissional: salvar no localStorage -----
  const salvarProf = () => {
    saveLS("profissional", prof);
    alert("✅ Dados do profissional salvos.");
  };

  // ----- PDF Receita / Atestado (sem mexer no contexto) -----
  const pdfHeader = (doc, titulo) => {
    doc.setFontSize(18); doc.text(titulo, 40, 40);
    doc.setLineWidth(0.5); doc.line(40, 48, 555, 48);
    doc.setFontSize(11);
  };

  const pdfFooterProf = (doc, y) => {
    y += 16; doc.line(40, y, 555, y);
    y += 18;
    doc.text(`${prof.nome || ""}  |  Registro: ${prof.registro || "-"}`, 40, y);
    y += 16;
    doc.text(`${prof.email || ""}  |  Tel: ${prof.telefone || ""}  |  End.: ${prof.endereco || ""}`, 40, y);
  };

  const imprimirReceita = (cliente, texto) => {
    if (!cliente) { alert("Salve o paciente primeiro."); return; }
    const doc = new jsPDF({ unit:"pt", format:"a4" });
    pdfHeader(doc, "RECEITA");
    let y = 70;
    doc.text(`Paciente: ${cliente.nome}   Nasc.: ${cliente.nascimento || "-"}   Idade: ${calcIdade(cliente.nascimento) || "-"}`, 40, y); y+=18;
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}   Hora: ${new Date().toLocaleTimeString("pt-BR")}`, 40, y); y+=24;

    // texto da receita (quebra simples)
    const lines = doc.splitTextToSize(texto || "", 515);
    lines.forEach((ln) => { doc.text(ln, 40, y); y += 14; if (y > 740) { doc.addPage(); y = 60; } });

    pdfFooterProf(doc, Math.min(y, 740));
    doc.save(`receita_${cliente.nome.replace(/\s+/g,"_")}.pdf`);

    // guarda no histórico do paciente
    updateClient(cliente.id, {
      receitas: [ ...(cliente.receitas || []), { id: `rec_${Date.now()}`, createdAt: new Date().toISOString(), texto } ]
    });
  };

  const imprimirAtestado = (cliente, para, texto) => {
    if (!cliente) { alert("Salve o paciente primeiro."); return; }
    const doc = new jsPDF({ unit:"pt", format:"a4" });
    pdfHeader(doc, "ATESTADO");
    let y = 70;
    doc.text(`Paciente: ${cliente.nome}   Nasc.: ${cliente.nascimento || "-"}   Idade: ${calcIdade(cliente.nascimento) || "-"}`, 40, y); y+=18;
    if (para) { doc.text(`Destinatário: ${para}`, 40, y); y+=18; }
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}   Hora: ${new Date().toLocaleTimeString("pt-BR")}`, 40, y); y+=24;

    const lines = doc.splitTextToSize(texto || "", 515);
    lines.forEach((ln) => { doc.text(ln, 40, y); y += 14; if (y > 740) { doc.addPage(); y = 60; } });

    pdfFooterProf(doc, Math.min(y, 740));
    doc.save(`atestado_${cliente.nome.replace(/\s+/g,"_")}.pdf`);

    updateClient(cliente.id, {
      atestados: [ ...(cliente.atestados || []), { id: `ats_${Date.now()}`, createdAt: new Date().toISOString(), para, texto } ]
    });
  };

  const apagarPaciente = () => {
    if (!clienteExistente) return;
    deleteClient(clienteExistente.id);
    navigate("/clientes");
  };

  // estados locais para os textos da Receita/Atestado
  const [receitaTexto, setReceitaTexto] = useState("");
  const [atestadoPara, setAtestadoPara] = useState("");
  const [atestadoTexto, setAtestadoTexto] = useState("");

  return (
    <div className="container py-4">
      <h4 className="mb-3">Cadastro {clienteExistente ? "do Paciente" : "de Agendamento"}</h4>

      {/* Dados da agenda */}
      <div className="mb-2">
        <strong>Data selecionada:</strong> {data} &nbsp;|&nbsp;
        <strong>Hora:</strong> {hora} &nbsp;|&nbsp;
        <strong>Cadastro iniciado em:</strong> {carimbo}
      </div>

      {/* Tipo */}
      <div className="mb-3">
        <label className="form-label me-3">Tipo:</label>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" id="t-rap" checked={tipo==="rapido"} onChange={()=>setTipo("rapido")} />
          <label className="form-check-label" htmlFor="t-rap">Rápido</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" id="t-comp" checked={tipo==="completo"} onChange={()=>setTipo("completo")} />
          <label className="form-check-label" htmlFor="t-comp">Completo</label>
        </div>
      </div>

      {/* FORM PRINCIPAL */}
      <form className="row g-3" onSubmit={handleSubmit}>
        {/* data/hora */}
        <div className="col-md-3">
          <label className="form-label">Data</label>
          <input className="form-control" type="date" value={data} onChange={(e)=>setData(e.target.value)} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Hora</label>
          <input className="form-control" type="time" step="300" value={hora} onChange={(e)=>setHora(e.target.value)} />
        </div>

        {/* dados básicos */}
        <div className="col-md-6">
          <label className="form-label">Nome do paciente</label>
          <input className="form-control" value={nome} onChange={(e)=>setNome(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Telefone</label>
          <input className="form-control" value={telefone} onChange={(e)=>setTelefone(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Endereço</label>
          <input className="form-control" value={endereco} onChange={(e)=>setEndereco(e.target.value)} />
        </div>

        {/* COMPLETO */}
        {tipo === "completo" && (
          <>
            <div className="col-md-3">
              <label className="form-label">Nascimento</label>
              <input type="date" className="form-control" value={nascimento} onChange={(e)=>setNascimento(e.target.value)} />
              <small className="text-muted">Idade: {idade || "-"}</small>
            </div>
            <div className="col-md-2">
              <label className="form-label">Peso (kg)</label>
              <input className="form-control" value={peso} onChange={(e)=>setPeso(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Altura (cm)</label>
              <input className="form-control" value={altura} onChange={(e)=>setAltura(e.target.value)} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Gênero</label>
              <select className="form-select" value={genero} onChange={(e)=>setGenero(e.target.value)}>
                <option value="">-</option><option>Masculino</option><option>Feminino</option><option>Outro</option>
              </select>
            </div>

            {/* Comorbidades */}
            <div className="col-12">
              <label className="form-label">Comorbidades</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {COMORBIDADES.map((nome) => (
                  <label key={nome} className="form-check" style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #eee", borderRadius:8, padding:"6px 10px" }}>
                    <input type="checkbox" className="form-check-input" checked={comorb.includes(nome)} onChange={()=>toggleComorb(nome)} />
                    <span>{nome}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Doenças adicionais */}
            <div className="col-12">
              <label className="form-label">Outras doenças (selecione as que se aplicam)</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {DOENCAS_COMUNS.map((nome) => (
                  <label key={nome} className="form-check" style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #eee", borderRadius:8, padding:"6px 10px" }}>
                    <input type="checkbox" className="form-check-input" checked={doencasExtras.includes(nome)} onChange={()=>toggleDoenca(nome)} />
                    <span>{nome}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Áreas do corpo */}
            <div className="col-12">
              <label className="form-label">Áreas do corpo afetadas</label>
              {Object.entries(AREAS).map(([grupo, parts]) => (
                <div key={grupo} className="mb-2 p-2 border rounded">
                  <strong>{grupo}</strong>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:8 }}>
                    {parts.map((p) => (
                      <label key={p} className="form-check" style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #eee", borderRadius:8, padding:"4px 8px" }}>
                        <input type="checkbox" className="form-check-input"
                          checked={areas[grupo].parts.includes(p)}
                          onChange={()=>toggleAreaPart(grupo, p)} />
                        <span>{p}</span>
                      </label>
                    ))}
                  </div>
                  {(areas[grupo].parts.length > 0) && (
                    <div className="mt-2">
                      <input
                        className="form-control"
                        placeholder={`Observações específicas para ${grupo} (opcional)`}
                        value={areas[grupo].note}
                        onChange={(e)=>setAreaNote(grupo, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Campos livres */}
            <div className="col-md-6">
              <label className="form-label">Outras doenças/diagnósticos (texto livre)</label>
              <textarea className="form-control" rows="3" value={outrosDiagnosticos} onChange={(e)=>setOutrosDiagnosticos(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Remédios (anotações gerais)</label>
              <textarea className="form-control" rows="3" value={remedios} onChange={(e)=>setRemedios(e.target.value)} />
            </div>
          </>
        )}

        {/* Anotações gerais do paciente (editável sempre) */}
        <div className="col-12">
          <label className="form-label">Anotações do paciente (histórico geral)</label>
          <textarea className="form-control" rows="3" value={anotacoesPaciente} onChange={(e)=>setAnotacoesPaciente(e.target.value)} />
        </div>

        {/* Observações e Consulta atual */}
        <div className="col-12">
          <label className="form-label">Observações gerais do agendamento</label>
          <textarea className="form-control" rows="3" value={observacoes} onChange={(e)=>setObservacoes(e.target.value)} />
        </div>

        <div className="col-12">
          <label className="form-label">Consulta (texto da consulta atual)</label>
          <textarea className="form-control" rows="4"
            placeholder="Evolução, diagnóstico, plano, doses/frequências e duração…"
            value={textoConsultaAtual} onChange={(e)=>setTextoConsultaAtual(e.target.value)} />
        </div>

        <div className="col-12 d-flex justify-content-between mt-2">
          <button type="button" className="btn btn-outline-secondary" onClick={()=>navigate("/agenda")}>Cancelar</button>
          <button className="proflex-button">Confirmar</button>
        </div>
      </form>

      {/* Consultas anteriores (se já é paciente) */}
      {clienteExistente && (
        <>
          <hr className="my-4" />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="m-0">Consultas ({consultas.length})</h5>
            <div className="d-flex gap-2">
              <div className="form-check me-3">
                <input type="checkbox" className="form-check-input" id="selAll"
                  checked={sel.length === consultas.length && consultas.length>0}
                  onChange={(e)=>selecionarTudo(e.target.checked)} />
                <label className="form-check-label" htmlFor="selAll">Selecionar tudo</label>
              </div>
              <button className="btn btn-outline-secondary" onClick={gerarPDFSelecionadas}>Relatório (PDF)</button>
              <button className="btn btn-outline-danger" onClick={excluirSelecionadas}>Excluir selecionadas</button>
              <button className="btn btn-primary" onClick={novaConsulta}>Nova consulta</button>
            </div>
          </div>

          <div className="list-group mb-4">
            {consultas.map((c) => (
              <div key={c.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div><strong>Consulta {c.numero}</strong> — {c.dataISO} {c.hora || ""}</div>
                  <input type="checkbox" className="form-check-input" checked={sel.includes(c.id)} onChange={()=>setSel((prev)=>prev.includes(c.id)?prev.filter(x=>x!==c.id):[...prev,c.id])} />
                </div>
                <textarea
                  className="form-control mt-2"
                  rows={4}
                  placeholder="Edite as anotações desta consulta…"
                  value={c.texto || ""}
                  onChange={(e)=>setTextoConsulta(c.id, e.target.value)}
                />
              </div>
            ))}
            {consultas.length === 0 && <div className="list-group-item text-muted">Sem consultas ainda.</div>}
          </div>
        </>
      )}

      {/* RECEITA e ATESTADO */}
      <hr className="my-4" />
      <h5 className="mb-3">Receita e Atestado</h5>

      {/* Dados do profissional */}
      <div className="row g-2 mb-3">
        <div className="col-md-3"><input className="form-control" placeholder="Nome do profissional" value={prof.nome} onChange={(e)=>setProf({...prof, nome:e.target.value})} /></div>
        <div className="col-md-2"><input className="form-control" placeholder="Registro (CRM/CRP/…)" value={prof.registro} onChange={(e)=>setProf({...prof, registro:e.target.value})} /></div>
        <div className="col-md-3"><input className="form-control" placeholder="Email" value={prof.email} onChange={(e)=>setProf({...prof, email:e.target.value})} /></div>
        <div className="col-md-2"><input className="form-control" placeholder="Telefone" value={prof.telefone} onChange={(e)=>setProf({...prof, telefone:e.target.value})} /></div>
        <div className="col-md-2"><input className="form-control" placeholder="Endereço" value={prof.endereco} onChange={(e)=>setProf({...prof, endereco:e.target.value})} /></div>
        <div className="col-12 text-end">
          <button className="btn btn-outline-secondary" onClick={salvarProf}>Salvar dados do profissional</button>
        </div>
      </div>

      {/* Receita */}
      <div className="mb-3 p-3 border rounded">
        <h6>Receita</h6>
        <textarea className="form-control" rows={6}
          placeholder={`Escreva a medicação, doses, frequência (diária/semanal/horas) e duração...\n(essas "linhas" não aparecem na impressão)`}
          value={receitaTexto} onChange={(e)=>setReceitaTexto(e.target.value)} />
        <div className="text-end mt-2">
          <button className="btn btn-dark" onClick={()=>imprimirReceita(clienteExistente, receitaTexto)}>Imprimir Receita (PDF)</button>
        </div>
      </div>

      {/* Atestado */}
      <div className="mb-4 p-3 border rounded">
        <h6>Atestado</h6>
        <input className="form-control mb-2" placeholder="Destinatário (Pessoa/Empresa)" value={atestadoPara} onChange={(e)=>setAtestadoPara(e.target.value)} />
        <textarea className="form-control" rows={6}
          placeholder={`Escreva as informações do atestado, período, recomendações...\n(essas "linhas" não aparecem na impressão)`}
          value={atestadoTexto} onChange={(e)=>setAtestadoTexto(e.target.value)} />
        <div className="text-end mt-2">
          <button className="btn btn-dark" onClick={()=>imprimirAtestado(clienteExistente, atestadoPara, atestadoTexto)}>Imprimir Atestado (PDF)</button>
        </div>
      </div>

      {/* Danger zone */}
      {clienteExistente && (
        <div className="d-flex justify-content-end">
          <button className="btn btn-danger" onClick={apagarPaciente}>Excluir paciente</button>
        </div>
      )}
    </div>
  );
}
