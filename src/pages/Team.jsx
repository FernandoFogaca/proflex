
import { useState } from "react";
import "./Team.css";

const initialTeam = [
  {
    id: 1,
    name: "Maria Oliveira",
    role: "Recepcionista",
    appointments: 50,
    consultations: 0,
    daysWorked: 21,
    status: "Ativo",
  },
  {
    id: 2,
    name: "Ana Costa",
    role: "Recepcionista",
    appointments: 2,
    consultations: 0,
    daysWorked: 18,
    status: "Ativo",
  },
  {
    id: 3,
    name: "Joana Silva",
    role: "Fisioterapeuta",
    appointments: 0,
    consultations: 80,
    daysWorked: 20,
    status: "Ativo",
  },
  {
    id: 4,
    name: "Pedro Santos",
    role: "Fisioterapeuta",
    appointments: 0,
    consultations: 150,
    daysWorked: 22,
    status: "Ativo",
  },
];

const emptyMember = {
  name: "",
  documentType: "CPF",
  document: "",
  birthDate: "",
  email: "",
  phone: "",
  whatsapp: "",
  country: "Brasil",
  postalCode: "",
  street: "",
  number: "",
  noNumber: false,
  complement: "",
  district: "",
  city: "",
  state: "",
  role: "Fisioterapeuta",
  employmentType: "Funcionário contratado",
  council: "CREFITO",
  registration: "",
  specialty: "",
  unit: "Unidade principal",
  displayName: "",
  corporateEmail: "",
  accessProfile: "Profissional clínico",
  status: "Ativo",
};

const professions = [
  "Fisioterapeuta",
  "Médico",
  "Psicólogo",
  "Enfermeiro",
  "Dentista",
  "Nutricionista",
  "Terapeuta ocupacional",
  "Fonoaudiólogo",
  "Farmacêutico",
  "Recepcionista",
  "Administrador",
  "Auxiliar administrativo",
  "Outro",
];

const specialties = {
  Fisioterapeuta: [
    "Fisioterapia geral",
    "Fisioterapia ortopédica",
    "Fisioterapia neurológica",
    "Fisioterapia respiratória",
    "Fisioterapia esportiva",
    "Fisioterapia pediátrica",
    "Fisioterapia geriátrica",
    "Fisioterapia pélvica",
  ],
  Médico: [
    "Clínica médica",
    "Ortopedia e traumatologia",
    "Cardiologia",
    "Neurologia",
    "Pediatria",
    "Geriatria",
    "Dermatologia",
    "Psiquiatria",
    "Medicina de família",
  ],
  Psicólogo: [
    "Psicologia clínica",
    "Neuropsicologia",
    "Psicologia infantil",
    "Psicologia organizacional",
  ],
  Enfermeiro: [
    "Enfermagem geral",
    "Enfermagem obstétrica",
    "Enfermagem pediátrica",
    "Enfermagem do trabalho",
  ],
  Dentista: [
    "Clínica odontológica",
    "Ortodontia",
    "Endodontia",
    "Periodontia",
    "Odontopediatria",
  ],
  Nutricionista: [
    "Nutrição clínica",
    "Nutrição esportiva",
    "Nutrição pediátrica",
  ],
};

const councilByRole = {
  Fisioterapeuta: "CREFITO",
  Médico: "CRM",
  Psicólogo: "CRP",
  Enfermeiro: "COREN",
  Dentista: "CRO",
  Nutricionista: "CRN",
  "Terapeuta ocupacional": "CREFITO",
  Fonoaudiólogo: "CREFONO",
  Farmacêutico: "CRF",
};

const nonClinicalRoles = [
  "Recepcionista",
  "Administrador",
  "Auxiliar administrativo",
];

const countries = [
  "Brasil",
  "Países Baixos",
  "Portugal",
  "Outro",
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validFullName(value) {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2;
}

function makeField(label, name, form, updateField, options = {}) {
  return (
    <label key={name}>
      {label}
      <input
        name={name}
        type={options.type || "text"}
        value={form[name] ?? ""}
        onChange={updateField}
        placeholder={options.placeholder || ""}
      />
    </label>
  );
}

export default function Team() {
  const [team, setTeam] = useState(initialTeam);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formTab, setFormTab] = useState("personal");
  const [form, setForm] = useState({ ...emptyMember });
  const [editingId, setEditingId] = useState(null);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalMessage, setPostalMessage] = useState("");

  const filteredTeam = team.filter((member) =>
    `${member.name} ${member.role} ${member.unit || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const isClinical = !nonClinicalRoles.includes(form.role);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  function updateRole(event) {
    const role = event.target.value;

    setForm((previous) => ({
      ...previous,
      role,
      council: councilByRole[role] || "",
      registration: "",
      specialty: "",
      accessProfile: nonClinicalRoles.includes(role)
        ? role === "Recepcionista"
          ? "Recepção"
          : "Administrativo"
        : "Profissional clínico",
    }));
  }

  function openNewMember() {
    setForm({ ...emptyMember });
    setEditingId(null);
    setFormTab("personal");
    setPin("");
    setConfirmPin("");
    setError("");
    setPostalMessage("");
    setShowModal(true);
  }

  function openEditMember(member) {
    setForm({
      ...emptyMember,
      ...member,
      corporateEmail:
        member.corporateEmail || member.accessEmail || "",
    });

    setEditingId(member.id);
    setFormTab("personal");
    setPin("");
    setConfirmPin("");
    setError("");
    setPostalMessage("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setPin("");
    setConfirmPin("");
    setError("");
  }

  async function searchPostalCode() {
    const cep = form.postalCode.replace(/\D/g, "");

    if (form.country !== "Brasil") {
      setPostalMessage(
        "Para este país, preencha o endereço manualmente."
      );
      return;
    }

    if (cep.length !== 8) {
      setPostalMessage("Informe um CEP brasileiro de 8 dígitos.");
      return;
    }

    setPostalLoading(true);
    setPostalMessage("");

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      if (!response.ok) {
        throw new Error("Serviço indisponível");
      }

      const data = await response.json();

      if (data.erro) {
        setPostalMessage("CEP não encontrado.");
        return;
      }

      setForm((previous) => ({
        ...previous,
        street: data.logradouro || previous.street,
        district: data.bairro || previous.district,
        city: data.localidade || previous.city,
        state: data.uf || previous.state,
      }));

      setPostalMessage(
        "Endereço localizado. Confira e complete os dados."
      );
    } catch {
      setPostalMessage(
        "Não foi possível consultar o CEP. Preencha manualmente."
      );
    } finally {
      setPostalLoading(false);
    }
  }

  function validateForm() {
    if (!validFullName(form.name)) {
      return ["personal", "Informe nome e sobrenome."];
    }

    if (!form.documentType || !form.document.trim()) {
      return ["personal", "Informe um documento de identificação."];
    }

    if (!form.birthDate) {
      return ["personal", "Informe a data de nascimento."];
    }

    if (form.birthDate > new Date().toISOString().slice(0, 10)) {
      return ["personal", "A data de nascimento é inválida."];
    }

    if (!isValidEmail(form.email)) {
      return ["personal", "Informe um e-mail pessoal válido."];
    }

    if (!form.phone.trim() && !form.whatsapp.trim()) {
      return [
        "personal",
        "Informe pelo menos um telefone ou WhatsApp.",
      ];
    }

    if (
      !form.country ||
      !form.postalCode.trim() ||
      !form.street.trim() ||
      (!form.noNumber && !form.number.trim()) ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      return [
        "personal",
        "Complete o endereço: país, CEP, rua, número, cidade e estado.",
      ];
    }

    if (
      form.country === "Brasil" &&
      form.postalCode.replace(/\D/g, "").length !== 8
    ) {
      return ["personal", "O CEP brasileiro deve ter 8 dígitos."];
    }

    if (!form.role || !form.employmentType) {
      return ["professional", "Informe profissão e vínculo."];
    }

    if (isClinical) {
      if (!form.council.trim()) {
        return [
          "professional",
          "Informe o conselho ou órgão de registro profissional.",
        ];
      }

      if (!form.registration.trim()) {
        return [
          "professional",
          "Informe o número do registro profissional.",
        ];
      }
    }

    if (!form.specialty.trim()) {
      return [
        "professional",
        "Selecione uma especialidade ou área de atuação.",
      ];
    }

    if (!form.unit.trim()) {
      return ["professional", "Informe a unidade de trabalho."];
    }

    if (!form.displayName.trim()) {
      return ["access", "Informe o nome de exibição no ProFlex."];
    }

    if (
      form.corporateEmail.trim() &&
      !isValidEmail(form.corporateEmail)
    ) {
      return ["access", "Informe um e-mail empresarial válido."];
    }

    if (!form.accessProfile) {
      return ["access", "Selecione o perfil de permissões."];
    }

    // PIN exigido em novos cadastros.
    // Na edição, um novo PIN é opcional.
    if (editingId === null || pin || confirmPin) {
      if (!/^\d{4,6}$/.test(pin)) {
        return ["access", "O PIN deve conter de 4 a 6 números."];
      }

      if (pin !== confirmPin) {
        return ["access", "Os PINs informados não coincidem."];
      }
    }

    return null;
  }

  function saveMember(event) {
    event.preventDefault();

    const validation = validateForm();

    if (validation) {
      setFormTab(validation[0]);
      setError(validation[1]);
      return;
    }

    // O PIN é validado, mas NÃO é salvo.
    // A ativação do PIN dependerá do backend seguro.
    const memberData = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      corporateEmail: form.corporateEmail.trim(),
      pinStatus: "Pendente de ativação segura",
    };

    if (editingId !== null) {
      setTeam((previous) =>
        previous.map((member) =>
          member.id === editingId
            ? { ...member, ...memberData }
            : member
        )
      );
    } else {
      setTeam((previous) => [
        ...previous,
        {
          ...memberData,
          id: crypto.randomUUID(),
          appointments: 0,
          consultations: 0,
          daysWorked: 0,
        },
      ]);
    }

    closeModal();
  }

  const activeMembers = team.filter(
    (member) => member.status === "Ativo"
  ).length;

  return (
    <div className="team-page">
      <div className="team-page-heading">
        <div>
          <h2>Gestão de Equipe</h2>
          <p>Cadastro e administração dos profissionais.</p>
        </div>

        <button
          type="button"
          className="team-primary"
          onClick={openNewMember}
        >
          + Adicionar profissional
        </button>
      </div>

      <div className="team-summary">
        <article>
          <span>Profissionais cadastrados</span>
          <strong>{team.length}</strong>
        </article>
        <article>
          <span>Profissionais ativos</span>
          <strong>{activeMembers}</strong>
        </article>
        <article>
          <span>Profissionais inativos</span>
          <strong>{team.length - activeMembers}</strong>
        </article>
      </div>

      <section className="team-panel">
        <div className="team-panel-header">
          <div>
            <h3>Profissionais cadastrados</h3>
            <p>Clique em Ver / Editar para consultar a ficha.</p>
          </div>

          <input
            type="search"
            placeholder="Pesquisar profissional..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="team-table-scroll">
          <table className="team-table">
            <thead>
              <tr>
                <th>Profissional</th>
                <th>Função</th>
                <th>Unidade</th>
                <th>Situação</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>
                      {member.displayName || member.name}
                    </strong>
                    <small>{member.email || ""}</small>
                  </td>
                  <td>{member.role}</td>
                  <td>{member.unit || "—"}</td>
                  <td>
                    <span
                      className={
                        member.status === "Ativo"
                          ? "team-status"
                          : "team-status inactive"
                      }
                    >
                      {member.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="team-edit"
                      onClick={() => openEditMember(member)}
                    >
                      Ver / Editar
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTeam.length === 0 && (
                <tr>
                  <td colSpan="5">
                    Nenhum profissional encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="team-demo-note">
        Demonstração: dados não persistidos. Não use
        informações pessoais reais. PIN ainda não ativado.
      </p>

      {showModal && (
        <div className="team-modal-overlay">
          <div
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
          >
            <div className="team-modal-header">
              <div>
                <h2 id="team-modal-title">
                  {editingId !== null
                    ? "Editar profissional"
                    : "Cadastrar profissional"}
                </h2>
                <p>
                  Complete os dados obrigatórios para salvar.
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={closeModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="team-modal-tabs">
              {[
                ["personal", "Dados pessoais"],
                ["professional", "Profissional"],
                ["access", "Acesso"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={formTab === id ? "selected" : ""}
                  onClick={() => {
                    setFormTab(id);
                    setError("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={saveMember} noValidate>
              <div className="team-modal-body">
                {error && (
                  <p className="team-form-error" role="alert">
                    {error}
                  </p>
                )}

                {formTab === "personal" && (
                  <div className="team-form-grid">
                    {makeField(
                      "Nome completo *",
                      "name",
                      form,
                      updateField,
                      { placeholder: "Nome e sobrenome" }
                    )}

                    <label>
                      Tipo de documento *
                      <select
                        name="documentType"
                        value={form.documentType}
                        onChange={updateField}
                      >
                        <option>CPF</option>
                        <option>RG</option>
                        <option>Passaporte</option>
                        <option>Cartão de residência</option>
                        <option>Outro documento</option>
                      </select>
                    </label>

                    {makeField(
                      "Número do documento *",
                      "document",
                      form,
                      updateField
                    )}

                    {makeField(
                      "Data de nascimento *",
                      "birthDate",
                      form,
                      updateField,
                      { type: "date" }
                    )}

                    {makeField(
                      "E-mail pessoal *",
                      "email",
                      form,
                      updateField,
                      { type: "email" }
                    )}

                    {makeField(
                      "Telefone",
                      "phone",
                      form,
                      updateField,
                      { type: "tel" }
                    )}

                    {makeField(
                      "WhatsApp",
                      "whatsapp",
                      form,
                      updateField,
                      { type: "tel" }
                    )}

                    <p className="team-modal-notice">
                      Informe pelo menos um telefone ou WhatsApp.
                    </p>

                    <label>
                      País *
                      <select
                        name="country"
                        value={form.country}
                        onChange={updateField}
                      >
                        {countries.map((country) => (
                          <option key={country}>{country}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      CEP / Código postal *
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={updateField}
                        placeholder="Ex.: 88100-000"
                      />
                    </label>

                    <div style={{ alignSelf: "end" }}>
                      <button
                        type="button"
                        className="team-edit"
                        disabled={postalLoading}
                        onClick={searchPostalCode}
                      >
                        {postalLoading
                          ? "Consultando..."
                          : "Buscar CEP"}
                      </button>
                    </div>

                    {postalMessage && (
                      <p className="team-modal-notice">
                        {postalMessage}
                      </p>
                    )}

                    {makeField(
                      "Rua / Logradouro *",
                      "street",
                      form,
                      updateField
                    )}

                    <label>
                      Número *
                      <input
                        name="number"
                        value={form.noNumber ? "" : form.number}
                        onChange={updateField}
                        disabled={form.noNumber}
                        placeholder="Número"
                      />
                      <span style={{ fontWeight: 400 }}>
                        <input
                          type="checkbox"
                          name="noNumber"
                          checked={form.noNumber}
                          onChange={updateField}
                          style={{ width: "auto", marginRight: 6 }}
                        />
                        Sem número
                      </span>
                    </label>

                    {makeField(
                      "Complemento",
                      "complement",
                      form,
                      updateField
                    )}

                    {makeField(
                      "Bairro",
                      "district",
                      form,
                      updateField
                    )}

                    {makeField(
                      "Cidade *",
                      "city",
                      form,
                      updateField
                    )}

                    {makeField(
                      "Estado / Província *",
                      "state",
                      form,
                      updateField
                    )}
                  </div>
                )}

                {formTab === "professional" && (
                  <div className="team-form-grid">
                    <label>
                      Profissão / Função *
                      <select
                        name="role"
                        value={form.role}
                        onChange={updateRole}
                      >
                        {professions.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Tipo de vínculo *
                      <select
                        name="employmentType"
                        value={form.employmentType}
                        onChange={updateField}
                      >
                        <option>Funcionário contratado</option>
                        <option>Prestador de serviços</option>
                        <option>Autônomo</option>
                        <option>Titular / Proprietário</option>
                      </select>
                    </label>

                    {isClinical && (
                      <>
                        {makeField(
                          "Conselho profissional *",
                          "council",
                          form,
                          updateField,
                          { placeholder: "CRM, CREFITO, CRP..." }
                        )}

                        {makeField(
                          "Número do registro *",
                          "registration",
                          form,
                          updateField
                        )}
                      </>
                    )}

                    <label>
                      Especialidade / Área de atuação *
                      <select
                        name="specialty"
                        value={form.specialty}
                        onChange={updateField}
                      >
                        <option value="">
                          Selecione uma opção
                        </option>

                        {(
                          specialties[form.role] ||
                          [
                            form.role === "Recepcionista"
                              ? "Recepção"
                              : form.role === "Administrador"
                              ? "Administração"
                              : form.role === "Auxiliar administrativo"
                              ? "Apoio administrativo"
                              : "Atuação geral",
                          ]
                        ).map((specialty) => (
                          <option key={specialty}>
                            {specialty}
                          </option>
                        ))}

                        <option value="Outra">
                          Outra especialidade
                        </option>
                      </select>
                    </label>

                    {form.specialty === "Outra" && (
                      <p className="team-modal-notice">
                        Novas especialidades serão adicionadas
                        ao catálogo padronizado pelo administrador.
                      </p>
                    )}

                    <label>
                      Unidade de trabalho *
                      <select
                        name="unit"
                        value={
                          form.unit === "Unidade principal" ||
                          form.unit === "Outra unidade"
                            ? form.unit
                            : "Outra unidade"
                        }
                        onChange={updateField}
                      >
                        <option>Unidade principal</option>
                        <option>Outra unidade</option>
                      </select>
                    </label>

                    {form.unit === "Outra unidade" && (
                      <p className="team-modal-notice">
                        O cadastro de outras unidades será
                        integrado à aba Unidades da Central Premium.
                      </p>
                    )}

                    <label>
                      Situação
                      <select
                        name="status"
                        value={form.status}
                        onChange={updateField}
                      >
                        <option>Ativo</option>
                        <option>Inativo</option>
                      </select>
                    </label>
                  </div>
                )}

                {formTab === "access" && (
                  <div className="team-form-grid">
                    {makeField(
                      "Nome de exibição no ProFlex *",
                      "displayName",
                      form,
                      updateField,
                      { placeholder: "Ex.: Dra. Luciana" }
                    )}

                    {makeField(
                      "E-mail empresarial (opcional)",
                      "corporateEmail",
                      form,
                      updateField,
                      {
                        type: "email",
                        placeholder: "fisio@clinicavida.com",
                      }
                    )}

                    <label>
                      Perfil de permissões *
                      <select
                        name="accessProfile"
                        value={form.accessProfile}
                        onChange={updateField}
                      >
                        <option>Profissional clínico</option>
                        <option>Recepção</option>
                        <option>Administrativo</option>
                      </select>
                    </label>

                    <label>
                      {editingId === null
                        ? "PIN individual *"
                        : "Novo PIN (opcional)"}
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="new-password"
                        placeholder="4 a 6 números"
                        value={pin}
                        maxLength={6}
                        onChange={(event) =>
                          setPin(
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                      />
                    </label>

                    <label>
                      Confirmar PIN
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="new-password"
                        placeholder="Repita o PIN"
                        value={confirmPin}
                        maxLength={6}
                        onChange={(event) =>
                          setConfirmPin(
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6)
                          )
                        }
                      />
                    </label>

                    <p className="team-modal-notice">
                      O e-mail empresarial é para comunicação,
                      não para login.
                      <br />
                      <br />
                      O PIN é obrigatório no cadastro, mas
                      ainda não é ativado ou armazenado.
                      A autenticação segura será implementada
                      no servidor antes do uso real.
                    </p>
                  </div>
                )}
              </div>

              <div className="team-modal-footer">
                <button
                  type="button"
                  className="team-modal-cancel"
                  onClick={closeModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="team-primary"
                >
                  {editingId !== null
                    ? "Salvar alterações"
                    : "Salvar profissional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
