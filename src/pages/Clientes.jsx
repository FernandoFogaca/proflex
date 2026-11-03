
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
  padding: "5px 10px",
  fontSize: "12px",
  borderRadius: "7px",
};

export default function Clientes() {
 const { clients, addClient, salvarFotoPerfil } = useApp();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [form, setForm] = useState(initialForm);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
    const needle = q.toLowerCase();

    return clients.filter((client) =>
      [
        client.nome,
        client.email,
        client.telefone,
        client.endereco,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q, clients]);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
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

    const cep = form.cep.replace(/\D/g, "");

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

 const onSubmit = async (e) => {
    e.preventDefault();
if (form.nome.trim().split(/\s+/).length < 2) {
  alert("Informe o nome e o sobrenome do paciente.");
  return;
}

const telefoneNumeros = form.telefone.replace(/\D/g, "");

if (telefoneNumeros.length < 9 || telefoneNumeros.length > 15) {
  alert("Informe um telefone válido, com 9 a 15 dígitos.");
  return;
}

if (!form.cep.trim()) {
  alert("O CEP ou código postal é obrigatório.");
  return;
}

if (
  form.pais === "Brasil" &&
  !/^\d{8}$/.test(form.cep.replace(/\D/g, ""))
) {
  alert("O CEP brasileiro deve conter 8 números.");
  return;
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

  const novoPaciente = addClient({
  ...form,
  endereco: enderecoCompleto,
});

if (!novoPaciente) return;

if (fotoCapturada) {
  try {
    await salvarFotoPerfil(novoPaciente.id, fotoCapturada);
  } catch (error) {
    console.error("Erro ao salvar foto:", error);
    alert(
      "O paciente foi cadastrado, mas a foto não foi salva. " +
      "Mantenha esta página aberta e tente novamente depois."
    );
    return;
  }
}

setForm({ ...initialForm });
setFotoCapturada(null);
setQ("");
 };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Paciente</h3>

      <form onSubmit={onSubmit}>

        {/* DADOS DO PACIENTE */}

        <div
          className="card border-0 shadow-sm mb-3"
          style={{ borderRadius: "12px" }}
        >
          <div className="card-body p-3 p-md-4">
            <h5 className="mb-3">Dados do paciente</h5>

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
                    <label className="form-label">Nome completo</label>
                    <input
                      className="form-control"
                      name="nome"
                      placeholder="Nome do paciente"
                      value={form.nome}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-lg-6">
                    <label className="form-label">E-mail</label>

                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="E-mail do paciente"
                      value={form.email}
                      onChange={onChange}
                      disabled={form.semEmail}
                      required={!form.semEmail}
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
                    <label className="form-label">Telefone</label>

                    <input
                      type="tel"
                      className="form-control"
                      name="telefone"
                      placeholder="Telefone do paciente"
                      value={form.telefone}
                      onChange={onChange}
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

        {/* ENDEREÇO */}

        <div
          className="card border-0 shadow-sm mb-3"
          style={{ borderRadius: "12px" }}
        >
          <div className="card-body p-3 p-md-4">
            <h5 className="mb-3">Endereço</h5>

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
                  <label className="form-label">{titulo}</label>

                  {campo === "estado" &&
                  (form.pais === "Brasil" ||
                    form.pais === "Países Baixos") ? (
                    <select
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
                      className="form-control"
                      name={campo}
                      value={form[campo]}
                      onChange={onChange}
                      onBlur={
                        campo === "cep"
                          ? buscarCEP
                          : undefined
                      }
                    />
                  )}
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* ADICIONAR */}

        <div className="d-flex justify-content-end mb-4">
          <button
            type="submit"
            className="proflex-button"
            style={{
              width: "auto",
              minWidth: 0,
              padding: "8px 20px",
              fontSize: "13px",
              borderRadius: "7px",
            }}
          >
            Adicionar
          </button>
        </div>

      </form>

      {/* PESQUISA */}

      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Pesquisar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* LISTA DE PACIENTES */}

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Endereço</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  nav(`/prontuario?clienteId=${client.id}`)
                }
              >
                <td>{client.nome}</td>
                <td>{client.email}</td>
                <td>{client.telefone}</td>
                <td>{client.endereco}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">
                  Nenhum cliente
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
