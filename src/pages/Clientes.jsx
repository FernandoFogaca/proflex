
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const ESTADOS_BRASIL = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
];

const PROVINCIAS_HOLANDA = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
];

const SIGLAS_ESTADOS = {
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

const initialForm = {
  fotoPerfilUrl: "",
  nome: "",
  email: "",
  semEmail: false,
  telefone: "",
  temWhatsapp: false,
  tipoDocumento: "CPF",
  documento: "",
  semDocumento: false,
  endereco: "",
  pais: "Brasil",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
};

const smallButtonStyle = {
  width: "auto",
  minWidth: 0,
  padding: "7px 12px",
  fontSize: "13px",
  borderRadius: "7px",
};

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function cpfValido(valor) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (quantidade) => {
    let soma = 0;

    for (let i = 0; i < quantidade; i++) {
      soma += Number(cpf[i]) * (quantidade + 1 - i);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    calcularDigito(9) === Number(cpf[9]) &&
    calcularDigito(10) === Number(cpf[10])
  );
}

function formatarCPF(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function normalizarBusca(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function Clientes() {
  const { clients, addClient, salvarFotoPerfil } = useApp();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [form, setForm] = useState(initialForm);
  const [modoCadastro, setModoCadastro] = useState("rapido");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const formularioRef = useRef(null);

  const fotoPreviewUrl = useMemo(() => {
    if (!fotoCapturada) return null;
    return URL.createObjectURL(fotoCapturada);
  }, [fotoCapturada]);

  useEffect(() => {
    return () => {
      if (fotoPreviewUrl) {
        URL.revokeObjectURL(fotoPreviewUrl);
      }
    };
  }, [fotoPreviewUrl]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = normalizarBusca(q);
    const numeros = somenteNumeros(q);

    if (!needle) return clients;

    return clients.filter((client) => {
      const campos = [
        client.nome,
        client.email,
        client.telefone,
        client.documento,
        client.endereco,
        client.cidade,
        client.bairro,
      ];

      const texto = normalizarBusca(campos.filter(Boolean).join(" "));

      const buscaPorNumero =
        numeros.length >= 3 &&
        [client.telefone, client.documento].some((valor) =>
          somenteNumeros(valor).includes(numeros)
        );

      return texto.includes(needle) || buscaPorNumero;
    });
  }, [q, clients]);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "documento" && previous.tipoDocumento === "CPF"
          ? formatarCPF(value)
          : value,
    }));
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraAberta(false);
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("A câmera não está disponível neste navegador.");
        return;
      }

      closeCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraAberta(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Não foi possível abrir a câmera. Verifique a permissão.");
    }
  };

  useEffect(() => {
    if (!cameraAberta || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.error("Video playback error:", error);
    });
  }, [cameraAberta]);

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) {
      alert("A câmera ainda não está pronta.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      alert("Não foi possível capturar a imagem.");
      return;
    }

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Não foi possível gerar a fotografia.");
          return;
        }

        const file = new File([blob], "patient-photo.jpg", {
          type: "image/jpeg",
        });

        setFotoCapturada(file);
        closeCamera();
      },
      "image/jpeg",
      0.85
    );
  };

  const choosePhoto = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }

    setFotoCapturada(file);
    closeCamera();
  };

  const buscarCEP = async () => {
    if (form.pais !== "Brasil") return;

    const cep = somenteNumeros(form.cep);

    if (cep.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      if (!response.ok) {
        throw new Error("CEP não encontrado");
      }

      const dados = await response.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setForm((previous) => ({
        ...previous,
        rua: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: SIGLAS_ESTADOS[dados.uf] || "",
      }));
    } catch (error) {
      console.error(error);
      alert("Não foi possível consultar o CEP.");
    }
  };

  const abrirFormulario = (modo = "rapido") => {
    setModoCadastro(modo);
    setMostrarFormulario(true);

    setTimeout(() => {
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const cancelarCadastro = () => {
    if (salvando) return;

    closeCamera();
    setFotoCapturada(null);
    setForm({ ...initialForm });
    setMostrarFormulario(false);
    setModoCadastro("rapido");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (salvando) return;

    if (form.nome.trim().split(/\s+/).length < 2) {
      alert("Informe o nome e o sobrenome do paciente.");
      return;
    }

    const telefoneNumeros = somenteNumeros(form.telefone);

    if (telefoneNumeros.length < 9 || telefoneNumeros.length > 15) {
      alert("Informe um telefone válido, com 9 a 15 dígitos.");
      return;
    }

    if (
      !form.semDocumento &&
      form.documento.trim() &&
      form.tipoDocumento === "CPF" &&
      !cpfValido(form.documento)
    ) {
      alert("Informe um CPF válido ou marque 'Paciente não informou documento'.");
      return;
    }

    if (modoCadastro === "completo") {
      if (!form.cep.trim()) {
        alert("O CEP ou código postal é obrigatório.");
        return;
      }

      if (
        form.pais === "Brasil" &&
        !/^\d{8}$/.test(somenteNumeros(form.cep))
      ) {
        alert("O CEP brasileiro deve conter 8 números.");
        return;
      }
    }

    const enderecoCompleto = [
      [form.rua, form.numero].filter(Boolean).join(", "),
      form.complemento,
      form.bairro,
      form.cidade,
      form.estado,
      form.cep,
      form.pais,
    ]
      .filter(Boolean)
      .join(" - ");

    const dadosPaciente = {
      ...form,
      tipoDocumento: form.semDocumento ? "" : form.tipoDocumento,
      documento: form.semDocumento ? "" : form.documento.trim(),
      endereco:
        modoCadastro === "completo" ? enderecoCompleto : "",
    };

    setSalvando(true);

    let novoPaciente;

    try {
      novoPaciente = await addClient(dadosPaciente);
    } catch (erro) {
      console.error("Erro ao cadastrar paciente:", erro);
      alert("Não foi possível salvar o paciente no Firebase.");
      setSalvando(false);
      return;
    }

    if (!novoPaciente) {
      setSalvando(false);
      return;
    }

    if (fotoCapturada) {
      try {
        await salvarFotoPerfil(novoPaciente.id, fotoCapturada);
      } catch (error) {
        console.error("Erro ao salvar foto:", error);

        alert(
          "O paciente foi cadastrado, mas a foto não foi salva. " +
          "O cadastro permanece salvo no Firebase."
        );
      }
    }

    setForm({ ...initialForm });
    setFotoCapturada(null);
    setQ("");
    setSalvando(false);
    setMostrarFormulario(false);
    setModoCadastro("rapido");

    alert("Paciente cadastrado com sucesso!");
  };

  return (
    <div className="container py-4">

      {/* CABEÇALHO */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="mb-1">Pacientes</h3>
          <p className="text-muted mb-0">
            Encontre pacientes, consulte prontuários ou faça um novo cadastro.
          </p>
        </div>

        <button
          type="button"
          className="proflex-button"
          style={{
            width: "auto",
            minWidth: "150px",
            padding: "10px 18px",
            borderRadius: "8px",
          }}
          onClick={() => abrirFormulario("rapido")}
        >
          + Novo paciente
        </button>
      </div>

      {/* PESQUISA NO TOPO */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-body p-3 p-md-4">

          <label htmlFor="pesquisaPacientes" className="form-label fw-semibold">
            Pesquisar pacientes
          </label>

          <div className="input-group">
            <span className="input-group-text" aria-hidden="true">
              🔎
            </span>

            <input
              id="pesquisaPacientes"
              type="search"
              className="form-control"
              placeholder="Nome, CPF, telefone, e-mail ou endereço"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Pesquisar pacientes"
            />
          </div>

          <small className="text-muted d-block mt-2">
            Digite uma informação do paciente para encontrá-lo rapidamente.
          </small>

          <div className="mt-3 text-muted small">
            {q.trim()
              ? `${filtered.length} paciente(s) encontrado(s)`
              : `${clients.length} paciente(s) cadastrado(s)`}
          </div>
        </div>
      </div>

      {/* LISTA DE PACIENTES */}

      <div
        className="card border-0 shadow-sm mb-4"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-body p-3 p-md-4">

          <h5 className="mb-3">Pacientes cadastrados</h5>

          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Telefone</th>
                  <th scope="col" className="d-none d-md-table-cell">
                    E-mail
                  </th>
                  <th scope="col" className="d-none d-lg-table-cell">
                    Documento
                  </th>
                  <th scope="col" className="text-end">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.nome}</strong>

                      {client.cidade && (
                        <small className="d-block text-muted">
                          {client.cidade}
                        </small>
                      )}
                    </td>

                    <td>
                      <span style={{ overflowWrap: "anywhere" }}>
                        {client.telefone || "—"}
                      </span>
                    </td>

                    <td className="d-none d-md-table-cell">
                      {client.email || "Não informado"}
                    </td>

                    <td className="d-none d-lg-table-cell">
                      {client.documento
                        ? `${client.tipoDocumento || "Documento"}: ${client.documento}`
                        : "Não informado"}
                    </td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="proflex-button"
                        style={{
                          ...smallButtonStyle,
                          whiteSpace: "normal",
                        }}
                        onClick={() =>
                          nav(`/prontuario?clienteId=${client.id}`)
                        }
                        aria-label={`Abrir prontuário de ${client.nome}`}
                      >
                        Abrir prontuário
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-muted"
                    >
                      {q.trim()
                        ? "Nenhum paciente encontrado. Tente outra informação."
                        : "Nenhum paciente cadastrado. Clique em Novo paciente para começar."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}

      {mostrarFormulario && (
        <div ref={formularioRef}>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h4 className="mb-1">Cadastrar paciente</h4>
              <p className="text-muted mb-0">
                Escolha como deseja preencher o cadastro.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelarCadastro}
              disabled={salvando}
            >
              Fechar cadastro
            </button>
          </div>

          {/* MODOS DE CADASTRO */}

          <div
            className="card border-0 shadow-sm mb-3"
            style={{ borderRadius: "12px" }}
          >
            <div className="card-body p-3 p-md-4">

              <div className="d-flex flex-wrap gap-2 mb-3">

                <button
                  type="button"
                  className={
                    modoCadastro === "rapido"
                      ? "proflex-button"
                      : "btn btn-outline-secondary"
                  }
                  style={
                    modoCadastro === "rapido"
                      ? smallButtonStyle
                      : undefined
                  }
                  aria-pressed={modoCadastro === "rapido"}
                  onClick={() => setModoCadastro("rapido")}
                >
                  Cadastro rápido
                </button>

                <button
                  type="button"
                  className={
                    modoCadastro === "completo"
                      ? "proflex-button"
                      : "btn btn-outline-secondary"
                  }
                  style={
                    modoCadastro === "completo"
                      ? smallButtonStyle
                      : undefined
                  }
                  aria-pressed={modoCadastro === "completo"}
                  onClick={() => setModoCadastro("completo")}
                >
                  Cadastro completo
                </button>

              </div>

              <p className="text-muted small mb-0">
                {modoCadastro === "rapido"
                  ? "Cadastro rápido: informe os dados principais. O endereço e outras informações poderão ser acrescentados depois no cadastro do paciente."
                  : "Cadastro completo: preencha os dados pessoais e o endereço. As informações clínicas são registradas no prontuário."}
              </p>

            </div>
          </div>

          <form onSubmit={onSubmit}>

            {/* DADOS DO PACIENTE */}

            <div
              className="card border-0 shadow-sm mb-3"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-3 p-md-4">

                <h5 className="mb-2">Dados do paciente</h5>

                <p className="text-muted small mb-3">
                  Preencha os campos obrigatórios para identificar e
                  contactar o paciente.
                </p>

                <div className="row g-3 align-items-start">

                  {/* FOTO E BOTÕES */}

                  <div className="col-12 col-md-4 col-lg-3">
                    <div className="d-flex flex-column align-items-start gap-2">

                      <div
                        style={{
                          width: "90px",
                          height: "120px",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f5f5f5",
                        }}
                      >
                        {fotoPreviewUrl ? (
                          <img
                            src={fotoPreviewUrl}
                            alt="Foto do paciente"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "32px" }}>👤</span>
                        )}
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-2">

                        <label
                          className="proflex-button"
                          style={{
                            ...smallButtonStyle,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 0,
                          }}
                        >
                          Escolher foto

                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={choosePhoto}
                          />
                        </label>

                        <button
                          type="button"
                          className="proflex-button"
                          style={smallButtonStyle}
                          onClick={openCamera}
                        >
                          📷 Tirar foto
                        </button>

                      </div>
                    </div>
                  </div>

                  {/* NOME, EMAIL E TELEFONE */}

                  <div className="col-12 col-md-8 col-lg-9">
                    <div className="row g-3">

                      <div className="col-12">
                        <label htmlFor="nomePaciente" className="form-label">
                          Nome completo *
                        </label>

                        <input
                          id="nomePaciente"
                          className="form-control"
                          name="nome"
                          placeholder="Nome e sobrenome do paciente"
                          value={form.nome}
                          onChange={onChange}
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div className="col-12 col-lg-6">
                        <label htmlFor="emailPaciente" className="form-label">
                          E-mail
                        </label>

                        <input
                          id="emailPaciente"
                          type="email"
                          className="form-control"
                          name="email"
                          placeholder="E-mail do paciente"
                          value={form.email}
                          onChange={onChange}
                          disabled={form.semEmail}
                          required={!form.semEmail}
                          autoComplete="email"
                        />

                        <label className="form-check-label d-flex align-items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={form.semEmail}
                            onChange={(e) =>
                              setForm((previous) => ({
                                ...previous,
                                semEmail: e.target.checked,
                                email: e.target.checked
                                  ? ""
                                  : previous.email,
                              }))
                            }
                          />

                          <span>Não possui e-mail</span>
                        </label>
                      </div>

                      <div className="col-12 col-lg-6">
                        <label htmlFor="telefonePaciente" className="form-label">
                          Telefone *
                        </label>

                        <input
                          id="telefonePaciente"
                          type="tel"
                          className="form-control"
                          name="telefone"
                          placeholder="Telefone com DDD ou código do país"
                          value={form.telefone}
                          onChange={onChange}
                          autoComplete="tel"
                          required
                        />

                        <label className="form-check-label d-flex align-items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={form.temWhatsapp}
                            onChange={(e) =>
                              setForm((previous) => ({
                                ...previous,
                                temWhatsapp: e.target.checked,
                              }))
                            }
                          />

                          <span>Este número também é WhatsApp</span>
                        </label>
                      </div>

                      {/* DOCUMENTO */}

                      <div className="col-12">
                        <hr className="my-2" />

                        <h6 className="mb-2">
                          Documento de identificação
                        </h6>

                        <p className="text-muted small mb-2">
                          O documento ajuda a identificar pacientes com
                          nomes semelhantes. Não é obrigatório.
                        </p>
                      </div>

                      <div className="col-12 col-sm-5">
                        <label
                          htmlFor="tipoDocumento"
                          className="form-label"
                        >
                          Tipo de documento
                        </label>

                        <select
                          id="tipoDocumento"
                          className="form-select"
                          name="tipoDocumento"
                          value={form.tipoDocumento}
                          disabled={form.semDocumento}
                          onChange={(e) =>
                            setForm((previous) => ({
                              ...previous,
                              tipoDocumento: e.target.value,
                              documento: "",
                            }))
                          }
                        >
                          <option value="CPF">CPF</option>
                          <option value="Passaporte">Passaporte</option>
                          <option value="Outro">Outro documento</option>
                        </select>
                      </div>

                      <div className="col-12 col-sm-7">
                        <label
                          htmlFor="documento"
                          className="form-label"
                        >
                          Número do documento
                        </label>

                        <input
                          id="documento"
                          name="documento"
                          className="form-control"
                          value={form.documento}
                          onChange={onChange}
                          disabled={form.semDocumento}
                          inputMode={
                            form.tipoDocumento === "CPF"
                              ? "numeric"
                              : "text"
                          }
                          maxLength={
                            form.tipoDocumento === "CPF"
                              ? 14
                              : 50
                          }
                          placeholder={
                            form.tipoDocumento === "CPF"
                              ? "000.000.000-00"
                              : "Número do documento"
                          }
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-check-label d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={form.semDocumento}
                            onChange={(e) =>
                              setForm((previous) => ({
                                ...previous,
                                semDocumento: e.target.checked,
                                documento: e.target.checked
                                  ? ""
                                  : previous.documento,
                              }))
                            }
                          />

                          <span>Paciente não informou documento</span>
                        </label>
                      </div>

                    </div>
                  </div>

                  {/* CÂMERA */}

                  {cameraAberta && (
                    <div className="col-12">
                      <div
                        className="p-3 border rounded"
                        style={{ maxWidth: "440px" }}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            backgroundColor: "#111",
                          }}
                        />

                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            className="proflex-button"
                            style={smallButtonStyle}
                            onClick={capturePhoto}
                          >
                            📸 Capturar foto
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={closeCamera}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* ENDEREÇO - CADASTRO COMPLETO */}

            {modoCadastro === "completo" && (
              <div
                className="card border-0 shadow-sm mb-3"
                style={{ borderRadius: "12px" }}
              >
                <div className="card-body p-3 p-md-4">

                  <h5 className="mb-2">Endereço</h5>

                  <p className="text-muted small mb-3">
                    Informe o endereço do paciente. Para endereços no Brasil,
                    o CEP pode preencher automaticamente alguns campos.
                  </p>

                  <div className="row g-3">

                    {/* PAÍS */}

                    <div className="col-12">
                      <label className="form-check-label d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input mt-0"
                          checked={form.pais === "Brasil"}
                          onChange={(e) =>
                            setForm((previous) => ({
                              ...previous,
                              pais: e.target.checked ? "Brasil" : "",
                              estado: "",
                            }))
                          }
                        />

                        <span>Brasil</span>
                      </label>

                      {form.pais !== "Brasil" && (
                        <select
                          className="form-select form-select-sm mt-2"
                          style={{ maxWidth: "260px" }}
                          value={form.pais}
                          onChange={(e) =>
                            setForm((previous) => ({
                              ...previous,
                              pais: e.target.value,
                              estado: "",
                            }))
                          }
                        >
                          <option value="">Selecione o país</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Países Baixos">Países Baixos</option>
                          <option value="Irlanda">Irlanda</option>
                          <option value="Alemanha">Alemanha</option>
                          <option value="Outro">Outro</option>
                        </select>
                      )}
                    </div>

                    {[
                      ["cep", "CEP / Código postal"],
                      ["rua", "Rua"],
                      ["numero", "Número"],
                      ["complemento", "Complemento"],
                      ["bairro", "Bairro"],
                      ["cidade", "Cidade"],
                      ["estado", "Estado / Província"],
                    ].map(([campo, titulo]) => (
                      <div
                        key={campo}
                        className={
                          campo === "rua"
                            ? "col-12 col-md-6 col-lg-5"
                            : campo === "cep"
                            ? "col-12 col-sm-6 col-md-3 col-lg-2"
                            : campo === "numero"
                            ? "col-12 col-sm-6 col-md-3 col-lg-2"
                            : campo === "complemento"
                            ? "col-12 col-sm-6 col-md-6 col-lg-3"
                            : "col-12 col-sm-6 col-lg-4"
                        }
                      >
                        <label
                          htmlFor={`endereco-${campo}`}
                          className="form-label"
                        >
                          {titulo}
                          {campo === "cep" ? " *" : ""}
                        </label>

                        {campo === "estado" &&
                        (form.pais === "Brasil" ||
                          form.pais === "Países Baixos") ? (
                          <select
                            id={`endereco-${campo}`}
                            className="form-select"
                            name="estado"
                            value={form.estado}
                            onChange={onChange}
                          >
                            <option value="">
                              Selecione o estado
                            </option>

                            {(form.pais === "Brasil"
                              ? ESTADOS_BRASIL
                              : PROVINCIAS_HOLANDA
                            ).map((estado) => (
                              <option key={estado} value={estado}>
                                {estado}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`endereco-${campo}`}
                            className="form-control"
                            name={campo}
                            value={form[campo]}
                            onChange={onChange}
                            onBlur={
                              campo === "cep"
                                ? buscarCEP
                                : undefined
                            }
                            autoComplete={
                              campo === "cep"
                                ? "postal-code"
                                : campo === "rua"
                                ? "address-line1"
                                : campo === "cidade"
                                ? "address-level2"
                                : undefined
                            }
                          />
                        )}
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            )}

            {/* BOTÕES DO CADASTRO */}

            <div className="d-flex flex-wrap justify-content-end gap-2 mb-4">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cancelarCadastro}
                disabled={salvando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="proflex-button"
                disabled={salvando}
                style={{
                  width: "auto",
                  minWidth: "160px",
                  padding: "10px 20px",
                  fontSize: "14px",
                  borderRadius: "8px",
                }}
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar paciente"}
              </button>

            </div>

          </form>
        </div>
      )}

    </div>
  );
}
