

function readArray(keys) {
  for (const k of keys) {
    try {
      const v = JSON.parse(localStorage.getItem(k) || "[]");
      if (Array.isArray(v)) return v;
    } catch {}
  }
  return [];
}

export default function AgendaKpiStrip() {
  const pacientes = readArray(["pacientes", "clientes"]);
  const compromissos = readArray(["agendamentos", "compromissos"]);

  const hojeISO = new Date().toISOString().slice(0, 10);
  const compromissosHoje = compromissos.filter((c) => {
    const d = (c.data || c.date || "").slice(0, 10);
    return d === hojeISO;
  });

  const lembretes = compromissos.filter(
    (c) => c.lembrete || c.reminder?.enabled || c.reminderOn
  );

  return (
    <div className="kpi-strip container my-3">
      <div className="row g-2 justify-content-center justify-content-lg-start">
        <div className="col-6 col-sm-4 col-lg-auto">
          <div className="kpi-pill">
            <span className="label">Pacientes</span>
            <span className="value">{pacientes.length}</span>
          </div>
        </div>
        <div className="col-6 col-sm-4 col-lg-auto">
          <div className="kpi-pill">
            <span className="label">Hoje</span>
            <span className="value">{compromissosHoje.length}</span>
          </div>
        </div>
        <div className="col-6 col-sm-4 col-lg-auto">
          <div className="kpi-pill">
            <span className="label">Futuros</span>
            <span className="value">{compromissos.length}</span>
          </div>
        </div>
        <div className="col-6 col-sm-4 col-lg-auto">
          <div className="kpi-pill">
            <span className="label">Lembretes</span>
            <span className="value">{lembretes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
