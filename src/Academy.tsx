import { Suspense, lazy, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowUp, Bookmark, BookOpen, ChevronLeft, ChevronRight, Library, Settings2 } from "lucide-react";
import { academyLessons, type AcademyLayer } from "./academy";
import { chapterRecaps, chapterReferences } from "./academy-references";
import { lessons as investigationLessons } from "./education";
import { bestLayerScore, clearStudyProgress, loadStudyState, recordAttempt, saveStudyState, type ReaderPreferences, type StudyState } from "./academy-state";
import type { AssessmentKind } from "./assessment-bank";
import type { AnswerMap, AssessmentResult, PreparedQuestion } from "./assessment-engine";
import { KnowledgeCenterDialog } from "./KnowledgeCenterDialog";
import { GlossaryText } from "./GlossaryText";
import { sectionId, termAnnotationsBySection } from "./knowledge";
import "./academy.css";

const AssessmentDialog = lazy(() => import("./AssessmentDialog").then((module) => ({ default: module.AssessmentDialog })));

const summaries = [
  "Medios, señales, interfaces y diagnóstico físico de conectividad.",
  "Tramas, direcciones MAC, switching, VLAN, ARP y vecinos locales.",
  "Direccionamiento IP, rutas, ICMP, IPv4, IPv6 y segmentación.",
  "TCP, UDP, puertos, sockets, estados, pérdida y multiplexación.",
  "Diálogos, identidad de aplicación, RPC, tokens y ciclo de sesión.",
  "Representación, formatos, codificación y seguridad TLS.",
  "DNS, HTTP, servicios, solicitudes, telemetría y seguridad de aplicaciones.",
];
const sectionLinks = [
  ["fundamentos", "Fundamentos"], ["flujo", "Funcionamiento"], ["encapsulacion", "PDU y encapsulación"],
  ["protocolos", "Protocolos"], ["tecnologias", "Tecnologías"], ["comunicacion", "Ejemplo"],
  ["blue-team", "Blue Team"], ["red-team", "Red Team"], ["comandos", "Comandos Linux"],
  ["errores", "Errores comunes"], ["ejercicios", "Ejercicios"], ["resumen", "Resumen técnico"], ["referencias", "Referencias"], ["evaluacion", "Evaluación"],
];

function layerFromHash(): AcademyLayer {
  const match = window.location.hash.match(/^#capa-([1-7])$/);
  return (match ? Number(match[1]) : 1) as AcademyLayer;
}

function hasLayerHash(): boolean { return /^#capa-[1-7]$/.test(window.location.hash); }

function wordsIn(value: unknown): number {
  if (typeof value === "string") return value.trim().split(/\s+/u).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((total, item) => total + wordsIn(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((total, item) => total + wordsIn(item), 0);
  return 0;
}

export function estimatedMinutes(layer: AcademyLayer): number {
  const lesson = academyLessons[layer - 1];
  return Math.max(1, Math.ceil(wordsIn({ lesson, scenario: investigationLessons[layer - 1].scenario, recap: chapterRecaps[layer], references: chapterReferences[layer] }) / 210));
}

function clampPreference<K extends keyof ReaderPreferences>(key: K, value: number, previous: ReaderPreferences): ReaderPreferences {
  const ranges = { fontSize: [15, 21], lineHeight: [1.55, 1.95], columnWidth: [600, 780], paragraphSpacing: [8, 22] } as const;
  if (!(key in ranges)) return previous;
  const [minimum, maximum] = ranges[key as keyof typeof ranges];
  return { ...previous, [key]: Math.max(minimum, Math.min(maximum, value)) };
}

type FinishDetails = { result: AssessmentResult; questions: PreparedQuestion[]; answers: AnswerMap; seenIds: string[] };

export function Academy() {
  const [study, setStudy] = useState<StudyState>(() => loadStudyState());
  const [selected, setSelected] = useState<AcademyLayer>(layerFromHash);
  const [view, setView] = useState<"library" | "reader">(() => hasLayerHash() ? "reader" : "library");
  const [showTop, setShowTop] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sectionIndexOpen, setSectionIndexOpen] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentKind | null>(null);
  const [knowledgeTermId, setKnowledgeTermId] = useState<string | null>(null);
  const [completedRun, setCompletedRun] = useState<{ result: AssessmentResult; questions: PreparedQuestion[]; answers: AnswerMap } | null>(null);
  const readerRef = useRef<HTMLElement>(null);
  const suppressedScrollTarget = useRef<{ target: number; lastY: number } | null>(null);
  const studyRef = useRef(study);
  const lesson = academyLessons[selected - 1];
  const investigation = investigationLessons[selected - 1].scenario;
  const style = {
    "--reader-font-size": `${study.preferences.fontSize}px`,
    "--reader-line-height": study.preferences.lineHeight,
    "--reader-column-width": `${study.preferences.columnWidth}px`,
    "--reader-paragraph-spacing": `${study.preferences.paragraphSpacing}px`,
  } as CSSProperties;
  const annotate = (text: string, section: string) => <GlossaryText termIds={termAnnotationsBySection[sectionId(selected, section)] ?? []} onOpenTerm={setKnowledgeTermId}>{text}</GlossaryText>;

  useEffect(() => { studyRef.current = study; saveStudyState(study); }, [study]);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.createElement("meta");
    const manifest = document.createElement("link");
    document.title = "Atlas OSI · Academia de redes";
    description.name = "description";
    description.content = "Libro digital de redes y ciberseguridad con lectura offline y evaluaciones por capas OSI.";
    manifest.rel = "manifest";
    manifest.href = "/manifest.webmanifest";
    document.head.append(description, manifest);

    let registration: ServiceWorkerRegistration | undefined;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js", { scope: "/capas", updateViaCache: "none" })
        .then((value) => { registration = value; void value.update(); })
        .catch(() => undefined);
    }
    if (hasLayerHash()) {
      const target = studyRef.current.scrollPositions[selected] ?? 0;
      requestAnimationFrame(() => window.scrollTo(0, target));
    }
    return () => {
      document.title = previousTitle;
      description.remove();
      manifest.remove();
      void registration;
    };
  }, []);

  useEffect(() => {
    let scrollSaveTimer = 0;
    const onScroll = () => {
      const scrollY = window.scrollY;
      setShowTop(scrollY > 420);
      if (view !== "reader") return;
      const suppressed = suppressedScrollTarget.current;
      if (suppressed) {
        const remaining = Math.abs(scrollY - suppressed.target);
        const wasRemaining = Math.abs(suppressed.lastY - suppressed.target);
        suppressed.lastY = scrollY;
        if (remaining < 2) suppressedScrollTarget.current = null;
        if (remaining <= wasRemaining) return;
        suppressedScrollTarget.current = null;
      }
      const article = readerRef.current;
      if (!article) return;
      const bounds = article.getBoundingClientRect();
      const total = Math.max(1, article.scrollHeight - window.innerHeight);
      const read = Math.max(0, Math.min(100, Math.round((-bounds.top) / total * 100)));
      window.clearTimeout(scrollSaveTimer);
      scrollSaveTimer = window.setTimeout(() => {
        setStudy((previous) => {
          const previousPosition = previous.scrollPositions[selected] ?? 0;
          const previousProgress = previous.readProgress[selected] ?? 0;
          if (Math.abs(previousPosition - scrollY) < 220 && Math.abs(previousProgress - read) < 2) return previous;
          const completedLayers = read >= 90 ? [...new Set([...previous.completedLayers, selected])].sort() as AcademyLayer[] : previous.completedLayers;
          return { ...previous, lastLayer: selected, scrollPositions: { ...previous.scrollPositions, [selected]: scrollY }, readProgress: { ...previous.readProgress, [selected]: read }, completedLayers };
        });
      }, 450);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.clearTimeout(scrollSaveTimer); };
  }, [selected, view]);

  useEffect(() => {
    const handleHash = () => {
      const sectionMatch = window.location.hash.match(/^#l([1-7])-[a-z-]+$/);
      if (hasLayerHash()) { setSelected(layerFromHash()); setView("reader"); }
      else if (sectionMatch) { setSelected(Number(sectionMatch[1]) as AcademyLayer); setView("reader"); }
      else setView("library");
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const attemptByLayer = useMemo(() => {
    const latest: Partial<Record<AcademyLayer, StudyState["attempts"][number]>> = {};
    for (const attempt of study.attempts) if (attempt.kind === "chapter" && attempt.layer !== "integrated") latest[attempt.layer] = attempt;
    return latest;
  }, [study.attempts]);

  const scrollTo = (top: number) => window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  const openLayer = (number: AcademyLayer, resume = false) => {
    setSelected(number);
    setView("reader");
    setSettingsOpen(false);
    setSectionIndexOpen(false);
    setStudy((previous) => ({ ...previous, lastLayer: number }));
    window.history.replaceState(null, "", `/capas#capa-${number}`);
    const target = resume ? study.scrollPositions[number] ?? 0 : 0;
    suppressedScrollTarget.current = { target, lastY: window.scrollY };
    scrollTo(target);
  };

  const goToLibrary = () => {
    suppressedScrollTarget.current = { target: 0, lastY: window.scrollY };
    setView("library");
    window.history.replaceState(null, "", "/capas");
    scrollTo(0);
  };

  const changePreference = (key: keyof ReaderPreferences, value: ReaderPreferences[keyof ReaderPreferences]) => {
    setStudy((previous) => ({ ...previous, preferences: key === "theme" || key === "font"
      ? { ...previous.preferences, [key]: value }
      : clampPreference(key, Number(value), previous.preferences) }));
  };

  const toggleBookmark = () => {
    const existing = study.bookmarks[selected];
    if (typeof existing === "number") {
      setStudy((previous) => { const bookmarks = { ...previous.bookmarks }; delete bookmarks[selected]; return { ...previous, bookmarks }; });
    } else setStudy((previous) => ({ ...previous, bookmarks: { ...previous.bookmarks, [selected]: window.scrollY } }));
  };

  const onAssessmentFinish = ({ result, questions, answers, seenIds }: FinishDetails) => {
    const kind = assessment ?? "chapter";
    const layer = kind === "integrated" ? "integrated" : selected;
    setCompletedRun({ result, questions, answers });
    setStudy((previous) => {
      const next = recordAttempt(previous, kind, layer, result, questions.map((question) => question.id), answers);
      if (kind === "chapter") next.usedQuestionIds = { ...next.usedQuestionIds, [selected]: seenIds };
      return next;
    });
  };

  const resetProgress = () => {
    if (!window.confirm("¿Reiniciar posición, marcadores, capítulos terminados y resultados de evaluación en este dispositivo? Tus preferencias de lectura se conservarán.")) return;
    setStudy((previous) => clearStudyProgress(previous));
  };

  const goToSection = (referenceId: string) => {
    const match = referenceId.match(/^l([1-7])-(.+)$/);
    if (!match) return;
    const layer = Number(match[1]) as AcademyLayer;
    const key = match[2];
    setKnowledgeTermId(null);
    setAssessment(null);
    setCompletedRun(null);
    if (selected !== layer || view !== "reader") openLayer(layer);
    else window.history.replaceState(null, "", `/capas#capa-${layer}`);
    window.setTimeout(() => {
      const target = document.getElementById(sectionId(layer, key));
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }, 40);
  };

  const latestAttempt = study.attempts[study.attempts.length - 1];
  return (
    <div className="academy-shell" data-theme={study.preferences.theme} data-reader-font={study.preferences.font} style={style}>
      <a className="academy-skip" href="#lesson-content">Saltar al contenido</a>
      <header className="academy-header">
        <button className="academy-brand" type="button" onClick={goToLibrary} aria-label="Atlas OSI Academia, abrir biblioteca">
          <span className="academy-mark" aria-hidden="true">A</span><span><strong>ATLAS OSI</strong><small>ACADEMIA DE REDES</small></span>
        </button>
        {view === "reader" && <button className="header-library-button" type="button" onClick={goToLibrary}><Library size={16} aria-hidden="true" /> Biblioteca</button>}
      </header>

      {view === "library" ? (
        <main className="academy-main academy-library" id="lesson-content">
          <section className="academy-intro" aria-labelledby="academy-title">
            <div className="academy-kicker">LECTURAS TÉCNICAS <span>·</span> 7 CAPÍTULOS</div>
            <h1 id="academy-title">Redes, leídas<br className="academy-desktop-break" /> desde sus capas.</h1>
            <p>Un libro digital para estudiar cómo se comunican los sistemas, observar evidencia y construir criterio técnico. El modelo OSI ordena funciones; las redes reales combinan esos límites de maneras distintas.</p>
            {study.readProgress[study.lastLayer] ? <div className="continue-reading"><div><span>CONTINUAR DONDE LO DEJASTE</span><strong>Capítulo 0{study.lastLayer} · {academyLessons[study.lastLayer - 1].name}</strong><small>{study.readProgress[study.lastLayer]} % leído</small></div><button type="button" onClick={() => openLayer(study.lastLayer, true)}>Continuar <ChevronRight size={16} aria-hidden="true" /></button></div>
              : <p className="academy-study-note">La lectura y los resultados se guardan solo en este dispositivo. Tiempo estimado a 210 palabras por minuto.</p>}
            <button className="knowledge-library-entry" type="button" onClick={() => setKnowledgeTermId("__dictionary__")}><BookOpen size={17} aria-hidden="true" /> Diccionario y Centro de conocimiento</button>
          </section>

          <section className="library-chapters" aria-labelledby="chapters-title">
            <div className="library-section-heading"><div><span>CONTENIDO</span><h2 id="chapters-title">Siete capítulos</h2></div><span>LECTURA · PRÁCTICA · EVALUACIÓN</span></div>
            <ol className="chapter-list">{academyLessons.map((item) => {
              const minutes = estimatedMinutes(item.number);
              const read = study.readProgress[item.number] ?? 0;
              const latest = attemptByLayer[item.number];
              const best = bestLayerScore(study.attempts, item.number);
              const readingStatus = study.completedLayers.includes(item.number) ? "Lectura terminada" : "Lectura en curso";
              const assessmentStatus = latest ? `${latest.passed ? "Aprobada" : "Último intento"} · mejor ${best}%` : "Sin evaluación";
              return <li key={item.number}>
                <button type="button" className="chapter-row" onClick={() => openLayer(item.number)} aria-label={`Abrir capítulo ${item.number}: ${item.name}`}>
                  <span className="chapter-number">{String(item.number).padStart(2, "0")}</span>
                  <span className="chapter-copy"><strong>{item.name}</strong><span>{summaries[item.number - 1]}</span><small>{minutes} min de lectura <span aria-hidden="true">·</span> {read}% leído <span aria-hidden="true">·</span> {readingStatus} <span aria-hidden="true">·</span> Evaluación: {assessmentStatus}</small><span className="chapter-progress-track" aria-hidden="true"><span style={{ width: `${read}%` }} /></span></span>
                  <ChevronRight className="chapter-chevron" size={20} aria-hidden="true" />
                </button>
              </li>;
            })}</ol>
          </section>

          <section className="integrated-entry" aria-labelledby="integrated-title">
            <div><span>EJERCICIO DE CIERRE</span><h2 id="integrated-title">Evaluación integral OSI</h2><p>25 preguntas para conectar las siete capas a través de casos de investigación y diagnóstico.</p></div>
            <button type="button" onClick={() => { setAssessment("integrated"); setCompletedRun(null); }}>Iniciar evaluación <ChevronRight size={16} aria-hidden="true" /></button>
          </section>
          {latestAttempt && <section className="recent-study" aria-label="Actividad de estudio reciente"><p>ÚLTIMO RESULTADO</p><strong>{latestAttempt.layer === "integrated" ? "Evaluación integral" : `Capítulo 0${latestAttempt.layer} · ${academyLessons[latestAttempt.layer - 1].name}`}</strong><span>{latestAttempt.percent}% · {new Date(latestAttempt.date).toLocaleDateString("es-MX")}</span></section>}
          <div className="library-utilities"><button type="button" onClick={resetProgress}>Reiniciar progreso de lectura y evaluaciones</button></div>
          <footer className="academy-footer"><span>ATLAS OSI · ACADEMIA</span><span>UNA GUÍA DE ESTUDIO, NO UNA CERTIFICACIÓN</span></footer>
        </main>
      ) : (
        <>
          <div className="reader-toolbar" aria-label="Herramientas de lectura">
            <div className="reader-toolbar-inner">
              <button type="button" onClick={goToLibrary} aria-label="Abrir índice del libro"><Library size={17} aria-hidden="true" /><span>Índice</span></button>
              <button type="button" onClick={() => setKnowledgeTermId("__dictionary__")} aria-label="Abrir Diccionario y Centro de conocimiento"><BookOpen size={17} aria-hidden="true" /><span>Diccionario</span></button>
              <button type="button" aria-expanded={settingsOpen} aria-controls="reader-settings" onClick={() => setSettingsOpen((open) => !open)}><Settings2 size={17} aria-hidden="true" /><span>Lectura</span></button>
              <button type="button" onClick={() => { if (typeof study.bookmarks[selected] === "number") scrollTo(study.bookmarks[selected]!); else toggleBookmark(); }} aria-label={typeof study.bookmarks[selected] === "number" ? "Ir al marcador guardado" : "Guardar marcador de lectura"}><Bookmark size={17} aria-hidden="true" fill={typeof study.bookmarks[selected] === "number" ? "currentColor" : "none"} /><span>{typeof study.bookmarks[selected] === "number" ? "Marcador" : "Marcar"}</span></button>
              <div className="reader-progress" aria-label={`Progreso de lectura ${study.readProgress[selected] ?? 0}%`}><span>Cap. 0{selected} / 07</span><progress max={100} value={study.readProgress[selected] ?? 0} aria-label={`Progreso del capítulo ${lesson.name}`} /></div>
            </div>
            {settingsOpen && <section className="reader-settings" id="reader-settings" aria-label="Ajustes de lectura">
              <label>Tema <select value={study.preferences.theme} onChange={(event) => changePreference("theme", event.target.value as ReaderPreferences["theme"])}><option value="paper">Papel</option><option value="sepia">Sepia</option><option value="dark">Oscuro</option></select></label>
              <label>Tipografía <select value={study.preferences.font} onChange={(event) => changePreference("font", event.target.value as ReaderPreferences["font"])}><option value="serif">Serif</option><option value="sans">Sans serif</option></select></label>
              <label>Tamaño <span>{study.preferences.fontSize}px</span><input type="range" min="15" max="21" step="1" value={study.preferences.fontSize} onChange={(event) => changePreference("fontSize", Number(event.target.value))} /></label>
              <label>Interlineado <span>{study.preferences.lineHeight.toFixed(2)}</span><input type="range" min="1.55" max="1.95" step="0.05" value={study.preferences.lineHeight} onChange={(event) => changePreference("lineHeight", Number(event.target.value))} /></label>
              <label>Ancho de lectura <span>{study.preferences.columnWidth}px</span><input type="range" min="600" max="780" step="20" value={study.preferences.columnWidth} onChange={(event) => changePreference("columnWidth", Number(event.target.value))} /></label>
              <label>Espacio entre párrafos <span>{study.preferences.paragraphSpacing}px</span><input type="range" min="8" max="22" step="2" value={study.preferences.paragraphSpacing} onChange={(event) => changePreference("paragraphSpacing", Number(event.target.value))} /></label>
              {typeof study.bookmarks[selected] === "number" && <button className="remove-bookmark" type="button" onClick={toggleBookmark}>Quitar marcador de este capítulo</button>}
            </section>}
          </div>
          <div className="academy-main reader-layout">
            <aside className="reader-toc" aria-label="Índice del capítulo"><p>EN ESTE CAPÍTULO</p><nav>{sectionLinks.map(([id, label]) => <a key={id} href={`#${sectionId(selected, id)}`} onClick={() => setSectionIndexOpen(false)}>{label}</a>)}</nav></aside>
            <main className="reader-main-column" id="lesson-content">
              <nav className="academy-layer-nav" aria-label="Navegación rápida entre capas">
                <div className="academy-nav-heading"><span>CAPÍTULOS</span><span>0{selected} / 07</span></div>
                <div className="academy-layer-list">{academyLessons.map((item) => <button className={selected === item.number ? "academy-layer-button is-selected" : "academy-layer-button"} key={item.number} type="button" aria-label={`Capa ${item.number}: ${item.name}`} aria-pressed={selected === item.number} onClick={() => openLayer(item.number)}><span className="academy-layer-number">0{item.number}</span><span className="academy-layer-name">{item.name}</span></button>)}</div>
                <details className="mobile-section-index" open={sectionIndexOpen} onToggle={(event) => setSectionIndexOpen(event.currentTarget.open)}><summary>Secciones del capítulo</summary><nav>{sectionLinks.map(([id, label]) => <a key={id} href={`#${sectionId(selected, id)}`} onClick={() => setSectionIndexOpen(false)}>{label}</a>)}</nav></details>
              </nav>

              <article className="academy-lesson" id="lesson-content-article" aria-labelledby="lesson-title" ref={readerRef}>
                <header className="academy-lesson-heading">
                  <div className="academy-lesson-overline"><span>CAPÍTULO 0{lesson.number}</span><span className="academy-overline-rule" /><span>{lesson.pdu.toUpperCase()}</span></div>
                  <h1 id="lesson-title" aria-live="polite">{lesson.name}</h1>
                  <p className="chapter-deck">{summaries[selected - 1]}</p>
                  <p className="academy-objective"><span>OBJETIVO</span>{lesson.objective}</p>
                </header>

                <section className="academy-section" id={sectionId(selected, "fundamentos")} aria-labelledby="fundamentos-title"><div className="academy-section-label"><span>01</span><h2 id="fundamentos-title">Fundamentos y explicación técnica</h2></div><div className="academy-prose">{lesson.fundamentals.map((paragraph) => <p key={paragraph}>{annotate(paragraph, "fundamentos")}</p>)}</div></section>
                <section className="academy-section" id={sectionId(selected, "flujo")} aria-labelledby="flujo-title"><div className="academy-section-label"><span>02</span><h2 id="flujo-title">Funcionamiento paso a paso</h2></div><ol className="academy-step-list">{lesson.workflow.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{annotate(step, "flujo")}</p></li>)}</ol></section>
                <section className="academy-section" id={sectionId(selected, "encapsulacion")} aria-labelledby="encapsulacion-title"><div className="academy-section-label"><span>03</span><h2 id="encapsulacion-title">Encapsulación y PDU</h2></div><div className="academy-callout"><strong>{annotate(lesson.pdu, "encapsulacion")}</strong><p>{annotate(lesson.encapsulation, "encapsulacion")}</p></div></section>
                <section className="academy-section" id={sectionId(selected, "protocolos")} aria-labelledby="protocolos-title"><div className="academy-section-label"><span>04</span><h2 id="protocolos-title">Protocolos y estándares</h2></div><div className="academy-table-wrap" role="region" aria-label="Protocolos y estándares relacionados" tabIndex={0}><table><thead><tr><th scope="col">Protocolo / estándar</th><th scope="col">Función y clasificación</th></tr></thead><tbody>{lesson.protocols.map((protocol) => <tr key={protocol.name}><th scope="row">{annotate(protocol.name, "protocolos")}</th><td>{annotate(protocol.role, "protocolos")}</td></tr>)}</tbody></table></div></section>
                <section className="academy-section" id={sectionId(selected, "tecnologias")} aria-labelledby="tecnologias-title"><div className="academy-section-label"><span>05</span><h2 id="tecnologias-title">Dispositivos y tecnologías</h2></div><div className="academy-tech-list">{lesson.technologies.map((technology, index) => <div className="academy-tech-row" key={technology.name}><span>0{index + 1}</span><strong>{annotate(technology.name, "tecnologias")}</strong><p>{annotate(technology.role, "tecnologias")}</p></div>)}</div></section>
                <section className="academy-section" id={sectionId(selected, "comunicacion")} aria-labelledby="ejemplo-title"><div className="academy-section-label"><span>06</span><h2 id="ejemplo-title">Una comunicación real</h2></div><div className="academy-prose"><p>{annotate(lesson.communication, "comunicacion")}</p></div></section>
                <section className="academy-section academy-team-section" id={sectionId(selected, "blue-team")} aria-labelledby="blue-title"><div className="academy-section-label"><span>07</span><h2 id="blue-title">Perspectiva Blue Team</h2></div><p className="academy-section-lead">Investigar una señal requiere contexto, telemetría y una hipótesis comprobable. Un indicador aislado no demuestra un incidente.</p><div className="academy-insight-list">{lesson.blueTeam.map((item) => <div className="academy-insight" key={item.heading}><h3>{item.heading}</h3><p><GlossaryText termIds={termAnnotationsBySection[sectionId(selected, "blue-team")] ?? []} onOpenTerm={setKnowledgeTermId}>{item.detail}</GlossaryText></p></div>)}</div>
                  <section className="academy-investigation" aria-labelledby="investigation-title">
                    <p className="academy-case-label">CASO DE INVESTIGACIÓN · ESCENARIO SINTÉTICO</p><h3 id="investigation-title">{investigation.title}</h3>
                    <div className="academy-case-columns"><div><h4>Comportamiento esperado</h4><p>{annotate(investigation.normal, "blue-team")}</p></div><div><h4>Señal observada</h4><p>{annotate(investigation.anomaly, "blue-team")}</p></div></div>
                    <div className="academy-evidence"><h4>Evidencia disponible</h4><ul>{investigation.evidence.map((item) => <li key={item}><code>{item}</code></li>)}</ul><p>{annotate(investigation.problem, "blue-team")}</p></div>
                    <div className="academy-case-columns"><div><h4>Investigación</h4><ul>{investigation.investigation.map((item) => <li key={item}>{annotate(item, "blue-team")}</li>)}</ul></div><div><h4>Contención y mitigación</h4><ul>{investigation.mitigation.map((item) => <li key={item}>{annotate(item, "blue-team")}</li>)}</ul></div></div>
                    <div className="academy-case-columns academy-case-caveats"><div><h4>Hipótesis alternativas</h4><p>{annotate(investigation.falsePositives, "blue-team")}</p></div><div><h4>Alcance de la evidencia</h4><p>{annotate(investigation.limits, "blue-team")}</p></div></div>
                    <p className="academy-case-tools"><strong>Fuentes que pueden ayudar:</strong> {annotate(investigation.tools.join(" · "), "blue-team")}</p>
                    {investigation.mitre && <section className="framework-note" aria-labelledby="mitre-scenario-title"><h4 id="mitre-scenario-title">Relación con MITRE ATT&amp;CK</h4>{investigation.mitre.map((mapping) => <article key={mapping.id}><p className="framework-technique"><strong>{mapping.id} · {mapping.name}</strong><span>{mapping.tactic} · ATT&amp;CK v{mapping.version}</span></p><p>{mapping.description}</p><p><strong>Relación con el caso:</strong> {mapping.scenarioRelation}</p><p><strong>Evidencia útil:</strong> {mapping.evidence}</p><p><strong>Límites:</strong> {mapping.limitations}</p><a href={mapping.url} target="_blank" rel="noreferrer">Referencia oficial MITRE</a></article>)}</section>}
                    {investigation.nist && <section className="framework-note" aria-labelledby="nist-scenario-title"><h4 id="nist-scenario-title">Relación con NIST CSF 2.0</h4><p>Estas actividades se relacionan con funciones del marco; no constituyen una declaración de cumplimiento.</p>{investigation.nist.map((mapping) => <article key={mapping.function}><p className="framework-technique"><strong>{mapping.function}</strong><span>{mapping.framework}</span></p><p>{mapping.reason}</p></article>)}<a href="https://www.nist.gov/cyberframework" target="_blank" rel="noreferrer">Referencia oficial NIST</a></section>}
                  </section>
                </section>
                <section className="academy-section academy-team-section" id={sectionId(selected, "red-team")} aria-labelledby="red-title"><div className="academy-section-label"><span>08</span><h2 id="red-title">Perspectiva Red Team</h2></div><p className="academy-section-lead">Las técnicas se practican con autorización explícita, activos definidos y límites de impacto acordados.</p><div className="academy-insight-list">{lesson.redTeam.map((item) => <div className="academy-insight" key={item.heading}><h3>{item.heading}</h3><p>{annotate(item.detail, "red-team")}</p></div>)}</div></section>
                <section className="academy-section" id={sectionId(selected, "comandos")} aria-labelledby="comandos-title"><div className="academy-section-label"><span>09</span><h2 id="comandos-title">Comandos Linux de práctica</h2></div><p className="academy-section-lead">Ejemplos reproducibles. Los comandos de consulta muestran el entorno local; reemplaza los destinos solo dentro de tu alcance autorizado.</p><div className="academy-command-list">{lesson.commands.map((item) => <article className="academy-command" key={item.command}><pre><code>{item.command}</code></pre><div><strong>{annotate(item.purpose, "comandos")}</strong><p>{annotate(item.interpretation, "comandos")}</p></div></article>)}</div></section>
                <section className="academy-section" id={sectionId(selected, "errores")} aria-labelledby="errores-title"><div className="academy-section-label"><span>10</span><h2 id="errores-title">Errores conceptuales frecuentes</h2></div><dl className="academy-misconceptions">{lesson.misconceptions.map((item) => <div key={item.claim}><dt>{annotate(item.claim, "errores")}</dt><dd>{annotate(item.correction, "errores")}</dd></div>)}</dl></section>
                <section className="academy-section" id={sectionId(selected, "ejercicios")} aria-labelledby="ejercicios-title"><div className="academy-section-label"><span>11</span><h2 id="ejercicios-title">Ejercicios de lectura</h2></div><div className="academy-exercises">{lesson.exercises.map((item, index) => <details key={item.question}><summary><span>0{index + 1}</span>{annotate(item.question, "ejercicios")}</summary><p>{annotate(item.answer, "ejercicios")}</p></details>)}</div></section>
                <section className="academy-section" id={sectionId(selected, "resumen")} aria-labelledby="summary-title"><div className="academy-section-label"><span>12</span><h2 id="summary-title">Resumen técnico</h2></div><ol className="academy-recap">{chapterRecaps[selected].map((item) => <li key={item}>{annotate(item, "resumen")}</li>)}</ol></section>
                <section className="academy-section" id={sectionId(selected, "referencias")} aria-labelledby="references-title"><div className="academy-section-label"><span>13</span><h2 id="references-title">Referencias y lecturas primarias</h2></div><p className="academy-section-lead">Estándares, RFC y documentación primaria usados para ampliar esta lectura. Los enlaces requieren conexión.</p><ul className="academy-reference-list">{chapterReferences[selected].map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer"><strong>{reference.title}</strong><span>{reference.note}</span></a></li>)}</ul></section>
                <aside className="academy-model-note" aria-label="Nota sobre el modelo OSI"><strong>El modelo es un mapa, no una pila literal.</strong><p>TCP/IP agrupa las capas de sesión, presentación y aplicación como aplicación; su capa de enlace reúne funciones que el modelo OSI separa entre física y enlace. Protocolos como TLS, ARP, ICMP y QUIC se clasifican según la función estudiada y el contexto. La clasificación no reemplaza leer el estándar ni observar una implementación real.</p></aside>

                <section className="chapter-assessment-entry" id={sectionId(selected, "evaluacion")} aria-labelledby="chapter-assessment-title"><p>14 · COMPROBAR LO APRENDIDO</p><h2 id="chapter-assessment-title">¿Puedes interpretar la evidencia?</h2><span>Diez preguntas aleatorias · al menos cuatro de razonamiento Blue Team · resultados guardados en este dispositivo.</span><button type="button" onClick={() => { setAssessment("chapter"); setCompletedRun(null); }}>Evaluar mis conocimientos <ChevronRight size={17} aria-hidden="true" /></button>
                  {attemptByLayer[selected] && <small>Último resultado: {attemptByLayer[selected]!.percent}% · mejor: {bestLayerScore(study.attempts, selected)}%</small>}
                </section>
                {completedRun && assessment === "chapter" && <section className="last-assessment-summary" aria-live="polite"><strong>Resultado guardado: {completedRun.result.percent}%</strong><p>{completedRun.result.passed ? "Capítulo aprobado con el umbral interno de 80 %." : "Repasa las explicaciones marcadas y vuelve a intentarlo."}</p></section>}
                <nav className="academy-next-prev" aria-label="Navegar entre capítulos"><button type="button" onClick={() => openLayer(Math.max(1, selected - 1) as AcademyLayer)} disabled={selected === 1}><ChevronLeft size={17} aria-hidden="true" /><span><small>ANTERIOR</small>{selected > 1 ? academyLessons[selected - 2].name : "Inicio del libro"}</span></button><button type="button" onClick={() => openLayer(Math.min(7, selected + 1) as AcademyLayer)} disabled={selected === 7}><span><small>SIGUIENTE</small>{selected < 7 ? academyLessons[selected].name : "Fin del libro"}</span><ChevronRight size={17} aria-hidden="true" /></button></nav>
              </article>
              <footer className="academy-footer"><span>ATLAS OSI · ACADEMIA</span><span>CAPÍTULO 0{selected} DE 07</span><button type="button" onClick={goToLibrary}>Volver a la biblioteca</button></footer>
            </main>
          </div>
        </>
      )}

      <button className={showTop ? "academy-back-top is-visible" : "academy-back-top"} type="button" aria-label="Volver arriba" title="Volver arriba" tabIndex={showTop ? 0 : -1} onClick={() => scrollTo(0)}><ArrowUp size={19} aria-hidden="true" /></button>
      {assessment && <Suspense fallback={<div className="academy-dialog-backdrop"><p className="assessment-loading" role="status">Preparando evaluación…</p></div>}><AssessmentDialog kind={assessment} layer={selected} previousQuestionIds={study.usedQuestionIds[selected] ?? []} onClose={() => setAssessment(null)} onFinish={onAssessmentFinish} onOpenTerm={setKnowledgeTermId} onOpenSection={goToSection} /></Suspense>}
      {knowledgeTermId && <KnowledgeCenterDialog initialTermId={knowledgeTermId === "__dictionary__" ? null : knowledgeTermId} currentLayer={selected} onClose={() => setKnowledgeTermId(null)} onOpenSection={(layer, key) => goToSection(sectionId(layer, key))} />}
    </div>
  );
}
