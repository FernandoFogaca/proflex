
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  Plus,
  Bell,
  MessageCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Save,
  X,
  ListTodo,
  Filter,
  ShieldCheck,
  Info,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";

// Mantemos esta chave para preservar lembretes existentes.
const LS_KEY_REM = "reminders";

const gerarId = () =>
  `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function hojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function dataValida(valor) {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor || "");
}

function horaValida(valor) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor || "");
}

function formatarData(valor) {
  if (!dataValida(valor)) {
    return valor || "Não informada";
  }

  const [ano, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${ano}`;
}

function adicionarMinutos(hora, quantidade) {
  if (!horaValida(hora)) return "09:30";

  const [h, m] = hora.split(":").map(Number);
  const minutos = Math.min(h * 60 + m + quantidade, 1439);

  const horas = String(Math.floor(minutos / 60)).padStart(2, "0");
  const minutosFinais = String(minutos % 60).padStart(2, "0");

  return `${horas}:${minutosFinais}`;
}

function duracaoEmMinutos(inicio, fim) {
  if (!horaValida(inicio) || !horaValida(fim)) {
    return 0;
  }

  const [hi, mi] = inicio.split(":").map(Number);
  const [hf, mf] = fim.split(":").map(Number);

  return (hf * 60 + mf) - (hi * 60 + mi);
}

function carregarLembretes() {
  try {
    const valor = localStorage.getItem(LS_KEY_REM);
    const lista = valor ? JSON.parse(valor) : [];

    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function salvarLembretes(lista) {
  try {
    localStorage.setItem(
      LS_KEY_REM,
      JSON.stringify(lista)
    );
  } catch (erro) {
    console.error("Erro ao guardar lembretes:", erro);
  }
}

function tituloCompromisso(item) {
  return String(item.clienteNome || "Compromisso")
    .replace(/^Compromisso:\s*/i, "");
}

function mensagemPadrao(titulo, data, hora) {
  return `Lembrete: ${titulo} em ${formatarData(data)} às ${hora}`;
}

function abrirWhatsApp(telefone, mensagem) {
  const numero = String(telefone || "").replace(/\D/g, "");

  if (numero.length < 8 || numero.length > 15) {
    alert("Informe um telefone válido com código do país.");
    return;
  }

  const texto = encodeURIComponent(
    mensagem || "Olá! Gostaria de entrar em contacto."
  );

  window.open(
    `https://wa.me/${numero}?text=${texto}`,
    "_blank",
    "noopener,noreferrer"
  );
}

const categorias = [
  { value: "pessoal", label: "Pessoal" },
  { value: "profissional", label: "Profissional" },
  { value: "ligacao", label: "Ligação" },
  { value: "tarefa", label: "Tarefa" },
];

export default function Compromissos() {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useApp();

  const [searchParams] = useSearchParams();

  const referenciaFormulario = useRef(null);
  const timersRef = useRef({});
  const rotaCarregadaRef = useRef("");

  const dataDaAgenda = searchParams.get("data");
  const horaDaAgenda = searchParams.get("hora");
  const editarDaAgenda = searchParams.get("appointmentId");

  // Formulário
  const [data, setData] = useState(() =>
    dataValida(dataDaAgenda)
      ? dataDaAgenda
      : hojeISO()
  );

  const [hora, setHora] = useState(() =>
    horaValida(horaDaAgenda)
      ? horaDaAgenda
      : "09:00"
  );

  const [horaFim, setHoraFim] = useState(() =>
    adicionarMinutos(
      horaValida(horaDaAgenda) ? horaDaAgenda : "09:00",
      30
    )
  );

  const [titulo, setTitulo] = useState("");
  const [anotacoes, setAnotacoes] = useState("");
  const [categoria, setCategoria] = useState("pessoal");
  const [status, setStatus] = useState("confirmado");
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Filtros
  const [dataFiltro, setDataFiltro] = useState(hojeISO());
  const [filtro, setFiltro] = useState("futuros");

  // Lembretes
  const [criarLembrete, setCriarLembrete] = useState(true);
  const [antecedencia, setAntecedencia] = useState("0");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [reminders, setReminders] = useState(
    carregarLembretes
  );

  // ==========================================
  // LEMBRETES
  // ==========================================

  useEffect(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};

    reminders.forEach((lembrete) => {
      if (
        !dataValida(lembrete.date) ||
        !horaValida(lembrete.time)
      ) {
        return;
      }

      const horario = new Date(
        `${lembrete.date}T${lembrete.time}:00`
      );

      const minutosAntes = Number(
        lembrete.minutosAntes || 0
      );

      const instante =
        horario.getTime() - minutosAntes * 60 * 1000;

      const diferenca = instante - Date.now();

      // Limitação do temporizador do navegador.
      if (
        diferenca <= 0 ||
        diferenca > 2147483647
      ) {
        return;
      }

      const temporizador = setTimeout(() => {
        const texto =
          lembrete.message ||
          "Você tem um compromisso.";

        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("ProFlex — Lembrete", {
            body: texto,
          });
        }

        alert(`🔔 Lembrete ProFlex\n\n${texto}`);

        // O navegador pode bloquear a abertura automática.
        if (lembrete.whats) {
          abrirWhatsApp(lembrete.whats, texto);
        }
      }, diferenca);

      timersRef.current[lembrete.id] = temporizador;
    });

    salvarLembretes(reminders);

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
    };
  }, [reminders]);

  // ==========================================
  // INTEGRAÇÃO COM A AGENDA GERAL
  // ==========================================

  useEffect(() => {
    const chaveRota = searchParams.toString();

    if (
      !chaveRota ||
      rotaCarregadaRef.current === chaveRota
    ) {
      return;
    }

    if (editarDaAgenda) {
      const compromisso = appointments.find(
        (item) =>
          String(item.id) === String(editarDaAgenda) &&
          item.tipo === "pessoal"
      );

      if (!compromisso) return;

      preencherEdicao(compromisso, false);
      rotaCarregadaRef.current = chaveRota;
      return;
    }

    if (dataValida(dataDaAgenda)) {
      setData(dataDaAgenda);
    }

    if (horaValida(horaDaAgenda)) {
      setHora(horaDaAgenda);
      setHoraFim(adicionarMinutos(horaDaAgenda, 30));
    }

    rotaCarregadaRef.current = chaveRota;
  }, [appointments, searchParams]);

  // ==========================================
  // LISTA E FILTROS
  // ==========================================

  const todosCompromissos = useMemo(() => {
    return appointments.filter(
      (item) => item.tipo === "pessoal"
    );
  }, [appointments]);

  const compromissos = useMemo(() => {
    let lista = [...todosCompromissos];

    if (filtro === "futuros") {
      const hoje = hojeISO();

      lista = lista.filter(
        (item) => item.data >= hoje
      );
    }

    if (filtro === "dia") {
      lista = lista.filter(
        (item) => item.data === dataFiltro
      );
    }

    if (filtro === "concluidos") {
      lista = lista.filter(
        (item) => item.status === "concluido"
      );
    }

    return lista.sort((a, b) => {
      const primeiro = `${a.data || ""} ${a.hora || ""}`;
      const segundo = `${b.data || ""} ${b.hora || ""}`;

      if (
        filtro === "todos" ||
        filtro === "concluidos"
      ) {
        return segundo.localeCompare(primeiro);
      }

      return primeiro.localeCompare(segundo);
    });
  }, [todosCompromissos, filtro, dataFiltro]);

  const quantidadeHoje = todosCompromissos.filter(
    (item) =>
      item.data === hojeISO() &&
      item.status !== "cancelado"
  ).length;

  const quantidadeFuturos = todosCompromissos.filter(
    (item) =>
      item.data >= hojeISO() &&
      item.status !== "cancelado" &&
      item.status !== "concluido"
  ).length;

  const quantidadeConcluidos = todosCompromissos.filter(
    (item) => item.status === "concluido"
  ).length;

  // ==========================================
  // FORMULÁRIO
  // ==========================================

  function limparFormulario() {
    setEditandoId(null);
    setData(hojeISO());
    setHora("09:00");
    setHoraFim("09:30");
    setTitulo("");
    setAnotacoes("");
    setCategoria("pessoal");
    setStatus("confirmado");
    setCriarLembrete(true);
    setAntecedencia("0");
    setTelefone("");
    setMensagem("");
  }

  function preencherEdicao(item, moverPagina = true) {
    const lembrete = reminders.find(
      (registro) =>
        registro.appointmentId === item.id
    );

    setEditandoId(item.id);
    setData(item.data || hojeISO());
    setHora(item.hora || "09:00");

    setHoraFim(
      item.horaFim ||
      adicionarMinutos(item.hora || "09:00", 30)
    );

    setTitulo(tituloCompromisso(item));
    setAnotacoes(item.observacoes || "");
    setCategoria(item.categoria || "pessoal");
    setStatus(item.status || "confirmado");

    setCriarLembrete(Boolean(lembrete));
    setAntecedencia(
      String(lembrete?.minutosAntes || 0)
    );

    setTelefone(
      item.whatsappTelefone ||
      lembrete?.whats ||
      ""
    );

    setMensagem(
      item.whatsappMensagem ||
      lembrete?.message ||
      ""
    );

    if (moverPagina) {
      referenciaFormulario.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  async function solicitarNotificacoes() {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }

    if (Notification.permission === "denied") {
      alert(
        "As notificações estão bloqueadas nas configurações do navegador."
      );
      return;
    }

    try {
      const permissao =
        await Notification.requestPermission();

      if (permissao === "granted") {
        alert("Notificações ativadas neste navegador.");
      }
    } catch (erro) {
      console.error(
        "Erro ao ativar notificações:",
        erro
      );
    }
  }

  // ==========================================
  // SALVAR / EDITAR
  // ==========================================

  async function salvar() {
    if (salvando) return;

    if (!titulo.trim()) {
      alert("Informe o título do compromisso.");
      return;
    }

    if (!dataValida(data)) {
      alert("Selecione uma data válida.");
      return;
    }

    if (
      !horaValida(hora) ||
      !horaValida(horaFim)
    ) {
      alert("Informe os horários corretamente.");
      return;
    }

    const duracao = duracaoEmMinutos(
      hora,
      horaFim
    );

    if (duracao <= 0) {
      alert(
        "O horário de término deve ser posterior ao início."
      );
      return;
    }

    const numero = telefone.replace(/\D/g, "");

    if (
      numero &&
      (numero.length < 8 || numero.length > 15)
    ) {
      alert(
        "Confira o número do WhatsApp e o código do país."
      );
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        data,
        hora,
        horaFim,
        duracaoMin: duracao,
        clienteId: null,
        clienteNome: `Compromisso: ${titulo.trim()}`,
        observacoes: anotacoes.trim(),
        tipo: "pessoal",
        categoria,
        status,
        whatsappTelefone: numero,
        whatsappMensagem: mensagem.trim(),
      };

      let idCompromisso = editandoId;

      if (editandoId) {
        await updateAppointment(
          editandoId,
          dados
        );
      } else {
        const novo = await addAppointment(dados);
        idCompromisso = novo.id;
      }

      setReminders((anteriores) => {
        const restantes = anteriores.filter(
          (item) =>
            item.appointmentId !== idCompromisso
        );

        if (!criarLembrete) {
          return restantes;
        }

        const novoLembrete = {
          id: gerarId(),
          appointmentId: idCompromisso,
          date: data,
          time: hora,
          minutosAntes: Number(antecedencia),
          message:
            mensagem.trim() ||
            mensagemPadrao(
              titulo.trim(),
              data,
              hora
            ),
          whats: numero,
        };

        return [
          ...restantes,
          novoLembrete,
        ];
      });

      const eraEdicao = Boolean(editandoId);

      limparFormulario();

      alert(
        eraEdicao
          ? "Compromisso atualizado com sucesso."
          : "Compromisso guardado com sucesso."
      );
    } catch (erro) {
      console.error(
        "Erro ao salvar compromisso:",
        erro
      );

      alert(
        "Não foi possível guardar o compromisso."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(id, novoStatus) {
    try {
      await updateAppointment(id, {
        status: novoStatus,
      });
    } catch (erro) {
      console.error(
        "Erro ao atualizar status:",
        erro
      );

      alert(
        "Não foi possível atualizar o status."
      );
    }
  }

  // ==========================================
  // EXCLUSÃO
  // ==========================================

  async function excluir(id) {
    if (
      !window.confirm(
        "Deseja remover este compromisso?"
      )
    ) {
      return;
    }

    try {
      await deleteAppointment(id);

      setReminders((anteriores) =>
        anteriores.filter(
          (item) =>
            item.appointmentId !== id
        )
      );

      if (editandoId === id) {
        limparFormulario();
      }
    } catch (erro) {
      console.error(
        "Erro ao remover compromisso:",
        erro
      );

      alert(
        "Não foi possível remover o compromisso."
      );
    }
  }

  async function limparDia() {
    const doDia = todosCompromissos.filter(
      (item) => item.data === dataFiltro
    );

    if (doDia.length === 0) {
      alert(
        "Não existem compromissos nesta data."
      );
      return;
    }

    const confirmado = window.confirm(
      `Deseja remover ${doDia.length} compromisso(s) de ${formatarData(dataFiltro)}?`
    );

    if (!confirmado) return;

    try {
      await Promise.all(
        doDia.map((item) =>
          deleteAppointment(item.id)
        )
      );

      const ids = new Set(
        doDia.map((item) => item.id)
      );

      setReminders((anteriores) =>
        anteriores.filter(
          (item) =>
            !ids.has(item.appointmentId)
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao limpar dia:",
        erro
      );

      alert(
        "Alguns compromissos podem não ter sido removidos."
      );
    }
  }

  // ==========================================
  // WHATSAPP
  // ==========================================

  function mandarMensagem(item) {
    const lembrete = reminders.find(
      (registro) =>
        registro.appointmentId === item.id
    );

    const numero =
      item.whatsappTelefone ||
      lembrete?.whats;

    const texto =
      item.whatsappMensagem ||
      lembrete?.message ||
      mensagemPadrao(
        tituloCompromisso(item),
        item.data,
        item.hora
      );

    abrirWhatsApp(numero, texto);
  }

  // ==========================================
  // INTERFACE
  // ==========================================

  return (
    <div className="pfc container py-4">
      <style>{`
        .pfc {
          max-width: 1480px;
          color: #193440;
        }

        /* RESUMO - CONTRASTE PARA LIGHT E DARK */

        .pfc .pfc-summary {
          display: flex;
          width: fit-content;
          max-width: 100%;
          flex-wrap: wrap;
          align-items: center;
          gap: 25px;
          padding: 13px 20px;
          margin-bottom: 25px;
          border: 1px solid rgba(124, 232, 214, 0.25);
          border-radius: 13px;
          background: #123b43;
          color: #e6f7f4 !important;
          box-shadow: 0 5px 18px rgba(0, 0, 0, 0.06);
        }

        .pfc .pfc-summary span {
          color: #e6f7f4 !important;
          font-size: 15px;
        }

        .pfc .pfc-summary strong {
          color: #ffffff !important;
          font-weight: 800;
        }

        .pfc-summary-item {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        /* CARTÕES */

        .pfc .pfc-card {
          padding: 24px;
          margin-bottom: 22px;
          border: 1px solid #e0e9ed;
          border-radius: 18px;
          background: #ffffff;
          color: #193440;
          box-shadow: 0 5px 24px rgba(18, 54, 68, 0.05);
        }

        .pfc-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 22px;
          color: #183846;
          font-size: 19px;
          font-weight: 800;
        }

        .pfc-section-title svg {
          color: #0f9c8c;
        }

        /* FORMULÁRIO */

        .pfc label {
          display: block;
          margin-bottom: 7px;
          color: #365463;
          font-size: 13px;
          font-weight: 700;
        }

        .pfc .form-control,
        .pfc .form-select {
          min-height: 43px;
          border: 1px solid #d9e5e9;
          border-radius: 10px;
          background: #ffffff;
          color: #193440;
        }

        .pfc .form-control:focus,
        .pfc .form-select:focus {
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.14);
        }

        .pfc .form-check-input {
          min-height: auto;
        }

        .pfc .form-check-label {
          display: inline;
          margin: 0;
          font-weight: 600;
        }

        /* LEMBRETES */

        .pfc-reminder-box {
          padding: 20px;
          margin-top: 18px;
          border: 1px solid #d9eee9;
          border-radius: 13px;
          background: #f1f9f7;
          color: #193440;
        }

        .pfc-reminder-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          color: #146c64;
          font-weight: 800;
        }

        /* BOTÕES */

        .pfc-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(
            120deg,
            #14b8a6,
            #0f766e
          );
          color: #ffffff;
          font-weight: 750;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .pfc-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(18, 143, 129, 0.17);
        }

        .pfc-btn-primary:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .pfc-btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 14px;
          border: 1px solid #d3e0e4;
          border-radius: 10px;
          background: #ffffff;
          color: #365361;
          font-weight: 650;
          cursor: pointer;
        }

        /* FILTROS */

        .pfc-filters {
          display: flex;
          flex-wrap: wrap;
          align-items: end;
          justify-content: space-between;
          gap: 14px;
        }

        .pfc-filter-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
        }

        /* LISTA DE COMPROMISSOS */

        .pfc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 18px;
          margin-top: 11px;
          border: 1px solid #e0eaed;
          border-left: 4px solid #13a895;
          border-radius: 12px;
          background: #fbfdfd;
          color: #193440;
        }

        .pfc-item.cancelado {
          border-left-color: #e58a8a;
          opacity: 0.75;
        }

        .pfc-item.concluido {
          border-left-color: #4da77b;
        }

        .pfc-item-main {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          min-width: 0;
          flex: 1;
        }

        .pfc-date-box {
          flex-shrink: 0;
          min-width: 92px;
          padding: 10px;
          border-radius: 10px;
          background: #eaf7f3;
          color: #128274;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
        }

        .pfc-item-title {
          margin-bottom: 5px;
          color: #203d49;
          font-size: 15px;
          font-weight: 800;
        }

        .pfc-meta {
          color: #718894;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .pfc-category {
          display: inline-block;
          padding: 3px 9px;
          margin-top: 7px;
          border-radius: 20px;
          background: #edf5f5;
          color: #257e77;
          font-size: 11px;
          font-weight: 700;
        }

        .pfc-item-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .pfc-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid #d9e5e9;
          border-radius: 9px;
          background: #ffffff;
          color: #3b6670;
          cursor: pointer;
        }

        .pfc-icon-button:hover {
          background: #e8f7f2;
          color: #0c8c7c;
        }

        .pfc-icon-button.whatsapp {
          background: #e6f6ed;
          border-color: #bde8d0;
          color: #128c62;
        }

        .pfc-icon-button.delete {
          color: #c34c55;
        }

        .pfc-icon-button.delete:hover {
          background: #fff0f1;
        }

        .pfc-empty {
          padding: 36px 18px;
          color: #7a929c;
          text-align: center;
        }

        .pfc-note {
          display: flex;
          gap: 9px;
          margin-top: 13px;
          color: #728b93;
          font-size: 12px;
          line-height: 1.6;
        }

        .pfc-note svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .pfc button:focus-visible {
          outline: 3px solid #9ee7d7;
          outline-offset: 3px;
        }

        /* MODO ESCURO */

        :root[data-proflex-theme="dark"]
        .pfc .pfc-summary {
          background: #123b43;
          border-color: rgba(124, 232, 214, 0.35);
          color: #e6f7f4 !important;
        }

        :root[data-proflex-theme="dark"]
        .pfc .pfc-summary span {
          color: #e6f7f4 !important;
        }

        :root[data-proflex-theme="dark"]
        .pfc .pfc-summary strong {
          color: #ffffff !important;
        }

        /* RESPONSIVIDADE */

        @media (max-width: 768px) {
          .pfc .pfc-card {
            padding: 18px;
          }

          .pfc .pfc-summary {
            width: 100%;
            gap: 15px;
            padding: 15px;
          }

          .pfc-item {
            align-items: stretch;
          }

          .pfc-item-actions {
            width: 100%;
          }

          .pfc-item-actions .form-select {
            flex: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pfc * {
            transition: none !important;
          }
        }
      `}</style>

      {/* ======================================
          RESUMO COMPACTO
          ====================================== */}

      <div className="pfc-summary">
        <div className="pfc-summary-item">
          <CalendarDays size={19} color="#7ce8d6" />

          <span>
            Hoje:{" "}
            <strong style={{ color: "#ffffff" }}>
              {quantidadeHoje}
            </strong>
          </span>
        </div>

        <div className="pfc-summary-item">
          <Clock3 size={19} color="#7ce8d6" />

          <span>
            Próximos:{" "}
            <strong style={{ color: "#ffffff" }}>
              {quantidadeFuturos}
            </strong>
          </span>
        </div>

        <div className="pfc-summary-item">
          <CheckCircle2 size={19} color="#7ce8d6" />

          <span>
            Concluídos:{" "}
            <strong style={{ color: "#ffffff" }}>
              {quantidadeConcluidos}
            </strong>
          </span>
        </div>
      </div>

      {/* ======================================
          NOVO COMPROMISSO / EDIÇÃO
          ====================================== */}

      <section
        className="pfc-card"
        ref={referenciaFormulario}
      >
        <h3 className="pfc-section-title">
          {editandoId ? (
            <Pencil size={23} />
          ) : (
            <Plus size={23} />
          )}

          {editandoId
            ? "Editar compromisso"
            : "Novo compromisso"}
        </h3>

        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="pfc-data">
              Data
            </label>

            <input
              id="pfc-data"
              type="date"
              className="form-control"
              value={data}
              onChange={(e) =>
                setData(e.target.value)
              }
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="pfc-hora">
              Hora inicial
            </label>

            <input
              id="pfc-hora"
              type="time"
              className="form-control"
              value={hora}
              onChange={(e) => {
                const novaHora = e.target.value;

                setHora(novaHora);
                setHoraFim(
                  adicionarMinutos(novaHora, 30)
                );
              }}
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="pfc-hora-fim">
              Hora final
            </label>

            <input
              id="pfc-hora-fim"
              type="time"
              className="form-control"
              value={horaFim}
              onChange={(e) =>
                setHoraFim(e.target.value)
              }
            />
          </div>

          <div className="col-md-8">
            <label htmlFor="pfc-titulo">
              O que precisa fazer?
            </label>

            <input
              id="pfc-titulo"
              type="text"
              className="form-control"
              placeholder="Ex.: Ligar para paciente, reunião, compromisso pessoal..."
              value={titulo}
              onChange={(e) =>
                setTitulo(e.target.value)
              }
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="pfc-categoria">
              Categoria
            </label>

            <select
              id="pfc-categoria"
              className="form-select"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value)
              }
            >
              {categorias.map((opcao) => (
                <option
                  key={opcao.value}
                  value={opcao.value}
                >
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-8">
            <label htmlFor="pfc-anotacoes">
              Anotações
            </label>

            <textarea
              id="pfc-anotacoes"
              className="form-control"
              rows={2}
              placeholder="Informações importantes sobre o compromisso"
              value={anotacoes}
              onChange={(e) =>
                setAnotacoes(e.target.value)
              }
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="pfc-status">
              Status
            </label>

            <select
              id="pfc-status"
              className="form-select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="confirmado">
                Confirmado
              </option>

              <option value="concluido">
                Concluído
              </option>

              <option value="cancelado">
                Cancelado
              </option>
            </select>
          </div>
        </div>

        {/* ======================================
            LEMBRETES
            ====================================== */}

        <div className="pfc-reminder-box">
          <div className="form-check mb-3">
            <input
              id="pfc-ativar-lembrete"
              type="checkbox"
              className="form-check-input"
              checked={criarLembrete}
              onChange={(e) =>
                setCriarLembrete(e.target.checked)
              }
            />

            <label
              className="form-check-label"
              htmlFor="pfc-ativar-lembrete"
            >
              <Bell
                size={15}
                className="me-2"
              />
              Criar lembrete
            </label>
          </div>

          {criarLembrete && (
            <>
              <div className="pfc-reminder-title">
                <Bell size={17} />
                Configuração do lembrete
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="pfc-antes">
                    Quando avisar?
                  </label>

                  <select
                    id="pfc-antes"
                    className="form-select"
                    value={antecedencia}
                    onChange={(e) =>
                      setAntecedencia(
                        e.target.value
                      )
                    }
                  >
                    <option value="0">
                      No horário
                    </option>

                    <option value="10">
                      10 minutos antes
                    </option>

                    <option value="30">
                      30 minutos antes
                    </option>

                    <option value="60">
                      1 hora antes
                    </option>

                    <option value="1440">
                      1 dia antes
                    </option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="pfc-telefone">
                    WhatsApp (opcional)
                  </label>

                  <input
                    id="pfc-telefone"
                    type="tel"
                    className="form-control"
                    placeholder="Ex.: 31612345678"
                    value={telefone}
                    onChange={(e) =>
                      setTelefone(e.target.value)
                    }
                  />
                </div>

                <div className="col-md-4 d-flex align-items-end">
                  <button
                    type="button"
                    className="pfc-btn-outline w-100"
                    onClick={solicitarNotificacoes}
                  >
                    <Bell size={16} />
                    Ativar notificações
                  </button>
                </div>

                <div className="col-12">
                  <label htmlFor="pfc-mensagem">
                    Mensagem do lembrete / WhatsApp
                  </label>

                  <textarea
                    id="pfc-mensagem"
                    className="form-control"
                    rows={2}
                    placeholder="Ex.: Lembrar de telefonar às 14h"
                    value={mensagem}
                    onChange={(e) =>
                      setMensagem(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="pfc-note">
                <Info size={16} />

                <span>
                  Os lembretes funcionam enquanto
                  o ProFlex estiver aberto no navegador.
                  O botão WhatsApp abre a conversa com
                  uma mensagem pronta, mas o envio
                  precisa ser confirmado manualmente.
                </span>
              </div>
            </>
          )}
        </div>

        {/* BOTÕES DO FORMULÁRIO */}

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            className="pfc-btn-primary"
            onClick={salvar}
            disabled={salvando}
          >
            <Save size={18} />

            {salvando
              ? "A guardar..."
              : editandoId
                ? "Guardar alterações"
                : "Guardar compromisso"}
          </button>

          {editandoId && (
            <button
              type="button"
              className="pfc-btn-outline"
              onClick={limparFormulario}
            >
              <X size={17} />
              Cancelar edição
            </button>
          )}
        </div>

        <div className="pfc-note">
          <ShieldCheck size={16} />

          <span>
            O compromisso também aparecerá na Agenda
            geral. A duração será registada, mas o
            bloqueio automático de todo o intervalo
            ainda será implementado.
          </span>
        </div>
      </section>

      {/* ======================================
          FILTROS
          ====================================== */}

      <section className="pfc-card">
        <h3 className="pfc-section-title">
          <Filter size={23} />
          Consultar compromissos
        </h3>

        <div className="pfc-filters">
          <div className="pfc-filter-group">
            <div>
              <label htmlFor="pfc-filtro">
                Mostrar
              </label>

              <select
                id="pfc-filtro"
                className="form-select"
                value={filtro}
                onChange={(e) =>
                  setFiltro(e.target.value)
                }
              >
                <option value="futuros">
                  Hoje e futuros
                </option>

                <option value="dia">
                  Data selecionada
                </option>

                <option value="todos">
                  Todos os compromissos
                </option>

                <option value="concluidos">
                  Concluídos
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="pfc-data-filtro">
                Data para consultar
              </label>

              <input
                id="pfc-data-filtro"
                type="date"
                className="form-control"
                value={dataFiltro}
                onChange={(e) =>
                  setDataFiltro(e.target.value)
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={limparDia}
          >
            <Trash2
              size={16}
              className="me-2"
            />
            Limpar dia
          </button>
        </div>

        <div className="pfc-note">
          <Info size={16} />

          <span>
            A data de consulta serve apenas
            para filtrar a lista.
          </span>
        </div>
      </section>

      {/* ======================================
          LISTA DE COMPROMISSOS
          ====================================== */}

      <section className="pfc-card">
        <h3 className="pfc-section-title">
          <ListTodo size={23} />

          Minha lista

          <span className="badge bg-secondary ms-2">
            {compromissos.length}
          </span>
        </h3>

        {compromissos.length === 0 && (
          <div className="pfc-empty">
            <CalendarDays
              size={32}
              className="mb-3"
            />

            <p className="mb-0">
              Nenhum compromisso encontrado
              neste período.
            </p>
          </div>
        )}

        {compromissos.map((item) => {
          const nome = tituloCompromisso(item);

          const categoriaAtual = categorias.find(
            (opcao) =>
              opcao.value === item.categoria
          );

          const lembrete = reminders.find(
            (registro) =>
              registro.appointmentId === item.id
          );

          const temWhatsApp = Boolean(
            item.whatsappTelefone ||
            lembrete?.whats
          );

          return (
            <article
              className={`pfc-item ${item.status || ""}`}
              key={item.id}
            >
              <div className="pfc-item-main">
                <div className="pfc-date-box">
                  {formatarData(item.data)}
                </div>

                <div>
                  <div className="pfc-item-title">
                    {nome}
                  </div>

                  <div className="pfc-meta">
                    <Clock3
                      size={13}
                      className="me-1"
                    />

                    {item.hora || "--:--"}

                    {item.horaFim
                      ? ` – ${item.horaFim}`
                      : ""}

                    {item.observacoes && (
                      <div>
                        {item.observacoes}
                      </div>
                    )}
                  </div>

                  <span className="pfc-category">
                    {categoriaAtual?.label || "Pessoal"}
                  </span>
                </div>
              </div>

              <div className="pfc-item-actions">
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  aria-label={`Estado de ${nome}`}
                  value={item.status || "confirmado"}
                  onChange={(e) =>
                    alterarStatus(
                      item.id,
                      e.target.value
                    )
                  }
                >
                  <option value="confirmado">
                    Confirmado
                  </option>

                  <option value="concluido">
                    Concluído
                  </option>

                  <option value="cancelado">
                    Cancelado
                  </option>
                </select>

                {temWhatsApp && (
                  <button
                    type="button"
                    className="pfc-icon-button whatsapp"
                    title="Abrir mensagem no WhatsApp"
                    aria-label={`Abrir WhatsApp para ${nome}`}
                    onClick={() =>
                      mandarMensagem(item)
                    }
                  >
                    <MessageCircle size={18} />
                  </button>
                )}

                <button
                  type="button"
                  className="pfc-icon-button"
                  title="Editar compromisso"
                  aria-label={`Editar ${nome}`}
                  onClick={() =>
                    preencherEdicao(item)
                  }
                >
                  <Pencil size={17} />
                </button>

                <button
                  type="button"
                  className="pfc-icon-button delete"
                  title="Remover compromisso"
                  aria-label={`Remover ${nome}`}
                  onClick={() =>
                    excluir(item.id)
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
