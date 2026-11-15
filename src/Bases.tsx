import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, Library, Search, Settings2, X } from "lucide-react";
import { basesChapters, type BasesChapter, type BasesGlossaryEntry, type BasesQuestion } from "./bases-content";
import {
  loadBasesPreferences, loadBasesProgress, loadBasesQuizResults,
  saveBasesPreferences, saveBasesProgress, saveBasesQuizResults,
  type BasesPreferences, type BasesProgress, type BasesQuizResult,
} from "./bases-state";
import "./academy.css";
import "./bases.css";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const allGlossaryEntries: BasesGlossaryEntry[] = (() => {
  const byKey = new Map<string, BasesGlossaryEntry>();
  for (const chapter of basesChapters) {
    for (const item of chapter.terms) {
      byKey.set(chapter.id + ":" + item.term.toLocaleLowerCase(), {
        id: chapter.id + ":" + slugify(item.term), term: item.term, acronym: item.acronym,
        fullName: item.fullName, definition: item.definition, relatedTerms: item.related, chapterId: chapter.id,
      });
    }
    for (const item of chapter.concepts) byKey.set(chapter.id + ":" + item.term.toLocaleLowerCase(), { ...item, id: item.id });
  }
  return [...byKey.values()].sort((a, b) => a.term.localeCompare(b.term, "es", { sensitivity: "base" }));
})();

function pathSlug() {
  const route = window.location.pathname.replace(/^\/bases\/?/, "").split("/")[0];
  return basesChapters.some((chapter) => chapter.slug === route) ? route : "";
}

function chapterBySlug(slug: string) { return basesChapters.find((chapter) => chapter.slug === slug); }
function chapterHref(slug: string, anchor?: string) { return "/bases/" + slug + "/" + (anchor ? "#" + anchor : ""); }

function getEntry(term: string, chapterId?: string) {
  const normalized = term.toLocaleLowerCase();
  return allGlossaryEntries.find((entry) => entry.chapterId === chapterId && (
    entry.term.toLocaleLowerCase() === normalized || entry.acronym?.toLocaleLowerCase() === normalized
  )) ?? allGlossaryEntries.find((entry) => entry.term.toLocaleLowerCase() === normalized || entry.acronym?.toLocaleLowerCase() === normalized);
}

const glossaryTermsPattern = new RegExp(
  "(^|[^\\p{L}\\p{N}])(" + allGlossaryEntries.map((entry) => entry.term).filter((term) => term.length >= 3)
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^$()|[\]\\]/g, "\\$&")).join("|") + ")(?=$|[^\\p{L}\\p{N}])",
  "giu",
);

function LinkedText({ text, chapterId, onOpenTerm }: { text: string; chapterId: string; onOpenTerm: (id: string) => void }) {
  glossaryTermsPattern.lastIndex = 0;
  const output: ReactNode[] = [];
  let from = 0;
  let match: RegExpExecArray | null;
  while ((match = glossaryTermsPattern.exec(text))) {
    const start = match.index + match[1].length;
    if (start < from) continue;
    if (start > from) output.push(text.slice(from, start));
    const entry = getEntry(match[2], chapterId);
    output.push(entry ? <button className="bases-term-link" type="button" key={start} onClick={() => onOpenTerm(entry.id)}>{match[2]}</button> : match[2]);
    from = start + match[2].length;
    glossaryTermsPattern.lastIndex = from;
  }
  if (!output.length) return text;
  if (from < text.length) output.push(text.slice(from));
  return <>{output}</>;
}

const diagramData: Record<string, { title: string; description: string; rows: string[][] }> = {
  crypto: {
    title: "Cifrado simétrico y asimétrico",
    description: "El cifrado simétrico usa un secreto compartido. Para cifrar para Bob, Alice usa su clave pública y Bob recupera el contenido con su clave privada.",
    rows: [["Texto plano", "AES-GCM", "Texto cifrado + etiqueta"], ["Alice cifra con clave pública de Bob", "Texto cifrado", "Bob descifra con su clave privada"]],
  },
  signature: {
    title: "Firma digital y verificación",
    description: "La clave privada produce una firma y la clave pública correspondiente permite verificarla. El mensaje permanece visible salvo que también se cifre.",
    rows: [["Mensaje", "Hash y firma con clave privada", "Verificar con clave pública"]],
  },
  pki: {
    title: "Cadena de confianza X.509",
    description: "La raíz es un ancla instalada en el cliente. Cada emisor subordinado debe satisfacer restricciones como Basic Constraints CA:TRUE.",
    rows: [["Raíz confiable", "Intermedia CA:TRUE", "Certificado servidor CA:FALSE", "Cliente valida firma, nombre y uso"]],
  },
  kerberos: {
    title: "Flujo Kerberos simplificado",
    description: "El cliente obtiene TGT del servicio de autenticación y lo presenta al TGS para obtener un ticket específico para el servicio.",
    rows: [["Cliente solicita autenticación", "AS entrega TGT", "Cliente presenta TGT al TGS", "TGS entrega ticket de servicio", "Servicio valida ticket"]],
  },
  federation: {
    title: "SAML frente a OAuth y OIDC",
    description: "SAML entrega una aserción de federación; OAuth delega acceso mediante tokens; OIDC añade información de identidad sobre OAuth.",
    rows: [["Usuario y Service Provider", "IdP", "Aserción SAML", "Service Provider valida"], ["Cliente", "Authorization Server", "Access Token", "API autoriza scopes"], ["Cliente OIDC", "Authorization Server", "ID Token", "Cliente valida issuer y audience"]],
  },
  "zero-trust": {
    title: "Decisión de acceso Zero Trust",
    description: "El contexto se evalúa para una solicitud concreta y la decisión aplica un permiso limitado al recurso requerido.",
    rows: [["Usuario + dispositivo", "Política evalúa identidad y contexto", "Punto de aplicación", "Aplicación y datos"]],
  },
  siem: {
    title: "Flujo de eventos hacia un SIEM",
    description: "La hora de ocurrencia y la hora de ingesta se conservan para correlacionar eventos que llegan fuera de orden.",
    rows: [["Endpoint, red, nube", "Agente o syslog", "Parsear, normalizar y enriquecer", "Correlacionar y priorizar", "Analista o SOAR"]],
  },
  incident: {
    title: "Ciclo de respuesta a incidentes",
    description: "La respuesta puede iterar entre análisis y contención. Las lecciones aprendidas alimentan preparación y controles.",
    rows: [["Preparación", "Detección y análisis", "Contención"], ["Erradicación", "Recuperación", "Lecciones aprendidas"]],
  },
  cloud: {
    title: "Responsabilidad compartida cloud",
    description: "El reparto cambia por servicio; identidad, datos y configuración suelen requerir acciones del cliente también en SaaS.",
    rows: [["Proveedor: centros de datos", "Red física e infraestructura", "Virtualización o plataforma gestionada"], ["Cliente: IAM y datos", "Configuración del servicio", "Workloads según IaaS / PaaS / SaaS"]],
  },
};

function Diagram({ kind }: { kind: string }) {
  const data = diagramData[kind];
  if (!data) return null;
  const width = 900;
  const rowHeight = 86;
  const height = data.rows.length * rowHeight + 12;
  const markerId = "arrow-" + kind;
  return <figure className="bases-diagram">
    <figcaption><span>DIAGRAMA</span><strong>{data.title}</strong><p>{data.description}</p></figcaption>
    <svg viewBox={"0 0 " + width + " " + height} role="img" aria-label={data.title + ". " + data.description} preserveAspectRatio="xMidYMid meet">
      <defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="currentColor" /></marker></defs>
      {data.rows.map((row, rowIndex) => {
        const gap = width / row.length;
        const y = 8 + rowIndex * rowHeight;
        return <g key={rowIndex}>{row.map((label, index) => {
          const center = gap * (index + 0.5);
          const breakAt = label.length > 26 ? label.lastIndexOf(" ", 26) : -1;
          const lines = breakAt > 0 ? [label.slice(0, breakAt), label.slice(breakAt + 1)] : [label];
          return <g key={label}>
            {index < row.length - 1 && <line x1={center + 76} y1={y + 27} x2={center + gap - 79} y2={y + 27} stroke="currentColor" strokeWidth="1.5" markerEnd={"url(#" + markerId + ")"} />}
            <rect x={center - 76} y={y} width="152" height="56" rx="3" fill="var(--academy-panel)" stroke="currentColor" />
            <text x={center} y={y + (lines.length === 1 ? 33 : 23)} textAnchor="middle" fill="currentColor" fontSize="13" fontFamily="system-ui, sans-serif">
              {lines.map((line, lineIndex) => <tspan x={center} dy={lineIndex === 0 ? 0 : 16} key={lineIndex}>{line}</tspan>)}
            </text>
          </g>;
        })}</g>;
      })}
    </svg>
  </figure>;
}

function TermDialog({ entry, onClose, onSelectEntry, onOpenChapter }: {
  entry: BasesGlossaryEntry | null;
  onClose: () => void;
  onSelectEntry: (id: string) => void;
  onOpenChapter: (slug: string, anchor?: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  useEffect(() => {
    if (!entry) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeCallback.current(); }
      if (event.key !== "Tab") return;
      const root = document.querySelector<HTMLElement>(".bases-term-dialog");
      const focusable = root ? [...root.querySelectorAll<HTMLElement>("button, a, input, select, [tabindex]:not([tabindex='-1'])")].filter((item) => !item.hasAttribute("disabled")) : [];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, [entry]);
  if (!entry) return null;
  const chapter = basesChapters.find((item) => item.id === entry.chapterId);
  const full = chapter?.concepts.find((item) => item.id === entry.id);
  return <div className="bases-term-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="bases-term-dialog" role="dialog" aria-modal="true" aria-labelledby="bases-term-title">
      <div className="bases-term-heading"><div><span>GLOSARIO{chapter ? " · CAPÍTULO " + String(basesChapters.indexOf(chapter) + 1).padStart(2, "0") : ""}</span><h2 id="bases-term-title">{entry.term}</h2></div><button ref={closeRef} type="button" aria-label="Cerrar definición" onClick={onClose}><X size={19} /></button></div>
      {(entry.fullName || entry.acronym) && <p className="bases-term-full-name">{entry.acronym && <strong>{entry.acronym}</strong>} {entry.fullName}</p>}
      <p className="bases-term-definition">{entry.definition}</p>
      {full && <div className="bases-term-expanded">
        <section><h3>Explicación técnica</h3><p>{full.explanation}</p></section>
        <section><h3>Ejemplo</h3><p>{full.example}</p></section>
        <section><h3>Límite importante</h3><p>{full.limitation}</p></section>
      </div>}
      {entry.relatedTerms?.length ? <section className="bases-term-related"><h3>Relacionado</h3><div>{entry.relatedTerms.map((term) => {
        const related = getEntry(term, entry.chapterId);
        return related ? <button type="button" key={term} onClick={() => onSelectEntry(related.id)}>{term}</button> : <span key={term}>{term}</span>;
      })}</div></section> : null}
      <div className="bases-term-footer">{chapter && <button type="button" onClick={() => onOpenChapter(chapter.slug, full ? "concept-" + full.id : undefined)}>Abrir en «{chapter.title}» <ChevronRight size={15} /></button>}<span>La definición orienta; verifica el contexto y la configuración del sistema.</span></div>
    </section>
  </div>;
}

function GlossaryBrowser({ onOpenTerm, onOpenChapter }: {
  onOpenTerm: (id: string) => void; onOpenChapter: (slug: string, anchor?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [chapterId, setChapterId] = useState("all");
  const [selectedId, setSelectedId] = useState(allGlossaryEntries[0]?.id ?? "");
  const filtered = useMemo(() => allGlossaryEntries.filter((entry) => {
    const chapterMatch = chapterId === "all" || entry.chapterId === chapterId;
    const needle = query.trim().toLocaleLowerCase();
    return chapterMatch && (!needle || [entry.term, entry.acronym, entry.fullName, entry.definition, ...(entry.relatedTerms ?? [])].filter(Boolean).join(" ").toLocaleLowerCase().includes(needle));
  }), [chapterId, query]);
  const selected = filtered.find((entry) => entry.id === selectedId) ?? filtered[0];
  return <div className="bases-glossary-browser">
    <div className="bases-glossary-controls">
      <label className="bases-glossary-search"><span className="sr-only">Buscar términos</span><Search size={17} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar término, sigla o definición" /></label>
      <label className="bases-glossary-filter"><span className="sr-only">Filtrar por capítulo</span><select value={chapterId} onChange={(event) => setChapterId(event.target.value)}><option value="all">Todos los capítulos</option>{basesChapters.filter((item) => item.id !== "glosario").map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
    </div>
    <p className="bases-glossary-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "término" : "términos"}</p>
    <div className="bases-glossary-layout">
      <div className="bases-glossary-results" role="region" aria-label="Resultados del glosario">
        {filtered.map((entry) => <button type="button" aria-pressed={selected?.id === entry.id} className={selected?.id === entry.id ? "bases-glossary-result is-selected" : "bases-glossary-result"} key={entry.id} data-glossary-id={entry.id} onClick={() => setSelectedId(entry.id)}>
          <strong>{entry.term}{entry.acronym && entry.term !== entry.acronym ? <small> · {entry.acronym}</small> : null}</strong><span>{entry.definition}</span>
        </button>)}
        {!filtered.length && <p className="bases-glossary-empty">No se encontraron términos. Prueba otra búsqueda.</p>}
      </div>
      {selected && <article className="bases-glossary-detail">
        <div className="bases-glossary-detail-heading"><div><span>{basesChapters.find((item) => item.id === selected.chapterId)?.title ?? "FUNDAMENTOS"}</span><h3>{selected.term}</h3></div><button type="button" aria-label={"Abrir ficha de " + selected.term} onClick={() => onOpenTerm(selected.id)}><BookOpen size={17} /> Ficha</button></div>
        {selected.fullName && <p className="bases-glossary-full-name">{selected.acronym} · {selected.fullName}</p>}
        <p className="bases-glossary-definition">{selected.definition}</p>
        {selected.explanation && <section><h4>Explicación ampliada</h4><p>{selected.explanation}</p></section>}
        {selected.example && <section><h4>Ejemplo técnico</h4><p>{selected.example}</p></section>}
        {selected.relatedTerms?.length ? <section className="bases-glossary-related"><h4>Términos relacionados</h4><div>{selected.relatedTerms.map((term) => {
          const related = getEntry(term, selected.chapterId);
          return related ? <button key={term} type="button" onClick={() => { setChapterId("all"); setQuery(""); setSelectedId(related.id); }}>{term}</button> : <span key={term}>{term}</span>;
        })}</div></section> : null}
        <button className="bases-glossary-open-chapter" type="button" onClick={() => {
          const source = basesChapters.find((item) => item.id === selected.chapterId);
          const full = source?.concepts.find((item) => item.id === selected.id);
          if (source) onOpenChapter(source.slug, full ? "concept-" + full.id : undefined);
        }}>Ir al capítulo <ChevronRight size={16} /></button>
      </article>}
    </div>
    <div className="bases-glossary-context-note">En las lecturas, cada término subrayado abre su ficha sin interrumpir el capítulo.</div>
  </div>;
}

function Assessment({ chapter, onSaveResult }: { chapter: BasesChapter; onSaveResult: (result: BasesQuizResult) => void }) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const complete = chapter.questions.every((item) => (answers[item.id] ?? []).length > 0);
  const correctCount = chapter.questions.filter((item) => sameSet(answers[item.id] ?? [], item.correct)).length;
  function select(item: BasesQuestion, optionId: string, multiple: boolean) {
    if (submitted) return;
    setAnswers((previous) => {
      const current = previous[item.id] ?? [];
      const selected = current.includes(optionId) ? current.filter((id) => id !== optionId) : multiple ? [...current, optionId] : [optionId];
      return { ...previous, [item.id]: selected };
    });
  }
  function finish() {
    setAttempted(true);
    if (!complete || submitted) return;
    const score = Math.round(correctCount / chapter.questions.length * 100);
    setSubmitted(true);
    onSaveResult({ chapterSlug: chapter.slug, date: new Date().toISOString(), correct: correctCount, total: chapter.questions.length, percent: score });
  }
  function retry() { setAnswers({}); setSubmitted(false); setAttempted(false); }
  return <section id="evaluacion" className="academy-section bases-assessment" aria-labelledby="assessment-title">
    <div className="academy-section-label"><span>09</span><h2 id="assessment-title">Comprueba lo aprendido</h2></div>
    <p className="bases-assessment-intro">Preguntas originales para reconocer mecanismos, protocolos y configuraciones. Las respuestas y explicaciones aparecen después de enviar.</p>
    <div className="bases-assessment-body">{chapter.questions.map((item, index) => {
      const selected = answers[item.id] ?? [];
      const correct = sameSet(selected, item.correct);
      const isMultiple = item.type === "multiple";
      return <fieldset className={"bases-question" + (submitted ? correct ? " is-correct" : " is-incorrect" : "")} key={item.id} aria-describedby={submitted ? item.id + "-feedback" : undefined}>
        <legend><span>{String(index + 1).padStart(2, "0")} · {questionTypeName(item.type)}</span>{item.prompt}</legend>
        <div className="bases-question-options">{item.options.map((option) => <label className="bases-question-option" key={option.id}>
          <input type={isMultiple ? "checkbox" : "radio"} name={item.id} checked={selected.includes(option.id)} onChange={() => select(item, option.id, isMultiple)} disabled={submitted} /><span>{option.text}</span>
        </label>)}</div>
        {submitted && <div id={item.id + "-feedback"} className="bases-question-feedback" role="status">
          <strong>{correct ? "Correcta" : "Revisa este mecanismo"}</strong><p>{item.explanation}</p>
          {!correct && selected.map((id) => item.feedback[id] && <p key={id}>{item.feedback[id]}</p>)}
          {!correct && <p><b>Respuesta esperada:</b> {item.options.filter((option) => item.correct.includes(option.id)).map((option) => option.text).join("; ")}</p>}
          <a href={"#concept-" + chapter.concepts[0]?.id} onClick={() => document.getElementById("concept-" + chapter.concepts[0]?.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>Volver a consultar las definiciones</a>
        </div>}
      </fieldset>;
    })}
      {attempted && !complete && <p className="bases-assessment-error" role="alert">Responde cada pregunta antes de enviar la evaluación.</p>}
      {submitted && <div className="bases-assessment-result" role="status"><span>RESULTADO</span><strong>{correctCount} de {chapter.questions.length} · {Math.round(correctCount / chapter.questions.length * 100)} %</strong><p>El intento se guarda localmente en este dispositivo.</p><button type="button" onClick={retry}>Intentar de nuevo</button></div>}
      {!submitted && <button className="bases-submit-quiz" type="button" onClick={finish}><Check size={16} /> Enviar respuestas</button>}
    </div>
  </section>;
}

function sameSet(left: string[], right: string[]) { return left.length === right.length && left.every((value) => right.includes(value)); }
function questionTypeName(type: BasesQuestion["type"]) {
  return ({ single: "Selección única", multiple: "Selección múltiple", "true-false": "Verdadero o falso", identify: "Identificación", compare: "Comparación", configuration: "Interpretación técnica", scenario: "Escenario aplicado" })[type];
}

export function Bases() {
  const [preferences, setPreferences] = useState<BasesPreferences>(() => loadBasesPreferences());
  const [progress, setProgress] = useState<BasesProgress>(() => loadBasesProgress());
  const [quizResults, setQuizResults] = useState<BasesQuizResult[]>(() => loadBasesQuizResults());
  const [slug, setSlug] = useState(pathSlug);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [termId, setTermId] = useState<string | null>(null);
  const chapter = chapterBySlug(slug);
  const activeTerm = termId ? allGlossaryEntries.find((entry) => entry.id === termId) ?? null : null;
  const style = {
    "--reader-font-size": preferences.fontSize + "px", "--reader-line-height": preferences.lineHeight,
    "--reader-content-width": "760px", "--reader-paragraph-spacing": preferences.paragraphSpacing + "px",
    "--reader-letter-spacing": preferences.font === "serif" ? "-.005em" : preferences.font === "mono" ? ".01em" : "0",
  } as CSSProperties;
  const completedCount = Object.values(progress.chapters).filter((item) => item.status === "completed").length;
  const overallPercent = Math.round(completedCount / 12 * 100);
  const activeProgress = chapter ? progress.chapters[chapter.slug] : undefined;

  useEffect(() => { saveBasesPreferences(preferences); }, [preferences]);
  useEffect(() => { saveBasesProgress(progress); }, [progress]);
  useEffect(() => { saveBasesQuizResults(quizResults); }, [quizResults]);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.createElement("meta");
    const theme = document.createElement("meta");
    const manifest = document.createElement("link");
    document.title = "Blacknova · Bases de Ciberseguridad";
    description.name = "description";
    description.content = "Biblioteca de fundamentos de ciberseguridad, Blue Team y preparación para Security+.";
    theme.name = "theme-color"; theme.content = "#f7f5ef";
    manifest.rel = "manifest"; manifest.href = "/bases/manifest.webmanifest";
    document.head.append(description, theme, manifest);
    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/bases/service-worker.js", { scope: "/bases/", updateViaCache: "none" })
      .then((value) => { registration = value; void value.update(); }).catch(() => undefined);
    return () => { document.title = previousTitle; description.remove(); theme.remove(); manifest.remove(); void registration; };
  }, []);

  useEffect(() => {
    const onPopState = () => { setSlug(pathSlug()); setTermId(null); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!chapter) return;
    setProgress((previous) => ({
      ...previous, lastSlug: chapter.slug,
      chapters: { ...previous.chapters, [chapter.slug]: {
        status: previous.chapters[chapter.slug]?.status === "completed" ? "completed" : "in-progress",
        percent: previous.chapters[chapter.slug]?.percent ?? 0, scrollY: previous.chapters[chapter.slug]?.scrollY ?? 0,
      } },
    }));
    if (window.location.hash) {
      const target = decodeURIComponent(window.location.hash.slice(1));
      window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 40);
    } else window.setTimeout(() => window.scrollTo(0, progress.chapters[chapter.slug]?.scrollY ?? 0), 0);
  }, [slug]);

  useEffect(() => {
    if (!chapter) return;
    let timer = 0;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const percent = Math.max(0, Math.min(100, Math.round(window.scrollY / maximum * 100)));
        setProgress((previous) => {
          const old = previous.chapters[chapter.slug];
          if (old && Math.abs(old.percent - percent) < 2 && Math.abs(old.scrollY - window.scrollY) < 180) return previous;
          return { ...previous, lastSlug: chapter.slug, chapters: { ...previous.chapters, [chapter.slug]: {
            status: old?.status === "completed" ? "completed" : "in-progress", percent, scrollY: window.scrollY,
          } } };
        });
      }, 350);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(timer); };
  }, [slug]);

  function navigate(slugValue: string, anchor?: string, resume = false) {
    window.history.pushState(null, "", slugValue ? chapterHref(slugValue, anchor) : "/bases/");
    setSlug(slugValue); setTermId(null); setSettingsOpen(false);
    if (slugValue) {
      const selected = chapterBySlug(slugValue);
      if (selected) setProgress((previous) => ({ ...previous, lastSlug: selected.slug, chapters: { ...previous.chapters, [selected.slug]: {
        status: previous.chapters[selected.slug]?.status === "completed" ? "completed" : "in-progress",
        percent: previous.chapters[selected.slug]?.percent ?? 0, scrollY: resume ? previous.chapters[selected.slug]?.scrollY ?? 0 : 0,
      } } }));
    }
    window.setTimeout(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo(0, resume && slugValue ? progress.chapters[slugValue]?.scrollY ?? 0 : 0);
    }, 0);
  }

  function completeChapter() {
    if (!chapter) return;
    setProgress((previous) => ({ ...previous, chapters: { ...previous.chapters, [chapter.slug]: { status: "completed", percent: 100, scrollY: previous.chapters[chapter.slug]?.scrollY ?? window.scrollY } } }));
  }
  const nextChapter = chapter ? basesChapters[basesChapters.indexOf(chapter) + 1] : undefined;
  const previousChapter = chapter ? basesChapters[basesChapters.indexOf(chapter) - 1] : undefined;

  return <div className="academy-shell bases-shell" data-theme={preferences.theme} data-reader-font={preferences.font} style={style}>
    <a className="academy-skip" href="#bases-content">Saltar al contenido</a>
    <header className="academy-header bases-header">
      <a className="academy-brand" href="/bases/" aria-label="Blacknova Bases, abrir índice" onClick={(event) => { event.preventDefault(); navigate(""); }}>
        <span className="academy-mark bases-mark" aria-hidden="true">B</span><span><strong>BLACKNOVA · BASES</strong><small>FUNDAMENTOS DE CIBERSEGURIDAD</small></span>
      </a>
      <div className="bases-header-actions"><a href="/capas/" className="bases-atlas-link">Atlas OSI <ChevronRight size={15} /></a>{chapter && <button className="header-library-button" type="button" onClick={() => navigate("")}><Library size={16} /> Índice</button>}</div>
    </header>

    {!chapter ? <main className="academy-main academy-library bases-library" id="bases-content">
      <section className="academy-intro bases-intro" aria-labelledby="bases-title">
        <div className="academy-kicker">BIBLIOTECA TÉCNICA <span>·</span> 12 CAPÍTULOS</div>
        <h1 id="bases-title">Comprende los conceptos.<br />Domina la tecnología.<br />Aprende a defender.</h1>
        <p>Un libro digital de fundamentos de ciberseguridad, Blue Team y preparación técnica para Security+. Aprende primero qué hace cada mecanismo y después cómo reconocerlo en infraestructura real.</p>
        {progress.lastSlug && chapterBySlug(progress.lastSlug) ? <div className="continue-reading"><div><span>CONTINUAR DONDE LO DEJASTE</span><strong>{chapterBySlug(progress.lastSlug)?.title}</strong><small>{progress.chapters[progress.lastSlug]?.percent ?? 0} % leído</small></div><button type="button" onClick={() => navigate(progress.lastSlug, undefined, true)}>Continuar <ChevronRight size={16} /></button></div>
          : <p className="academy-study-note">La lectura, preferencias y evaluaciones se guardan solo en este dispositivo.</p>}
        <button className="knowledge-library-entry" type="button" onClick={() => navigate("glosario")}><BookOpen size={17} /> Abrir glosario técnico</button>
      </section>
      <section className="bases-overview" aria-label="Avance general"><div><span>PROGRESO LOCAL</span><strong>{completedCount} de 12 capítulos completados</strong></div><progress max={100} value={overallPercent} aria-label={"Progreso general " + overallPercent + "%"} /><small>{overallPercent} % · Sin cuenta ni sincronización.</small></section>
      <section className="library-chapters" aria-labelledby="bases-chapters-title">
        <div className="library-section-heading"><div><span>CONTENIDO</span><h2 id="bases-chapters-title">Doce capítulos</h2></div><span>LECTURA · GLOSARIO · EVALUACIÓN</span></div>
        <ol className="chapter-list">{basesChapters.map((item, index) => {
          const state = progress.chapters[item.slug];
          const result = [...quizResults].reverse().find((entry) => entry.chapterSlug === item.slug);
          const read = state?.percent ?? 0;
          const status = state?.status === "completed" ? "Capítulo completado" : state ? "En progreso" : "No iniciado";
          return <li key={item.slug}><a href={chapterHref(item.slug)} className="chapter-row" aria-label={"Abrir capítulo " + (index + 1) + ": " + item.title} onClick={(event) => { event.preventDefault(); navigate(item.slug); }}>
            <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="chapter-copy"><strong>{item.title}</strong><span>{item.summary}</span><small>{read} % leído · {status} · {result ? "Última evaluación " + result.percent + " %" : "Evaluación sin iniciar"}</small><span className="chapter-progress-track" aria-hidden="true"><span style={{ width: state?.status === "completed" ? "100%" : read + "%" }} /></span></span><ChevronRight className="chapter-chevron" size={20} />
          </a></li>;
        })}</ol>
      </section>
      <section className="bases-disclaimer"><span>NOTA EDITORIAL</span><p>Material educativo independiente. No afiliado ni avalado por CompTIA.</p></section>
      <footer className="academy-footer"><span>BLACKNOVA · BASES</span><span>APRENDIZAJE LOCAL · SIN CUENTA</span></footer>
    </main> : <main className="academy-main reader-layout bases-reader-layout" id="bases-content">
      <aside className="reader-toc bases-toc" aria-label="Índice del capítulo">
        <p>EN ESTE CAPÍTULO</p><nav>{[...chapter.sections.map((section) => ({ id: section.id, title: section.title })), ...chapter.concepts.map((item) => ({ id: "concept-" + item.id, title: item.term })), ...(chapter.id === "glosario" ? [{ id: "glossary-browser", title: "Buscar términos" }] : []), { id: "evaluacion", title: "Comprobación" }].map((item) => <a key={item.id} href={"#" + item.id}>{item.title}</a>)}</nav>
        <div className="bases-toc-progress"><span>{activeProgress?.percent ?? 0} % leído</span><progress max={100} value={activeProgress?.percent ?? 0} /></div>
      </aside>
      <div className="reader-main-column bases-reader-main-column">
        <div className="reader-toolbar bases-reader-toolbar" aria-label="Herramientas de lectura"><div className="reader-toolbar-inner">
          <button type="button" onClick={() => navigate("")} aria-label="Abrir índice de Bases"><Library size={17} /><span>Índice</span></button>
          <button type="button" onClick={() => navigate("glosario")} aria-label="Abrir glosario"><BookOpen size={17} /><span>Glosario</span></button>
          <button type="button" aria-expanded={settingsOpen} aria-controls="bases-reader-settings" onClick={() => setSettingsOpen((value) => !value)}><Settings2 size={17} /><span>Lectura</span></button>
          <div className="reader-progress"><span>Cap. {String(basesChapters.indexOf(chapter) + 1).padStart(2, "0")} / 12</span><progress max={100} value={activeProgress?.percent ?? 0} aria-label={"Progreso " + (activeProgress?.percent ?? 0) + "%"} /></div>
        </div></div>
        {settingsOpen && <section className="reader-settings bases-reader-settings" id="bases-reader-settings" aria-label="Preferencias de lectura">
          <label>Tipografía<select value={preferences.font} onChange={(event) => setPreferences((previous) => ({ ...previous, font: event.target.value as BasesPreferences["font"] }))}><option value="serif">Serif editorial</option><option value="sans">Sans serif</option><option value="mono">Monoespaciada</option></select></label>
          <label>Tamaño de texto <span>{preferences.fontSize} px</span><input type="range" min="16" max="28" value={preferences.fontSize} onChange={(event) => setPreferences((previous) => ({ ...previous, fontSize: Number(event.target.value) }))} /></label>
          <label>Interlineado <span>{preferences.lineHeight.toFixed(2)}</span><input type="range" min="1.55" max="1.95" step="0.05" value={preferences.lineHeight} onChange={(event) => setPreferences((previous) => ({ ...previous, lineHeight: Number(event.target.value) }))} /></label>
          <label>Tema<select value={preferences.theme} onChange={(event) => setPreferences((previous) => ({ ...previous, theme: event.target.value as BasesPreferences["theme"] }))}><option value="paper">Papel claro</option><option value="sepia">Sepia</option><option value="dark">Oscuro</option><option value="mono">Blanco y negro</option></select></label>
          <label>Espacio entre párrafos <span>{preferences.paragraphSpacing} px</span><input type="range" min="8" max="22" value={preferences.paragraphSpacing} onChange={(event) => setPreferences((previous) => ({ ...previous, paragraphSpacing: Number(event.target.value) }))} /></label>
        </section>}
        <details className="bases-chapter-picker"><summary>Capítulos <span>{String(basesChapters.indexOf(chapter) + 1).padStart(2, "0")} / 12 · {chapter.title}</span></summary><nav aria-label="Navegar capítulos">{basesChapters.map((item, index) => <a key={item.slug} href={chapterHref(item.slug)} aria-current={item.slug === chapter.slug ? "page" : undefined} onClick={(event) => { event.preventDefault(); navigate(item.slug); }}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}</a>)}</nav></details>
        <article className="academy-lesson bases-lesson" aria-labelledby="bases-chapter-title">
          <header className="academy-lesson-heading"><div className="academy-lesson-overline"><span>CAPÍTULO {String(basesChapters.indexOf(chapter) + 1).padStart(2, "0")}</span><span className="academy-overline-rule" /><span>BASES DE CIBERSEGURIDAD</span></div><h1 id="bases-chapter-title">{chapter.title}</h1><p className="chapter-deck">{chapter.summary}</p><p className="academy-objective"><span>OBJETIVO</span>{chapter.objective}</p></header>
          {chapter.sections.map((section, index) => <section className="academy-section bases-prose-section" id={section.id} aria-labelledby={section.id + "-title"} key={section.id}>
            <div className="academy-section-label"><span>{String(index + 1).padStart(2, "0")}</span><h2 id={section.id + "-title"}>{section.title}</h2></div>
            <div className="academy-prose">{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}><LinkedText text={paragraph} chapterId={chapter.id} onOpenTerm={setTermId} /></p>)}</div>
          </section>)}
          {chapter.diagrams?.map((kind) => <section className="academy-section bases-diagram-section" key={kind}><Diagram kind={kind} /></section>)}
          {chapter.concepts.length > 0 && <section className="academy-section bases-concepts-section" aria-labelledby="bases-concepts-title">
            <div className="academy-section-label"><span>05</span><h2 id="bases-concepts-title">Conceptos para memorizar</h2></div>
            <div className="bases-concept-list">{chapter.concepts.map((item, index) => <article className="bases-concept-card" id={"concept-" + item.id} key={item.id} aria-labelledby={"concept-title-" + item.id}>
              <div className="bases-concept-heading"><span>CONCEPTO {String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => setTermId(item.id)} aria-label={"Abrir glosario: " + item.term}>{item.term}<BookOpen size={15} /></button></div>
              {(item.acronym || item.fullName) && <p className="bases-concept-full-name"><strong>{item.acronym}</strong>{item.fullName && " · " + item.fullName}</p>}
              <h3 id={"concept-title-" + item.id}>Definición para memorizar</h3><p className="bases-memorize-definition"><LinkedText text={item.definition} chapterId={chapter.id} onOpenTerm={setTermId} /></p>
              <div className="bases-concept-details">
                <section><h4>Explicación técnica</h4><p><LinkedText text={item.explanation} chapterId={chapter.id} onOpenTerm={setTermId} /></p></section>
                <section><h4>Ejemplo práctico</h4><p><LinkedText text={item.example} chapterId={chapter.id} onOpenTerm={setTermId} /></p></section>
                <section><h4>Conceptos que se confunden</h4><p><LinkedText text={item.confusion} chapterId={chapter.id} onOpenTerm={setTermId} /></p></section>
                <section><h4>Limitaciones</h4><p><LinkedText text={item.limitation} chapterId={chapter.id} onOpenTerm={setTermId} /></p></section>
                <section><h4>Relevancia para Security+</h4><p>{item.exam}</p></section>
              </div>
              <details className="bases-knowledge-check"><summary>Comprobar conocimiento</summary><p><strong>{item.check.question}</strong></p><p>{item.check.answer}</p></details>
            </article>)}</div>
          </section>}
          {chapter.id === "glosario" && <section className="academy-section bases-glossary-section" id="glossary-browser" aria-labelledby="glossary-title"><div className="academy-section-label"><span>03</span><h2 id="glossary-title">Diccionario de ciberseguridad</h2></div><GlossaryBrowser onOpenTerm={setTermId} onOpenChapter={(value, anchor) => navigate(value, anchor)} /></section>}
          {chapter.id === "glosario" && <div className="bases-term-context-note">Las fichas extendidas se desarrollan dentro de su capítulo de origen. Busca una sigla, compara términos relacionados y abre el concepto para estudiar el mecanismo.</div>}
          {chapter.id !== "glosario" && <div className="bases-completion-box"><div><span>LECTURA</span><strong>{activeProgress?.status === "completed" ? "Capítulo completado" : "Marca este capítulo al terminar"}</strong><small>{activeProgress?.percent ?? 0} % de lectura registrada</small></div><button type="button" onClick={completeChapter} disabled={activeProgress?.status === "completed"}>{activeProgress?.status === "completed" ? <><Check size={16} /> Completado</> : "Marcar como completado"}</button></div>}
          <Assessment chapter={chapter} onSaveResult={(result) => setQuizResults((previous) => [...previous, result].slice(-100))} />
          <nav className="academy-next-prev bases-next-prev" aria-label="Navegación entre capítulos">
            {previousChapter ? <button type="button" onClick={() => navigate(previousChapter.slug)}><ChevronLeft size={16} /><span><small>ANTERIOR</small>{previousChapter.title}</span></button> : <span />}
            {nextChapter ? <button type="button" onClick={() => navigate(nextChapter.slug)}><span><small>SIGUIENTE</small>{nextChapter.title}</span><ChevronRight size={16} /></button> : <button type="button" onClick={() => navigate("")}><span><small>VOLVER AL ÍNDICE</small>Doce capítulos</span><Library size={16} /></button>}
          </nav>
        </article>
        <footer className="academy-footer bases-footer"><span>BLACKNOVA · BASES</span><span>Material educativo independiente. No afiliado ni avalado por CompTIA.</span></footer>
      </div>
    </main>}
    {showTop && chapter && <button className="academy-back-top bases-back-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Volver arriba"><ArrowUp size={18} /></button>}
    <TermDialog entry={activeTerm} onClose={() => setTermId(null)} onSelectEntry={setTermId} onOpenChapter={(value, anchor) => navigate(value, anchor)} />
  </div>;
}
