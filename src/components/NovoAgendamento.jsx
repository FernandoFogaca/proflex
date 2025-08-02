import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function NovoAgendamento() {
  const [params] = useSearchParams();
  const dataSelecionada = params.get("data");
  const horaSelecionada = params.get("hora");

  const [tipoAgendamento, setTipoAgendamento] = useState("rapido"); //  controla qual modo foi escolhido

  const [formulario, setFormulario] = useState({
    nome: "",
    genero: "",
    telefone1: "",
    telefone2: "",
    whatsapp: false,
    nascimento: "",
    email: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    pontoReferencia: "",
    documento: "",
    observacoes: ""
  });

  const [dataHoraAtual, setDataHoraAtual] = useState("");

  useEffect(() => {
    const agora = new Date();
    setDataHoraAtual(agora.toLocaleString("pt-BR"));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const novoValor = type === "checkbox" ? checked : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: novoValor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Agendamento confirmado com sucesso!");
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">Novo Agendamento</h4>

      <div className="mb-3">
        <strong>Data:</strong> {dataSelecionada} | <strong>Hora:</strong> {horaSelecionada} <br />
        <strong>Cadastro feito em:</strong> {dataHoraAtual}
      </div>

      {/* 👇 Seletor de tipo */}
      <div className="mb-4">
        <label className="form-label me-3">Tipo de Agendamento:</label>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="rapido"
            name="tipo"
            value="rapido"
            checked={tipoAgendamento === "rapido"}
            onChange={() => setTipoAgendamento("rapido")}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="rapido">Agendamento Rápido</label>
        </div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="completo"
            name="tipo"
            value="completo"
            checked={tipoAgendamento === "completo"}
            onChange={() => setTipoAgendamento("completo")}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="completo">Com Cadastro Completo</label>
        </div>
      </div>

      <form className="row g-3" onSubmit={handleSubmit}>
        {/* CAMPOS EM COMUM */}
        <div className="col-md-6">
          <label className="form-label">Nome completo</label>
          <input type="text" name="nome" className="form-control" value={formulario.nome} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Gênero</label>
          <select name="genero" className="form-select" value={formulario.genero} onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Telefone 1 (WhatsApp)</label>
          <input type="tel" name="telefone1" className="form-control" value={formulario.telefone1} onChange={handleChange} required />
        </div>

        {/* CAMPOS EXTRAS SÓ SE FOR COMPLETO */}
        {tipoAgendamento === "completo" && (
          <>
            <div className="col-md-6">
              <label className="form-label">Telefone 2 (opcional)</label>
              <input type="tel" name="telefone2" className="form-control" value={formulario.telefone2} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" value={formulario.email} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Data de Nascimento</label>
              <input type="date" name="nascimento" className="form-control" value={formulario.nascimento} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">CEP</label>
              <input type="text" name="cep" className="form-control" value={formulario.cep} onChange={handleChange} />
            </div>

            <div className="col-md-8">
              <label className="form-label">Endereço</label>
              <input type="text" name="endereco" className="form-control" value={formulario.endereco} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Número</label>
              <input type="text" name="numero" className="form-control" value={formulario.numero} onChange={handleChange} />
            </div>

            <div className="col-md-8">
              <label className="form-label">Complemento</label>
              <input type="text" name="complemento" className="form-control" value={formulario.complemento} onChange={handleChange} />
            </div>

            <div className="col-12">
              <label className="form-label">Ponto de Referência</label>
              <input type="text" name="pontoReferencia" className="form-control" value={formulario.pontoReferencia} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Documento (CPF, RG ou Passaporte)</label>
              <input type="text" name="documento" className="form-control" value={formulario.documento} onChange={handleChange} />
            </div>
          </>
        )}

        {/* sempre visível */}
        <div className="col-12">
          <label className="form-label">Observações (até 500 caracteres)</label>
          <textarea
            name="observacoes"
            className="form-control"
            rows="4"
            maxLength={500}
            value={formulario.observacoes}
            onChange={handleChange}
          />
          <div className="form-text">
            {formulario.observacoes.length}/500 caracteres
          </div>
        </div>

        <div className="col-12 text-end mt-3">
          <button type="submit" className="proflex-button">Confirmar Agendamento</button>
        </div>
      </form>
    </div>
  );
}
