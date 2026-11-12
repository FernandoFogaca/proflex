import React, { useEffect, useState } from "react";
import { UserRound, Building2, CalendarRange } from "lucide-react";

import { auth, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// ESTADOS BRASILEIROS
const ESTADOS = [
  ["AC", "Acre"],
  ["AL", "Alagoas"],
  ["AP", "Amapá"],
  ["AM", "Amazonas"],
  ["BA", "Bahia"],
  ["CE", "Ceará"],
  ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"],
  ["GO", "Goiás"],
  ["MA", "Maranhão"],
  ["MT", "Mato Grosso"],
  ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"],
  ["PA", "Pará"],
  ["PB", "Paraíba"],
  ["PR", "Paraná"],
  ["PE", "Pernambuco"],
  ["PI", "Piauí"],
  ["RJ", "Rio de Janeiro"],
  ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"],
  ["RO", "Rondônia"],
  ["RR", "Roraima"],
  ["SC", "Santa Catarina"],
  ["SP", "São Paulo"],
  ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

// REGISTROS PROFISSIONAIS
const PROFISSOES = {
  fisioterapeuta: "CREFITO",
  medico: "CRM",
  veterinario: "CRMV",
  nutricionista: "CRN",
  psicologo: "CRP",
  dentista: "CRO",
  enfermeiro: "COREN",
  fonoaudiologo: "CRFa",
  outro: "Registro profissional",
};

// PERFIS DISPONÍVEIS
const PERFIS = [
  {
    id: "autonomo",
    titulo: "Profissional autônomo",
    descricao: "Para quem realiza atendimentos particulares.",
    icone: UserRound,
  },
  {
    id: "clinica",
    titulo: "Clínica",
    descricao: "Para administrar uma clínica e sua equipe.",
    icone: Building2,
  },
  {
    id: "hibrido",
    titulo: "Profissional híbrido",
    descricao: "Para quem atende em clínicas e também de forma particular.",
    icone: CalendarRange,
  },
];

const somenteNumeros = (valor) => valor.replace(/\D/g, "");
function temSequencia(senha) {
  const texto = senha.toLowerCase();

  for (let i = 0; i <= texto.length - 4; i++) {
    const trecho = texto.slice(i, i + 4);

    if (/^(.)\1{3}$/.test(trecho)) {
      return true;
    }

    let crescente = true;
    let decrescente = true;

    for (let j = 1; j < trecho.length; j++) {
      const diferenca =
        trecho.charCodeAt(j) - trecho.charCodeAt(j - 1);

      if (diferenca !== 1) crescente = false;
      if (diferenca !== -1) decrescente = false;
    }

    if (crescente || decrescente) {
      return true;
    }
  }

  return false;
}
// TRADUZ ERROS DO FIREBASE
function traduzirErroFirebase(codigo) {
  const mensagens = {
    "auth/email-already-in-use": "Este e-mail já possui uma conta cadastrada.",
    "auth/invalid-email": "O endereço de e-mail informado é inválido.",
    "auth/weak-password": "A senha é muito fraca.",
    "auth/network-request-failed": "Falha na conexão. Verifique sua internet.",
    "auth/operation-not-allowed":
      "O cadastro por e-mail e senha não está habilitado.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "permission-denied":
      "O Firestore não permitiu salvar os dados. Verifique as regras de segurança.",
    unavailable: "O banco de dados está indisponível. Tente novamente.",
  };

  return (
    mensagens[codigo] ||
    "Não foi possível concluir o cadastro. Tente novamente."
  );
}

export default function Cadastro() {
  // DADOS DO RESPONSÁVEL
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefone, setTelefone] = useState("");

  // PERFIL
  const [tipoPerfil, setTipoPerfil] = useState("autonomo");

  // DADOS PROFISSIONAIS
  const [profissao, setProfissao] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");

  // DADOS DA CLÍNICA
  const [nomeClinica, setNomeClinica] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [enderecoClinica, setEnderecoClinica] = useState("");
  const [whatsappClinica, setWhatsappClinica] = useState("");

  // ENDEREÇO
  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // CIDADES E CONSULTAS
  const [cidades, setCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState(false);
  const [consultandoCEP, setConsultandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState("");

  // VALIDAÇÃO
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("info");

  // CONTROLE DO CADASTRO
  const [salvando, setSalvando] = useState(false);
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  function atualizarEndereco(campo, valor) {
    setEndereco((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
    setMensagem("");
  }

  // CONSULTA CIDADES DO ESTADO NO IBGE
  useEffect(() => {
    if (!endereco.estado) {
      setCidades([]);
      setErroCidades(false);
      setCarregandoCidades(false);
      return;
    }

    const controller = new AbortController();

    async function carregarCidades() {
      setCarregandoCidades(true);
      setErroCidades(false);
      setCidades([]);

      try {
        const resposta = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${endereco.estado}/municipios`,
          { signal: controller.signal },
        );

        if (!resposta.ok) {
          throw new Error("Erro ao consultar cidades.");
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados)) {
          throw new Error("Resposta inválida do IBGE.");
        }

        const listaOrdenada = dados.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
        );

        setCidades(listaOrdenada);
      } catch (erro) {
        if (erro.name !== "AbortError") {
          console.error("Erro ao carregar cidades:", erro);
          setErroCidades(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoCidades(false);
        }
      }
    }

    carregarCidades();

    return () => controller.abort();
  }, [endereco.estado]);

  // CONSULTA CEP
  async function buscarCEP(valor) {
    const numeros = somenteNumeros(valor);

    setErroCEP("");

    if (numeros.length !== 8) {
      return;
    }

    setConsultandoCEP(true);

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);

      if (!resposta.ok) {
        throw new Error("Falha ao consultar CEP.");
      }

      const dados = await resposta.json();

      if (dados.erro) {
        setErroCEP("CEP não encontrado.");
        return;
      }

      setEndereco((anterior) => {
        if (somenteNumeros(anterior.cep) !== numeros) {
          return anterior;
        }

        return {
          ...anterior,
          cep: numeros,
          rua: dados.logradouro || "",
          bairro: dados.bairro || "",
          cidade: dados.localidade || "",
          estado: dados.uf || "",
        };
      });
    } catch (erro) {
      console.error("Erro ao consultar CEP:", erro);
      setErroCEP("Não foi possível consultar o CEP. Confira o endereço.");
    } finally {
      setConsultandoCEP(false);
    }
  }

  // VERIFICA TODOS OS CAMPOS
  function validarCadastro() {
    const novosErros = {};

    const nomeLimpo = nome.trim().replace(/\s+/g, " ");
    const partesNome = nomeLimpo.split(" ").filter(Boolean);

    if (partesNome.length < 2) {
      novosErros.nome = "Informe nome e sobrenome.";
    } else if (partesNome.some((parte) => parte.length < 2)) {
      novosErros.nome = "Informe um nome completo válido.";
    }

    if (!cpf.trim()) {
      novosErros.cpf = "CPF obrigatório.";
    } else if (somenteNumeros(cpf).length !== 11) {
      novosErros.cpf = "O CPF deve conter 11 números.";
    }

    if (!email.trim()) {
      novosErros.email = "E-mail obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = "Informe um e-mail válido.";
    }

    if (!senha) {
      novosErros.senha = "Senha obrigatória.";
    } else if (senha.length < 8) {
      novosErros.senha = "Use pelo menos 8 caracteres.";
    } else if (temSequencia(senha)) {
  novosErros.senha = "Não utilize sequências ou caracteres repetidos.";
}

    if (!confirmarSenha) {
      novosErros.confirmarSenha = "Confirme sua senha.";
    } else if (senha !== confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não coincidem.";
    }

    if (!whatsapp.trim()) {
      novosErros.whatsapp = "WhatsApp obrigatório.";
    } else if (
      somenteNumeros(whatsapp).length < 10 ||
      somenteNumeros(whatsapp).length > 15
    ) {
      novosErros.whatsapp = "Informe um telefone válido.";
    }

    if (!endereco.cep.trim()) {
      novosErros.cep = "CEP obrigatório.";
    } else if (somenteNumeros(endereco.cep).length !== 8) {
      novosErros.cep = "O CEP deve conter 8 números.";
    }

    if (!endereco.rua.trim()) {
      novosErros.rua = "Rua obrigatória.";
    }

    if (!endereco.numero.trim()) {
      novosErros.numero = "Número obrigatório.";
    }

    if (!endereco.bairro.trim()) {
      novosErros.bairro = "Bairro obrigatório.";
    }

    if (!endereco.estado) {
      novosErros.estado = "Selecione o estado.";
    }

    if (!endereco.cidade.trim()) {
      novosErros.cidade = "Selecione a cidade.";
    }

    // PROFISSIONAL INDIVIDUAL OU HÍBRIDO
    if (tipoPerfil === "autonomo" || tipoPerfil === "hibrido") {
      if (!profissao) {
        novosErros.profissao = "Selecione sua profissão.";
      }

      if (!registroProfissional.trim()) {
        novosErros.registroProfissional = "Informe seu registro profissional.";
      }
    }

    // CLÍNICA
    if (tipoPerfil === "clinica") {
      if (!nomeClinica.trim()) {
        novosErros.nomeClinica = "Nome da clínica obrigatório.";
      }

      if (!cnpj.trim()) {
        novosErros.cnpj = "CNPJ obrigatório.";
      } else if (somenteNumeros(cnpj).length !== 14) {
        novosErros.cnpj = "O CNPJ deve conter 14 números.";
      }

      if (!enderecoClinica.trim()) {
        novosErros.enderecoClinica = "Endereço da clínica obrigatório.";
      }

      if (!whatsappClinica.trim()) {
        novosErros.whatsappClinica = "WhatsApp da clínica obrigatório.";
      } else if (
        somenteNumeros(whatsappClinica).length < 10 ||
        somenteNumeros(whatsappClinica).length > 15
      ) {
        novosErros.whatsappClinica = "Informe um telefone válido.";
      }
    }

    return novosErros;
  }

  // REVALIDA QUANDO OS DADOS MUDAM
  useEffect(() => {
    if (tentouEnviar) {
      setErros(validarCadastro());
    }
  }, [
    tentouEnviar,
    nome,
    cpf,
    email,
    senha,
    confirmarSenha,
    whatsapp,
    endereco,
    profissao,
    registroProfissional,
    tipoPerfil,
    nomeClinica,
    cnpj,
    enderecoClinica,
    whatsappClinica,
  ]);

  // CRIA A CONTA NO FIREBASE
  async function handleSubmit(e) {
    e.preventDefault();

    if (salvando || cadastroConcluido) {
      return;
    }

    setTentouEnviar(true);
    setMensagem("");

    const novosErros = validarCadastro();
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) {
      requestAnimationFrame(() => {
        const primeiroErro = document.querySelector(".is-invalid");

        primeiroErro?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        primeiroErro?.focus({ preventScroll: true });
      });

      return;
    }

    if (carregandoCidades || consultandoCEP) {
      setTipoMensagem("warning");
      setMensagem("Aguarde a consulta do endereço terminar.");
      return;
    }

    setSalvando(true);

    let usuarioCriado = null;

    try {
      // 1. CRIA USUÁRIO NO FIREBASE AUTHENTICATION
      const credencial = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        senha,
      );

      usuarioCriado = credencial.user;

      // 2. PREPARA OS DADOS PARA O FIRESTORE
      // A senha não é incluída aqui.
      const dadosCadastro = {
        uid: usuarioCriado.uid,
        nome: nome.trim().replace(/\s+/g, " "),
        cpf: somenteNumeros(cpf),
        email: email.trim().toLowerCase(),
        tipoPerfil,
        whatsapp: whatsapp.trim(),
        telefone: telefone.trim(),
        endereco: {
          ...endereco,
          cep: somenteNumeros(endereco.cep),
        },
        ...(tipoPerfil !== "clinica" && {
          profissao,
          registroProfissional: registroProfissional.trim(),
        }),
        ...(tipoPerfil === "clinica" && {
          nomeClinica: nomeClinica.trim(),
          cnpj: somenteNumeros(cnpj),
          enderecoClinica: enderecoClinica.trim(),
          whatsappClinica: whatsappClinica.trim(),
        }),
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      };

      // 3. SALVA NO FIRESTORE USANDO O UID
      await setDoc(doc(db, "usuarios", usuarioCriado.uid), dadosCadastro);

      // 4. CADASTRO CONCLUÍDO
      setCadastroConcluido(true);
      setSenha("");
      setConfirmarSenha("");

      // 5. SOLICITA VERIFICAÇÃO DO E-MAIL
      try {
        await sendEmailVerification(usuarioCriado);

        setMensagem(
          "Conta criada com sucesso! Enviamos um link de " +
            "verificação para seu e-mail.",
        );
      } catch (erroEmail) {
        console.error(
          "Não foi possível enviar o e-mail de verificação:",
          erroEmail,
        );

        setMensagem(
          "Conta criada com sucesso! Porém, não foi possível " +
            "enviar o e-mail de verificação neste momento.",
        );
      }

      setTipoMensagem("success");
    } catch (erro) {
      console.error("Erro ao cadastrar usuário:", erro);

      // Se o Auth criou o usuário, mas o Firestore falhou,
      // tenta desfazer a criação para evitar conta incompleta.
      if (usuarioCriado) {
        try {
          await deleteUser(usuarioCriado);
        } catch (erroExclusao) {
          console.error("Não foi possível desfazer o cadastro:", erroExclusao);

          setTipoMensagem("danger");
          setMensagem(
            "A conta foi criada, mas não foi possível salvar " +
              "os dados do perfil. Não tente criar outra conta " +
              "com o mesmo e-mail. Entre em contato com o suporte.",
          );
          return;
        }
      }

      setTipoMensagem("danger");
      setMensagem(traduzirErroFirebase(erro.code));
    } finally {
      setSalvando(false);
    }
  }

  // CLASSE VISUAL DOS CAMPOS
  function classeCampo(campo, tipo = "form-control") {
    return `${tipo} ${tentouEnviar && erros[campo] ? "is-invalid" : ""}`;
  }

  // MENSAGEM DE ERRO ABAIXO DO CAMPO
  function mensagemErro(campo) {
    if (!tentouEnviar || !erros[campo]) {
      return null;
    }

    return <div className="invalid-feedback d-block">{erros[campo]}</div>;
  }

  return (
    <div className="container py-5" style={{ maxWidth: 1100 }}>
      <h2 className="fw-bold mb-2">Criar conta no ProFlex</h2>

      <p className="text-muted mb-4">
        Preencha seus dados para começar. Os campos com * são obrigatórios.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {/* DADOS PESSOAIS */}
        <h5 className="fw-semibold mb-3">Dados do responsável</h5>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Nome completo *</label>

            <input
              type="text"
              className={classeCampo("nome")}
              placeholder="Nome e sobrenome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(tentouEnviar && erros.nome)}
            />

            {mensagemErro("nome")}
          </div>

          <div className="col-md-6">
            <label className="form-label">CPF do responsável *</label>

            <input
              type="text"
              className={classeCampo("cpf")}
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              maxLength={14}
              inputMode="numeric"
            />

            {mensagemErro("cpf")}
          </div>

          <div className="col-md-6">
            <label className="form-label">E-mail de login *</label>

            <input
              type="email"
              className={classeCampo("email")}
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {mensagemErro("email")}

            <div className="form-text">
              Este será seu e-mail de acesso ao ProFlex.
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">WhatsApp principal *</label>

            <input
              type="tel"
              className={classeCampo("whatsapp")}
              placeholder="+55 48 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />

            {mensagemErro("whatsapp")}
          </div>

          {/* SENHAS EM LINHAS SEPARADAS */}
          <div className="col-12">
            <label className="form-label">Senha *</label>

            <input
              type="password"
              className={classeCampo("senha")}
              placeholder="Mínimo de 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="new-password"
            />

            {mensagemErro("senha")}
          </div>

          <div className="col-12">
            <label className="form-label">Confirmar senha *</label>

            <input
              type="password"
              className={classeCampo("confirmarSenha")}
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
            />

            {mensagemErro("confirmarSenha")}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Telefone alternativo (opcional)
            </label>

            <input
              type="tel"
              className="form-control"
              placeholder="Telefone fixo ou celular"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
        </div>

        {/* SELEÇÃO DE PERFIL */}
        <div className="mb-4">
          <h5 className="fw-semibold mb-2">
            Como você pretende utilizar o ProFlex?
          </h5>

          <p className="text-muted mb-3">
            Selecione o perfil que melhor representa seu trabalho.
          </p>

          <div className="row g-3">
            {PERFIS.map((perfil) => {
              const Icone = perfil.icone;
              const selecionado = tipoPerfil === perfil.id;

              return (
                <div className="col-md-4" key={perfil.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoPerfil(perfil.id);
                      setMensagem("");
                    }}
                    aria-pressed={selecionado}
                    className="card h-100 w-100 text-start p-4"
                    style={{
                      cursor: "pointer",
                      borderRadius: 18,
                      border: selecionado
                        ? "2px solid #0D9488"
                        : "1px solid #E2E8F0",
                      backgroundColor: selecionado ? "#F0FDFA" : "#FFFFFF",
                      boxShadow: selecionado
                        ? "0 8px 24px rgba(13,148,136,0.12)"
                        : "0 3px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: selecionado ? "#CCFBF1" : "#F1F5F9",
                        color: selecionado ? "#0D9488" : "#475569",
                      }}
                    >
                      <Icone size={28} strokeWidth={1.8} />
                    </div>

                    <h6
                      className="fw-bold mt-3 mb-2"
                      style={{ color: "#1E293B" }}
                    >
                      {perfil.titulo}
                    </h6>

                    <p
                      className="small mb-0"
                      style={{
                        color: "#64748B",
                        lineHeight: 1.6,
                      }}
                    >
                      {perfil.descricao}
                    </p>

                    {selecionado && (
                      <span
                        className="mt-3 fw-semibold small"
                        style={{ color: "#0D9488" }}
                      >
                        ✓ Selecionado
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="mb-4">
          <h5 className="fw-semibold mb-3">Endereço do responsável</h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">CEP *</label>

              <input
                className={classeCampo("cep")}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                value={endereco.cep}
                onChange={(e) => {
                  const valor = e.target.value;
                  atualizarEndereco("cep", valor);
                  buscarCEP(valor);
                }}
              />

              {mensagemErro("cep")}

              {consultandoCEP && (
                <div className="small text-muted mt-1">Consultando CEP...</div>
              )}

              {erroCEP && (
                <div className="small text-danger mt-1">{erroCEP}</div>
              )}
            </div>

            <div className="col-md-8">
              <label className="form-label">Rua *</label>

              <input
                className={classeCampo("rua")}
                value={endereco.rua}
                onChange={(e) => atualizarEndereco("rua", e.target.value)}
              />

              {mensagemErro("rua")}
            </div>

            <div className="col-md-4">
              <label className="form-label">Número *</label>

              <input
                className={classeCampo("numero")}
                value={endereco.numero}
                onChange={(e) => atualizarEndereco("numero", e.target.value)}
              />

              {mensagemErro("numero")}
            </div>

            <div className="col-md-8">
              <label className="form-label">Complemento (opcional)</label>

              <input
                className="form-control"
                value={endereco.complemento}
                onChange={(e) =>
                  atualizarEndereco("complemento", e.target.value)
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Bairro *</label>

              <input
                className={classeCampo("bairro")}
                value={endereco.bairro}
                onChange={(e) => atualizarEndereco("bairro", e.target.value)}
              />

              {mensagemErro("bairro")}
            </div>

            <div className="col-md-6">
              <label className="form-label">Estado (UF) *</label>

              <select
                className={classeCampo("estado", "form-select")}
                value={endereco.estado}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    estado: e.target.value,
                    cidade: "",
                  }))
                }
              >
                <option value="">Selecione o estado</option>

                {ESTADOS.map(([sigla, nomeEstado]) => (
                  <option key={sigla} value={sigla}>
                    {nomeEstado}
                  </option>
                ))}
              </select>

              {mensagemErro("estado")}
            </div>

            <div className="col-md-6">
              <label className="form-label">Cidade *</label>

              {erroCidades ? (
                <>
                  <input
                    className={classeCampo("cidade")}
                    placeholder="Digite a cidade"
                    value={endereco.cidade}
                    onChange={(e) =>
                      atualizarEndereco("cidade", e.target.value)
                    }
                  />

                  <div className="small text-warning mt-1">
                    Não foi possível carregar as cidades do IBGE. Digite a
                    cidade manualmente.
                  </div>
                </>
              ) : (
                <select
                  className={classeCampo("cidade", "form-select")}
                  value={endereco.cidade}
                  disabled={!endereco.estado || carregandoCidades}
                  onChange={(e) => atualizarEndereco("cidade", e.target.value)}
                >
                  <option value="">
                    {carregandoCidades
                      ? "Carregando cidades..."
                      : "Selecione a cidade"}
                  </option>

                  {endereco.cidade &&
                    !cidades.some(
                      (cidade) => cidade.nome === endereco.cidade,
                    ) && (
                      <option value={endereco.cidade}>{endereco.cidade}</option>
                    )}

                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              )}

              {mensagemErro("cidade")}
            </div>
          </div>
        </div>

        {/* DADOS PROFISSIONAIS */}
        {(tipoPerfil === "autonomo" || tipoPerfil === "hibrido") && (
          <div className="mb-4">
            <h5 className="fw-semibold mb-3">Dados profissionais</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Profissão *</label>

                <select
                  className={classeCampo("profissao", "form-select")}
                  value={profissao}
                  onChange={(e) => {
                    setProfissao(e.target.value);
                    setRegistroProfissional("");
                  }}
                >
                  <option value="">Selecione sua profissão</option>

                  <option value="fisioterapeuta">Fisioterapeuta</option>
                  <option value="medico">Médico</option>
                  <option value="veterinario">Veterinário</option>
                  <option value="nutricionista">Nutricionista</option>
                  <option value="psicologo">Psicólogo</option>
                  <option value="dentista">Dentista</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="fonoaudiologo">Fonoaudiólogo</option>
                  <option value="outro">Outro profissional</option>
                </select>

                {mensagemErro("profissao")}
              </div>

              {profissao && (
                <div className="col-md-6">
                  <label className="form-label">
                    {PROFISSOES[profissao]} *
                  </label>

                  <input
                    type="text"
                    className={classeCampo("registroProfissional")}
                    placeholder={`Informe seu ${PROFISSOES[profissao]}`}
                    value={registroProfissional}
                    onChange={(e) => setRegistroProfissional(e.target.value)}
                  />

                  {mensagemErro("registroProfissional")}
                </div>
              )}
            </div>

            {tipoPerfil === "hibrido" && (
              <p className="small text-muted mt-3">
                Você poderá vincular clínicas à sua conta depois que a
                funcionalidade estiver disponível.
              </p>
            )}
          </div>
        )}

        {/* DADOS DA CLÍNICA */}
        {tipoPerfil === "clinica" && (
          <div className="mb-4">
            <h5 className="fw-semibold mb-3">Dados da clínica</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nome da clínica *</label>

                <input
                  className={classeCampo("nomeClinica")}
                  placeholder="Nome da clínica"
                  value={nomeClinica}
                  onChange={(e) => setNomeClinica(e.target.value)}
                />

                {mensagemErro("nomeClinica")}
              </div>

              <div className="col-md-6">
                <label className="form-label">CNPJ da clínica *</label>

                <input
                  type="text"
                  className={classeCampo("cnpj")}
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  maxLength={18}
                  inputMode="numeric"
                />

                {mensagemErro("cnpj")}
              </div>

              <div className="col-md-6">
                <label className="form-label">Endereço da clínica *</label>

                <input
                  className={classeCampo("enderecoClinica")}
                  placeholder="Endereço completo"
                  value={enderecoClinica}
                  onChange={(e) => setEnderecoClinica(e.target.value)}
                />

                {mensagemErro("enderecoClinica")}
              </div>

              <div className="col-md-6">
                <label className="form-label">WhatsApp da clínica *</label>

                <input
                  type="tel"
                  className={classeCampo("whatsappClinica")}
                  placeholder="+55 48 99999-9999"
                  value={whatsappClinica}
                  onChange={(e) => setWhatsappClinica(e.target.value)}
                />

                {mensagemErro("whatsappClinica")}
              </div>
            </div>
          </div>
        )}

        {/* BOTÃO DE ENVIO */}
        <div className="mt-4 mb-4">
          <button
            type="submit"
            disabled={salvando || cadastroConcluido}
            className="btn btn-primary px-5 py-3 fw-semibold"
            style={{
              backgroundColor: "#0D9488",
              borderColor: "#0D9488",
              borderRadius: 12,
            }}
          >
            {salvando
              ? "Criando conta..."
              : cadastroConcluido
                ? "Conta criada"
                : "Criar conta"}
          </button>

          {mensagem && (
            <div className={`alert alert-${tipoMensagem} mt-3`} role="status">
              {mensagem}
            </div>
          )}

          <p className="small text-muted mt-3">
            Seus dados serão utilizados para criar sua conta no ProFlex.
          </p>
        </div>
      </form>
    </div>
  );
}
