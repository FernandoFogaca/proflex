
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import "./Clientes.css";

const BRAZIL_STATES = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará",
  "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão",
  "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará",
  "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro",
  "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
];

const DUTCH_PROVINCES = [
  "Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen",
  "Limburg", "Noord-Brabant", "Noord-Holland", "Overijssel",
  "Utrecht", "Zeeland", "Zuid-Holland",
];

const STATE_ABBREVIATIONS = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
  ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão",
  MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba",
  PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia",
  RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
};

const INITIAL_FORM = {
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

const ICON_PATHS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  camera: (
    <>
      <path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5" />
      <path d="M4 16v4h16v-4" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 12h6m-6 4h6" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  chevron: <path d="m6 9 6 6 6-6" />,
};

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatCPF(value) {
  const numbers = onlyNumbers(value).slice(0, 11);

  return numbers
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function isValidCPF(value) {
  const cpf = onlyNumbers(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digit = (length) => {
    let sum = 0;

    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }

    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return digit(9) === Number(cpf[9]) &&
    digit(10) === Number(cpf[10]);
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  maxLength,
  onBlur,
}) {
  return (
    <label className="pf-field">
      <span className="pf-field-label">
        {label}
        {required && <span className="pf-required"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        onBlur={onBlur}
        className="pf-input"
      />
    </label>
  );
}

function CheckOption({ checked, onChange, children }) {
  return (
    <label className="pf-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span>{children}</span>
    </label>
  );
}

function SectionTitle({ icon, title, subtitle, number }) {
  return (
    <div className="pf-section-heading">
      <div className="pf-section-icon">
        <Icon name={icon} size={21} />
      </div>
      <div className="pf-section-copy">
        <div className="pf-section-title">
          {number && <span>{number}.</span>}
          <h3>{title}</h3>
        </div>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}



export default function Clientes() {
 const {
  clients,
  clientsLoading,
  clientsError,
  addClient,
  salvarFotoPerfil,
} = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [registrationMode, setRegistrationMode] = useState("rapido");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const formRef = useRef(null);

  const patientList = Array.isArray(clients) ? clients : [];

  const photoPreviewUrl = useMemo(() => {
    if (!capturedPhoto) return null;
    return URL.createObjectURL(capturedPhoto);
  }, [capturedPhoto]);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const filteredPatients = useMemo(() => {
    const query = normalizeSearch(search);
    const numbers = onlyNumbers(search);

    if (!query) return patientList;

    return patientList.filter((patient) => {
      const fields = [
        patient.nome,
        patient.email,
        patient.telefone,
        patient.documento,
        patient.endereco,
        patient.cidade,
        patient.bairro,
      ];

      const text = normalizeSearch(fields.filter(Boolean).join(" "));

      const numericMatch =
        numbers.length >= 3 &&
        [patient.telefone, patient.documento].some((value) =>
          onlyNumbers(value).includes(numbers)
        );

      return text.includes(query) || numericMatch;
    });
  }, [search, clients]);

  function updateForm(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "documento" && previous.tipoDocumento === "CPF"
          ? formatCPF(value)
          : value,
    }));
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function openCamera() {
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
      setCameraOpen(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Não foi possível abrir a câmera. Verifique a permissão.");
    }
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    video.play().catch((error) => {
      console.error("Video playback error:", error);
    });
  }, [cameraOpen]);

  function capturePhoto() {
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

        setCapturedPhoto(file);
        closeCamera();
      },
      "image/jpeg",
      0.85
    );
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem.");
      return;
    }

    setCapturedPhoto(file);
    closeCamera();
  }

  async function lookupPostalCode() {
    if (form.pais !== "Brasil") return;

    const postalCode = onlyNumbers(form.cep);

    if (postalCode.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${postalCode}/json/`
      );

      if (!response.ok) {
        throw new Error("CEP não encontrado");
      }

      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setForm((previous) => ({
        ...previous,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: STATE_ABBREVIATIONS[data.uf] || "",
      }));
    } catch (error) {
      console.error(error);
      alert("Não foi possível consultar o CEP.");
    }
  }

  function openRegistration(mode = "rapido") {
    setRegistrationMode(mode);
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function cancelRegistration() {
    if (saving) return;

    closeCamera();
    setCapturedPhoto(null);
    setForm({ ...INITIAL_FORM });
    setShowForm(false);
    setRegistrationMode("rapido");
  }

  async function submitRegistration(event) {
    event.preventDefault();

    if (saving) return;

    if (form.nome.trim().split(/\s+/).length < 2) {
      alert("Informe o nome e o sobrenome do paciente.");
      return;
    }

    const phoneNumbers = onlyNumbers(form.telefone);

    if (phoneNumbers.length < 9 || phoneNumbers.length > 15) {
      alert("Informe um telefone válido, com 9 a 15 dígitos.");
      return;
    }

    if (
      !form.semDocumento &&
      form.documento.trim() &&
      form.tipoDocumento === "CPF" &&
      !isValidCPF(form.documento)
    ) {
      alert(
        "Informe um CPF válido ou marque 'Paciente não informou documento'."
      );
      return;
    }

    if (registrationMode === "completo") {
      if (!form.cep.trim()) {
        alert("O CEP ou código postal é obrigatório.");
        return;
      }

      if (
        form.pais === "Brasil" &&
        !/^\d{8}$/.test(onlyNumbers(form.cep))
      ) {
        alert("O CEP brasileiro deve conter 8 números.");
        return;
      }
    }

    const fullAddress = [
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

    const patientData = {
      ...form,
      tipoDocumento: form.semDocumento ? "" : form.tipoDocumento,
      documento: form.semDocumento ? "" : form.documento.trim(),
      endereco: registrationMode === "completo" ? fullAddress : "",
    };

    setSaving(true);

    let newPatient;

    try {
      newPatient = await addClient(patientData);
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
      alert("Não foi possível salvar o paciente no Firebase.");
      setSaving(false);
      return;
    }

    if (!newPatient) {
      setSaving(false);
      return;
    }

    if (capturedPhoto) {
      try {
        await salvarFotoPerfil(newPatient.id, capturedPhoto);
      } catch (error) {
        console.error("Erro ao salvar foto:", error);
        alert(
          "O paciente foi cadastrado, mas a foto não foi salva. " +
          "O cadastro permanece salvo no Firebase."
        );
      }
    }

    closeCamera();
    setForm({ ...INITIAL_FORM });
    setCapturedPhoto(null);
    setSearch("");
    setSaving(false);
    setShowForm(false);
    setRegistrationMode("rapido");

    alert("Paciente cadastrado com sucesso!");
  }

  const addressFields = [
    { name: "cep", label: "CEP / Código postal", required: true },
    { name: "rua", label: "Rua" },
    { name: "numero", label: "Número" },
    { name: "complemento", label: "Complemento" },
    { name: "bairro", label: "Bairro" },
    { name: "cidade", label: "Cidade" },
    { name: "estado", label: "Estado / Província" },
  ];

  return (
    <div className="pf-page">
     

     

      <div className="pf-toolbar">
        <label className="pf-search">
          <Icon name="search" size={21} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone, CPF..."
            aria-label="Buscar pacientes"
          />
        </label>

        <button
          type="button"
          className="pf-button pf-button-primary"
          onClick={() => openRegistration("rapido")}
        >
          <Icon name="plus" size={19} />
          Novo paciente
        </button>
      </div>

      <section className="pf-panel">
        <div className="pf-panel-heading">
          <div>
            <h2>Seus pacientes</h2>
            <p>Selecione um paciente para abrir seu prontuário.</p>
          </div>
          <span className="pf-count">
            {filteredPatients.length}{" "}
            {filteredPatients.length === 1 ? "paciente" : "pacientes"}
          </span>
        </div>

        <div className="pf-patient-list">
          {clientsLoading && (
  <div className="pf-empty" role="status">
    <h3>Carregando pacientes...</h3>
    <p>Aguarde enquanto buscamos os dados.</p>
  </div>
)}

{!clientsLoading && clientsError && (
  <div className="pf-empty" role="alert">
    <h3>Não foi possível carregar os pacientes.</h3>
    <p>Verifique sua conexão e tente novamente.</p>
  </div>
)}
          {filteredPatients.map((patient) => {
            const initials = String(patient.nome || "P")
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase();

            return (
              <article className="pf-patient" key={patient.id}>
                <div className="pf-avatar">
                  {patient.fotoPerfilUrl ? (
                    <img
                      src={patient.fotoPerfilUrl}
                      alt=""
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="pf-patient-info">
                  <div className="pf-patient-name">
                    {patient.nome || "Paciente sem nome"}
                  </div>

                  <div className="pf-patient-details">
                    <span>{patient.telefone || "Sem telefone"}</span>

                    {patient.cidade && (
                      <span>{patient.cidade}</span>
                    )}

                    {patient.email && (
                      <span>{patient.email}</span>
                    )}
                  </div>
                </div>

                <div className="pf-patient-action">
                  <button
                    type="button"
                    className="pf-button pf-button-secondary"
                    onClick={() =>
                      navigate(
                        `/prontuario?clienteId=${encodeURIComponent(patient.id)}`
                      )
                    }
                    aria-label={`Abrir prontuário de ${patient.nome}`}
                  >
                    <Icon name="folder" size={18} />
                    Prontuário
                    <Icon name="arrow" size={17} />
                  </button>
                </div>
              </article>
            );
          })}
{!clientsLoading && !clientsError && filteredPatients.length === 0 && (
            <div className="pf-empty">
              <div className="pf-empty-icon">
                <Icon name="users" size={28} />
              </div>

              <h3>
                {search.trim()
                  ? "Nenhum paciente encontrado"
                  : "Nenhum paciente cadastrado"}
              </h3>

              <p>
                {search.trim()
                  ? "Tente pesquisar por outro nome ou informação."
                  : "Clique em Novo paciente para realizar o primeiro cadastro."}
              </p>
            </div>
          )}
        </div>
      </section>

      {showForm && (
        <section className="pf-form-wrap" ref={formRef}>
          <div className="pf-form-intro">
            <div>
              <h2>Novo paciente</h2>
              <p>
                Preencha os dados necessários para criar o cadastro.
              </p>
            </div>

            <button
              type="button"
              className="pf-button pf-button-secondary"
              onClick={cancelRegistration}
              disabled={saving}
              aria-label="Fechar cadastro"
            >
              <Icon name="close" size={19} />
            </button>
          </div>

          <div
            className="pf-mode-switch"
            role="group"
            aria-label="Tipo de cadastro"
          >
            <button
              type="button"
              className={
                registrationMode === "rapido"
                  ? "pf-mode active"
                  : "pf-mode"
              }
              onClick={() => setRegistrationMode("rapido")}
              aria-pressed={registrationMode === "rapido"}
            >
              <Icon name="user" size={18} />
              Cadastro rápido
            </button>

            <button
              type="button"
              className={
                registrationMode === "completo"
                  ? "pf-mode active"
                  : "pf-mode"
              }
              onClick={() => setRegistrationMode("completo")}
              aria-pressed={registrationMode === "completo"}
            >
              <Icon name="clipboard" size={18} />
              Cadastro completo
            </button>
          </div>

          <p className="pf-mode-description">
            {registrationMode === "rapido"
              ? "Ideal para cadastrar o paciente em poucos minutos. Os dados adicionais poderão ser preenchidos posteriormente."
              : "Inclui identificação, contato e endereço. As informações clínicas permanecem no prontuário."}
          </p>

          <form onSubmit={submitRegistration}>
            <div className="pf-panel pf-form-panel">
              <SectionTitle
                number="01"
                icon="user"
                title="Identificação"
                subtitle="Dados pessoais e fotografia do paciente."
              />

              <div className="pf-photo-area">
                <div className="pf-photo-preview">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Prévia da foto do paciente"
                    />
                  ) : (
                    <Icon name="user" size={34} />
                  )}
                </div>

                <div className="pf-photo-content">
                  <strong>Fotografia do paciente</strong>
                  <p>Opcional. Escolha uma foto ou use a câmera.</p>

                  <div className="pf-photo-actions">
                    <label
                      className="pf-button pf-button-secondary"
                      style={{ cursor: "pointer", margin: 0 }}
                    >
                      <Icon name="upload" size={16} />
                      Escolher foto

                      <input
                        type="file"
                        accept="image/*"
                        onChange={choosePhoto}
                        style={{ display: "none" }}
                      />
                    </label>

                    <button
                      type="button"
                      className="pf-button pf-button-secondary"
                      onClick={openCamera}
                    >
                      <Icon name="camera" size={16} />
                      Câmera
                    </button>
                  </div>
                </div>
              </div>

              {cameraOpen && (
                <div className="pf-camera">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                  />

                  <div className="pf-photo-actions" style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="pf-button pf-button-primary"
                      onClick={capturePhoto}
                    >
                      <Icon name="camera" size={16} />
                      Capturar foto
                    </button>

                    <button
                      type="button"
                      className="pf-button pf-button-secondary"
                      onClick={closeCamera}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="pf-grid">
                <div className="pf-full">
                  <FormField
                    label="Nome completo"
                    name="nome"
                    value={form.nome}
                    onChange={updateForm}
                    placeholder="Nome e sobrenome"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="pf-divider" />

              <h4 className="pf-subheading">
                Documento de identificação
              </h4>
              <p className="pf-helper">
                Opcional. Ajuda a diferenciar pacientes com nomes semelhantes.
              </p>

              <div className="pf-grid">
                <label className="pf-field">
                  <span className="pf-field-label">
                    Tipo de documento
                  </span>

                  <select
                    className="pf-input"
                    value={form.tipoDocumento}
                    disabled={form.semDocumento}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        tipoDocumento: event.target.value,
                        documento: "",
                      }))
                    }
                  >
                    <option value="CPF">CPF</option>
                    <option value="Passaporte">Passaporte</option>
                    <option value="Outro">Outro documento</option>
                  </select>
                </label>

                <FormField
                  label="Número do documento"
                  name="documento"
                  value={form.documento}
                  onChange={updateForm}
                  placeholder={
                    form.tipoDocumento === "CPF"
                      ? "000.000.000-00"
                      : "Número do documento"
                  }
                  disabled={form.semDocumento}
                  inputMode={
                    form.tipoDocumento === "CPF"
                      ? "numeric"
                      : "text"
                  }
                  maxLength={
                    form.tipoDocumento === "CPF" ? 14 : 50
                  }
                />

                <div className="pf-full">
                  <CheckOption
                    checked={form.semDocumento}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        semDocumento: event.target.checked,
                        documento: event.target.checked
                          ? ""
                          : previous.documento,
                      }))
                    }
                  >
                    Paciente não informou documento
                  </CheckOption>
                </div>
              </div>
            </div>

            <div className="pf-panel pf-form-panel">
              <SectionTitle
                number="02"
                icon="users"
                title="Contato"
                subtitle="Informações para comunicação com o paciente."
              />

              <div className="pf-grid">
                <div>
                  <FormField
                    label="Telefone"
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={updateForm}
                    placeholder="DDD ou código do país + número"
                    autoComplete="tel"
                    required
                  />

                  <div className="pf-field-note">
                    <CheckOption
                      checked={form.temWhatsapp}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          temWhatsapp: event.target.checked,
                        }))
                      }
                    >
                      Este número também é WhatsApp
                    </CheckOption>
                  </div>
                </div>

                <div>
                  <FormField
                    label="E-mail"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateForm}
                    placeholder="email@exemplo.com"
                    autoComplete="email"
                    disabled={form.semEmail}
                    required={!form.semEmail}
                  />

                  <div className="pf-field-note">
                    <CheckOption
                      checked={form.semEmail}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          semEmail: event.target.checked,
                          email: event.target.checked
                            ? ""
                            : previous.email,
                        }))
                      }
                    >
                      Paciente não possui e-mail
                    </CheckOption>
                  </div>
                </div>
              </div>
            </div>

            {registrationMode === "completo" && (
              <div className="pf-panel pf-form-panel">
                <SectionTitle
                  number="03"
                  icon="location"
                  title="Endereço"
                  subtitle="Localização e informações de correspondência."
                />

                <div className="pf-grid">
                  <div className="pf-full">
                    <CheckOption
                      checked={form.pais === "Brasil"}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          pais: event.target.checked ? "Brasil" : "",
                          estado: "",
                        }))
                      }
                    >
                      Endereço no Brasil
                    </CheckOption>
                  </div>

                  {form.pais !== "Brasil" && (
                    <label className="pf-field pf-full">
                      <span className="pf-field-label">
                        País
                      </span>

                      <select
                        className="pf-input"
                        value={form.pais}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            pais: event.target.value,
                            estado: "",
                          }))
                        }
                      >
                        <option value="">Selecione o país</option>
                        <option value="Portugal">Portugal</option>
                        <option value="Países Baixos">
                          Países Baixos
                        </option>
                        <option value="Irlanda">Irlanda</option>
                        <option value="Alemanha">Alemanha</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </label>
                  )}

                  {addressFields.map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.name === "rua" ||
                        field.name === "complemento"
                          ? "pf-full"
                          : ""
                      }
                    >
                      {field.name === "estado" &&
                      (form.pais === "Brasil" ||
                        form.pais === "Países Baixos") ? (
                        <label className="pf-field">
                          <span className="pf-field-label">
                            {field.label}
                          </span>

                          <select
                            name="estado"
                            className="pf-input"
                            value={form.estado}
                            onChange={updateForm}
                          >
                            <option value="">
                              Selecione o estado ou província
                            </option>

                            {(form.pais === "Brasil"
                              ? BRAZIL_STATES
                              : DUTCH_PROVINCES
                            ).map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <FormField
                          label={field.label}
                          name={field.name}
                          value={form[field.name]}
                          onChange={updateForm}
                          onBlur={
                            field.name === "cep"
                              ? lookupPostalCode
                              : undefined
                          }
                          required={field.required}
                          autoComplete={
                            field.name === "cep"
                              ? "postal-code"
                              : field.name === "rua"
                              ? "address-line1"
                              : field.name === "cidade"
                              ? "address-level2"
                              : undefined
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pf-actions">
              <button
                type="button"
                className="pf-button pf-button-secondary"
                onClick={cancelRegistration}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="pf-button pf-button-primary"
                disabled={saving}
              >
                {saving ? (
                  "Salvando..."
                ) : (
                  <>
                    <Icon name="check" size={19} />
                    Salvar paciente
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
