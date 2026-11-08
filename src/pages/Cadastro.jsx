
import React, { useState, useEffect } from "react";
import { UserRound, Building2, CalendarRange } from "lucide-react";

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

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [profissao, setProfissao] = useState("");
  const [registroProfissional, setRegistroProfissional] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoPerfil, setTipoPerfil] = useState("autonomo");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomeClinica, setNomeClinica] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [enderecoClinica, setEnderecoClinica] = useState("");
  const [whatsappClinica, setWhatsappClinica] = useState("");

  const [endereco, setEndereco] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [cidades, setCidades] = useState([]);
  const [erroCidades, setErroCidades] = useState(false);

  useEffect(() => {
    if (!endereco.estado) {
      setCidades([]);
      setErroCidades(false);
      return;
    }

    let ativo = true;

    async function carregarCidades() {
      setCidades([]);
      setErroCidades(false);

      try {
        const resposta = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${endereco.estado}/municipios?orderBy=nome`
        );

        if (!resposta.ok) {
          throw new Error("Erro ao buscar cidades");
        }

        const dados = await resposta.json();

        if (ativo) {
          setCidades(dados);
        }
      } catch (erro) {
        console.error("Erro ao carregar cidades:", erro);

        if (ativo) {
          setErroCidades(true);
        }
      }
    }

    carregarCidades();

    return () => {
      ativo = false;
    };
  }, [endereco.estado]);

  async function buscarCEP(cep) {
    const numeros = cep.replace(/\D/g, "");

    if (numeros.length !== 8) return;

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${numeros}/json/`
      );

      if (!resposta.ok) {
        throw new Error("Erro na consulta do CEP");
      }

      const dados = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setEndereco((anterior) => ({
        ...anterior,
        cep: numeros,
        rua: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        estado: dados.uf || "",
      }));
    } catch (erro) {
      console.error("Erro ao consultar CEP:", erro);
      alert("Não foi possível consultar o CEP.");
    }
  }

  const profissoes = {
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

  return (
    <div className="container py-5">
      <h2>Criar conta no ProFlex</h2>

      <form>
        <input
          className="form-control mb-3"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <div className="mb-3">
          <label className="form-label">
            CPF do responsável
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            maxLength={14}
          />
        </div>

        <input
          type="email"
          className="form-control mb-3"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <div className="mb-3">
          <label className="form-label">
            WhatsApp principal
          </label>
          <input
            type="tel"
            className="form-control"
            placeholder="Ex.: +55 48 99999-9999"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        <div className="mb-3">
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

        {/* SELEÇÃO DE PERFIL PREMIUM */}
        <div className="mb-4">
          <h5 className="fw-semibold mb-2">
            Como você pretende utilizar o ProFlex?
          </h5>

          <p className="text-muted mb-4">
            Selecione o perfil que melhor representa seu trabalho.
          </p>

          <div className="row g-3">
            {[
              {
                id: "autonomo",
                titulo: "Profissional autônomo",
                descricao:
                  "Para quem realiza atendimentos particulares.",
                icone: UserRound,
              },
              {
                id: "clinica",
                titulo: "Clínica",
                descricao:
                  "Para administrar uma clínica e sua equipe.",
                icone: Building2,
              },
              {
                id: "hibrido",
                titulo: "Profissional híbrido",
                descricao:
                  "Para quem atende em clínicas e também de forma particular.",
                icone: CalendarRange,
              },
            ].map((perfil) => {
              const Icone = perfil.icone;
              const selecionado = tipoPerfil === perfil.id;

              return (
                <div className="col-md-4" key={perfil.id}>
                  <button
                    type="button"
                    onClick={() => setTipoPerfil(perfil.id)}
                    aria-pressed={selecionado}
                    className="card h-100 w-100 text-start p-4"
                    style={{
                      cursor: "pointer",
                      borderRadius: "18px",
                      border: selecionado
                        ? "2px solid #0D9488"
                        : "1px solid #E2E8F0",
                      backgroundColor: selecionado
                        ? "#F0FDFA"
                        : "#FFFFFF",
                      boxShadow: selecionado
                        ? "0 8px 24px rgba(13,148,136,0.12)"
                        : "0 3px 12px rgba(0,0,0,0.04)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        backgroundColor: selecionado
                          ? "#CCFBF1"
                          : "#F1F5F9",
                        color: selecionado
                          ? "#0D9488"
                          : "#475569",
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

        {/* ENDEREÇO DO RESPONSÁVEL */}
        <div className="mb-4">
          <h5 className="fw-semibold mb-3">
            Endereço do responsável
          </h5>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">CEP</label>
              <input
                className="form-control"
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                value={endereco.cep}
                onChange={(e) => {
                  const valor = e.target.value;

                  setEndereco((anterior) => ({
                    ...anterior,
                    cep: valor,
                  }));

                  buscarCEP(valor);
                }}
                required
              />
            </div>

            <div className="col-md-8">
              <label className="form-label">Rua</label>
              <input
                className="form-control"
                value={endereco.rua}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    rua: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Número</label>
              <input
                className="form-control"
                value={endereco.numero}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    numero: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="col-md-8">
              <label className="form-label">
                Complemento (opcional)
              </label>
              <input
                className="form-control"
                value={endereco.complemento}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    complemento: e.target.value,
                  }))
                }
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Bairro</label>
              <input
                className="form-control"
                value={endereco.bairro}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    bairro: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Estado (UF)</label>
              <select
                className="form-select"
                value={endereco.estado}
                onChange={(e) =>
                  setEndereco((anterior) => ({
                    ...anterior,
                    estado: e.target.value,
                    cidade: "",
                  }))
                }
                required
              >
                <option value="">Selecione o estado</option>
                {ESTADOS.map(([sigla, nomeEstado]) => (
                  <option key={sigla} value={sigla}>
                    {nomeEstado}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Cidade</label>

              {erroCidades ? (
                <input
                  className="form-control"
                  placeholder="Digite a cidade"
                  value={endereco.cidade}
                  onChange={(e) =>
                    setEndereco((anterior) => ({
                      ...anterior,
                      cidade: e.target.value,
                    }))
                  }
                  required
                />
              ) : (
                <select
                  className="form-select"
                  value={endereco.cidade}
                  onChange={(e) =>
                    setEndereco((anterior) => ({
                      ...anterior,
                      cidade: e.target.value,
                    }))
                  }
                  disabled={!endereco.estado}
                  required
                >
                  <option value="">Selecione a cidade</option>

                  {endereco.cidade &&
                    !cidades.some(
                      (cidade) => cidade.nome === endereco.cidade
                    ) && (
                      <option value={endereco.cidade}>
                        {endereco.cidade}
                      </option>
                    )}

                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* DADOS PROFISSIONAIS */}
        {(tipoPerfil === "autonomo" ||
          tipoPerfil === "hibrido") && (
          <div className="mb-3">
            <h5>Dados profissionais</h5>

            <label className="form-label">Profissão</label>

            <select
              className="form-select mb-3"
              value={profissao}
              onChange={(e) => {
                setProfissao(e.target.value);
                setRegistroProfissional("");
              }}
              required
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

            {profissao && (
              <div className="mb-3">
                <label className="form-label">
                  {profissoes[profissao]}
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder={`Informe seu ${profissoes[profissao]}`}
                  value={registroProfissional}
                  onChange={(e) =>
                    setRegistroProfissional(e.target.value)
                  }
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* DADOS DA CLÍNICA */}
        {tipoPerfil === "clinica" && (
          <div className="mb-3">
            <h5>Dados da clínica</h5>

            <input
              className="form-control mb-3"
              placeholder="Nome da clínica"
              value={nomeClinica}
              onChange={(e) =>
                setNomeClinica(e.target.value)
              }
            />

            <div className="mb-3">
              <label className="form-label">
                CNPJ da clínica
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="00.000.000/0000-00"
                value={cnpj}
                onChange={(e) =>
                  setCnpj(e.target.value)
                }
                maxLength={18}
              />
            </div>

            <input
              className="form-control mb-3"
              placeholder="Endereço da clínica"
              value={enderecoClinica}
              onChange={(e) =>
                setEnderecoClinica(e.target.value)
              }
            />

            <input
              type="tel"
              className="form-control mb-3"
              placeholder="WhatsApp da clínica"
              value={whatsappClinica}
              onChange={(e) =>
                setWhatsappClinica(e.target.value)
              }
            />
          </div>
        )}

        <button type="button" className="btn btn-primary">
          Criar conta
        </button>
      </form>
    </div>
  );
}
