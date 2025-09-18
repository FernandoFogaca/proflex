
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* datas (BR) */
function fmtDateBR(dateStr) {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch { return ""; }
}

/* países (lista maior) */
const PAISES = [
  { code:"BR", nome:"Brasil 🇧🇷" },
  { code:"PT", nome:"Portugal 🇵🇹" },
  { code:"US", nome:"Estados Unidos 🇺🇸" },
  { code:"GB", nome:"Reino Unido 🇬🇧" },
  { code:"AR", nome:"Argentina" },
  { code:"CL", nome:"Chile" },
  { code:"MX", nome:"México" },
  { code:"ES", nome:"Espanha " },
  { code:"FR", nome:"França 🇫🇷" },
  { code:"DE", nome:"Alemanha" },
  { code:"IT", nome:"Itália" },
  { code:"NL", nome:"Holanda 🇳🇱" },
  { code:"BE", nome:"Bélgica" },
  { code:"CA", nome:"Canadá" },
  { code:"JP", nome:"Japão" },
  { code:"KR", nome:"Coreia do Sul" },
  { code:"AU", nome:"Austrália" },
  { code:"IN", nome:"Índia" },
  { code:"ZA", nome:"África do Sul" },
];

/* categorias Google News */
const CATEGORIAS = [
  { key:"", label:"Todas" },
  { key:"WORLD", label:"Mundo" },
  { key:"NATION", label:"País" },
  { key:"BUSINESS", label:"Negócios" },
  { key:"TECHNOLOGY", label:"Tecnologia" },
  { key:"ENTERTAINMENT", label:"Entretenimento" },
  { key:"SPORTS", label:"Esportes" },
  { key:"SCIENCE", label:"Ciência" },
  { key:"HEALTH", label:"Saúde" },
];

/* idioma por país  */
const LANG_BY_COUNTRY = {
  BR: "pt-BR",
  PT: "pt-PT",
  ES: "es",
  AR: "es-419",
  MX: "es-419",
  US: "en",
  GB: "en-GB",
  CA: "en",
  AU: "en-AU",
  FR: "fr",
  DE: "de",
  IT: "it",
  NL: "nl",
  BE: "fr",
  JP: "ja",
  KR: "ko",
  IN: "en-IN",
  ZA: "en-ZA",
  CL: "es-419",
};

/* monta URL RSS do Google News */
function buildGoogleNewsRss({ country="BR", topic="", q="", escopo="br" }) {
  const base = "https://news.google.com/rss";
  const lang = LANG_BY_COUNTRY[country] || "en";
  const params = new URLSearchParams();
  params.set("hl", lang);
  params.set("gl", country);
  // ceid no formato PAIS:lang-curto (usa a parte antes do '-')
  const langShort = lang.split("-")[0];
  params.set("ceid", `${country}:${langShort}`);

  // escopo "Mundo": força tópico WORLD (se usuário não escolher um)
  if (escopo === "world" && !topic && !q) topic = "WORLD";

  if (q) {
    const p2 = new URLSearchParams(params.toString());
    p2.set("q", q);
    return `${base}/search?${p2.toString()}`;
  }
  if (topic) {
    return `${base}/headlines/section/topic/${topic}?${params.toString()}`;
  }
  return `${base}/headlines?${params.toString()}`;
}

/* fetchers (3 tentativas) */
async function fetchViaRss2Json(rssUrl) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("rss2json");
  const j = await r.json();
  if (!j || !j.items) throw new Error("rss2json vazio");
  return j.items.map((it) => ({
    id: it.guid || it.link,
    title: it.title,
    link: it.link,
    source: it.author || (j.feed && j.feed.title) || "Fonte",
    pubDate: it.pubDate || it.updated || new Date().toISOString(),
    image: it.enclosure?.link || it.thumbnail || "",
    snippet: it.description ? it.description.replace(/<[^>]+>/g,"").trim() : "",
  }));
}

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const items = Array.from(doc.querySelectorAll("item"));
  const feedTitle = doc.querySelector("channel > title")?.textContent || "Fonte";
  return items.map((it, idx) => {
    const title = it.querySelector("title")?.textContent || "(sem título)";
    const link = it.querySelector("link")?.textContent || "#";
    const pubDate = it.querySelector("pubDate")?.textContent || new Date().toISOString();
    const source = it.querySelector("source")?.textContent || feedTitle;
    const media = it.querySelector("media\\:content, content");
    const enclosure = it.querySelector("enclosure");
    const img = media?.getAttribute("url") || enclosure?.getAttribute("url") || "";
    const desc = it.querySelector("description")?.textContent || "";
    return {
      id: link || idx,
      title, link, source, pubDate,
      image: img,
      snippet: desc.replace(/<[^>]+>/g,"").trim(),
    };
  });
}

async function fetchDirectXml(rssUrl) {
  const r = await fetch(rssUrl);
  if (!r.ok) throw new Error("rss direto");
  const txt = await r.text();
  return parseXml(txt);
}

async function fetchViaAllOrigins(rssUrl) {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
  const r = await fetch(proxy);
  if (!r.ok) throw new Error("allorigins");
  const txt = await r.text();
  return parseXml(txt);
}

/* componente */
export default function News() {
  // filtros
  const [escopo, setEscopo] = useState("br"); // br | world | local
  const [country, setCountry] = useState("BR");
  const [topic, setTopic] = useState("");
  const [query, setQuery] = useState("");

  // localização (escopo local)
  const [cidade, setCidade] = useState("");
  const pediuLocal = useRef(false);
  useEffect(() => {
    if (escopo !== "local" || pediuLocal.current) return;
    pediuLocal.current = true;
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const j = await r.json();
        const a = j.address || {};
        const nome = a.city || a.town || a.village || a.municipality || a.state || "";
        setCidade(nome);
        setQuery(nome);
      } catch {}
    }, ()=>{}, { timeout: 3000 });
  }, [escopo]);

  // dados
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ok | error
  const [erro, setErro] = useState("");

  const rssUrl = useMemo(() => {
    const q = (escopo === "local" && cidade) ? cidade : query;
    // País SEMPRE livre (não desabilita)
    return buildGoogleNewsRss({ country, topic, q, escopo });
  }, [country, topic, query, escopo, cidade]);

  async function carregar() {
    setStatus("loading"); setErro(""); setItems([]);
    try {
      let data = [];
      try {
        data = await fetchViaRss2Json(rssUrl);
      } catch {
        try {
          data = await fetchDirectXml(rssUrl);
        } catch {
          data = await fetchViaAllOrigins(rssUrl);
        }
      }
      // normaliza + remove duplicados
      const uniq = new Map();
      data.forEach((d) => { if (!uniq.has(d.link)) uniq.set(d.link, d); });
      setItems(Array.from(uniq.values()).slice(0, 40));
      setStatus("ok");
    } catch (e) {
      setErro("Não foi possível carregar as notícias agora.");
      setStatus("error");
    }
  }

  useEffect(() => { carregar(); }, [rssUrl]);

  return (
    <div className="container py-4">
      {/* topo */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0"> N e w s</h4>
        <div className="d-flex gap-2">
          <Link to="/agenda" className="btn btn-outline-secondary">Agenda</Link>
          <button className="btn btn-primary" onClick={carregar}>Atualizar</button>
        </div>
      </div>

      {/* filtros */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-2">
              <label className="form-label">Escopo</label>
              <select className="form-select" value={escopo} onChange={(e)=>setEscopo(e.target.value)}>
                <option value="world">Mundo 🌎</option>
                <option value="br">País </option>
                <option value="local">Local 📍</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">País</label>
              {/* país sempre habilitado */}
              <select className="form-select" value={country} onChange={(e)=>setCountry(e.target.value)}>
                {PAISES.map(p=> <option key={p.code} value={p.code}>{p.nome}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Assunto</label>
              <select className="form-select" value={topic} onChange={(e)=>setTopic(e.target.value)}>
                {CATEGORIAS.map(c=> <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">{escopo==="local" ? "Cidade/Bairro" : "Buscar"}</label>
              <input
                className="form-control"
                placeholder={escopo==="local" ? "Sua cidade ou bairro" : "Termo de busca"}
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={carregar}>OK</button>
            </div>
          </div>
          <div className="small text-muted mt-2">
            Fonte: Google News (RSS). {escopo==="local" && (cidade ? `Local detectado: ${cidade}` : "Se permitir localização, usamos sua cidade.")}
          </div>
        </div>
      </div>

      {/* status */}
      {status === "loading" && <div className="alert alert-info">Carregando notícias…</div>}
      {status === "error" && <div className="alert alert-danger">{erro}</div>}

      {/* resultados */}
      {status !== "loading" && (
        items.length === 0 ? (
          <div className="text-muted">Sem resultados.</div>
        ) : (
          <div className="row g-3">
            {items.map((n)=>(
              <div key={n.id} className="col-md-6">
                <div className="card h-100">
                  {n.image ? (
                    <img
                      src={n.image}
                      alt=""
                      className="card-img-top"
                      style={{ objectFit:"cover", height:160 }} /* miniatura */
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                  <div className="card-body d-flex flex-column">
                    <a href={n.link} target="_blank" rel="noreferrer" className="h6 text-decoration-none">{n.title}</a>
                    {n.snippet && (
                      <p className="text-muted small mt-2" style={{lineHeight:1.25}}>
                        {n.snippet.slice(0, 200)}{n.snippet.length>200 ? "…" : ""}
                      </p>
                    )}
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <span className="badge bg-light text-dark">{n.source || "Fonte"}</span>
                      <small className="text-muted">{fmtDateBR(n.pubDate)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
