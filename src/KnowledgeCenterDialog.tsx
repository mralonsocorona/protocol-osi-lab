import { useEffect, useMemo, useRef, useState } from "react";
import { lessons as scenarios } from "./education";
import {
  knowledgeById, knowledgeConcepts, layerNames, mitreReferences, nistReferences,
  searchKnowledge, sectionLabel, type AcademyLayer, type KnowledgeConcept,
} from "./knowledge";

type Props = {
  initialTermId?: string | null;
  currentLayer: AcademyLayer;
  onClose: () => void;
  onOpenSection: (layer: AcademyLayer, sectionId: string) => void;
};

type Tab = "dictionary" | "layers" | "scenarios" | "references";

export function KnowledgeCenterDialog({ initialTermId = null, currentLayer, onClose, onOpenSection }: Props) {
  const [tab, setTab] = useState<Tab>("dictionary");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialTermId);
  const [technical, setTechnical] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const filtered = useMemo(() => searchKnowledge(query), [query]);
  const selected: KnowledgeConcept | undefined = selectedId ? knowledgeById.get(selectedId) : undefined;

  useEffect(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchRef.current?.focus();
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
      window.setTimeout(() => opener.current?.focus(), 0);
    };
  }, []);

  const openSection = (layer: AcademyLayer, sectionId: string) => onOpenSection(layer, sectionId);
  const chooseTab = (value: Tab) => { setTab(value); if (value === "dictionary") searchRef.current?.focus(); };

  return (
    <div className="academy-dialog-backdrop knowledge-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="knowledge-dialog" role="dialog" aria-modal="true" aria-labelledby="knowledge-title" ref={dialogRef} tabIndex={-1}>
        <header className="knowledge-header">
          <div><p className="assessment-kicker">ATLAS OSI · CENTRO DE CONOCIMIENTO</p><h2 id="knowledge-title">Diccionario</h2></div>
          <button className="assessment-close" type="button" aria-label="Cerrar diccionario" onClick={onClose}>Cerrar <span aria-hidden="true">×</span></button>
        </header>
        <nav className="knowledge-tabs" aria-label="Explorar el centro de conocimiento">
          {([["dictionary", "Diccionario"], ["layers", "Capas"], ["scenarios", "Escenarios"], ["references", "MITRE y NIST"]] as const).map(([value, label]) =>
            <button type="button" key={value} aria-pressed={tab === value} className={tab === value ? "is-selected" : ""} onClick={() => chooseTab(value)}>{label}</button>)}
        </nav>

        {tab === "dictionary" && <div className="knowledge-content knowledge-dictionary">
          <aside className="knowledge-index" aria-label="Términos del diccionario">
            <label className="knowledge-search"><span>Buscar un término o sigla</span><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. SYN_RECV, gateway, TLS" /></label>
            <p className="knowledge-count" aria-live="polite">{filtered.length} {filtered.length === 1 ? "término" : "términos"}</p>
            <div className="knowledge-results">
              {filtered.map((concept) => <button className={selectedId === concept.id ? "knowledge-result is-selected" : "knowledge-result"} key={concept.id} type="button" onClick={() => { setSelectedId(concept.id); setTechnical(false); }}>
                <strong>{concept.name}</strong><span>{concept.simpleDefinition}</span>
              </button>)}
              {filtered.length === 0 && <p className="knowledge-empty">No hay coincidencias. Prueba una sigla, sinónimo o nombre desarrollado.</p>}
            </div>
          </aside>
          <article className="knowledge-detail" aria-live="polite">
            {selected ? <>
              <div className="knowledge-term-heading"><div><p className="assessment-kicker">{selected.acronym || "CONCEPTO"}{selected.expandedName ? ` · ${selected.expandedName}` : ""}</p><h3>{selected.name}</h3></div><div className="knowledge-layer-tags">{selected.layers.map((layer) => <span key={layer}>L{layer} · {layerNames[layer]}</span>)}</div></div>
              <div className="knowledge-definition-toggle" role="group" aria-label="Nivel de explicación">
                <button type="button" aria-pressed={!technical} onClick={() => setTechnical(false)}>Explicación sencilla</button>
                <button type="button" aria-pressed={technical} onClick={() => setTechnical(true)}>Definición técnica</button>
              </div>
              <p className="knowledge-definition">{technical ? selected.technicalDefinition : selected.simpleDefinition}</p>
              <section className="knowledge-example"><h4>Ejemplo</h4><p>{selected.example}</p></section>
              <section className="knowledge-related"><h4>Conceptos relacionados</h4><div>{selected.relatedConceptIds.map((id) => knowledgeById.get(id)).filter((item): item is KnowledgeConcept => Boolean(item)).map((concept) =>
                <button type="button" key={concept.id} onClick={() => { setSelectedId(concept.id); setTechnical(false); }}>{concept.name}</button>)}</div></section>
              <section className="knowledge-course-sections"><h4>Estudiar en el curso</h4><ul>{selected.sectionIds.map((id) => <li key={id}><button type="button" onClick={() => {
                const match = id.match(/^l([1-7])-(.+)$/);
                if (match) openSection(Number(match[1]) as AcademyLayer, match[2]);
              }}>{sectionLabel(id)}</button></li>)}</ul></section>
              <section className="knowledge-sources"><h4>Referencias</h4><ul>{selected.references.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></section>
            </> : <div className="knowledge-placeholder"><h3>Busca un concepto</h3><p>Las definiciones, relaciones y referencias funcionan sin conexión una vez instalada la aplicación.</p></div>}
          </article>
        </div>}

        {tab === "layers" && <div className="knowledge-explorer"><p className="knowledge-intro">Siete capítulos organizan las funciones de red. La relación sirve para estudiar; los protocolos reales pueden cruzar los límites del modelo.</p><ol className="knowledge-layer-list">{([1, 2, 3, 4, 5, 6, 7] as AcademyLayer[]).map((layer) => {
          const concepts = knowledgeConcepts.filter((concept) => concept.layers.includes(layer));
          return <li key={layer}><div><span>CAPA 0{layer}</span><h3>{layerNames[layer]}</h3><p>{concepts.slice(0, 5).map((concept) => concept.name).join(" · ")}</p></div><button type="button" onClick={() => openSection(layer, "fundamentos")}>Abrir capítulo</button></li>;
        })}</ol><p className="knowledge-current">Capítulo actual: {layerNames[currentLayer]}</p></div>}

        {tab === "scenarios" && <div className="knowledge-explorer"><p className="knowledge-intro">Los casos son escenarios sintéticos. Una señal inicia una investigación y no demuestra por sí sola intención adversaria.</p><div className="knowledge-scenario-list">{scenarios.map((lesson) => <article key={lesson.n}><div><span>CAPA 0{lesson.n} · BLUE TEAM</span><h3>{lesson.scenario.title}</h3><p>{lesson.scenario.problem}</p></div><button type="button" onClick={() => openSection(lesson.n, "blue-team")}>Estudiar el caso</button></article>)}</div></div>}

        {tab === "references" && <div className="knowledge-explorer knowledge-frameworks">
          <section><p className="assessment-kicker">COMPORTAMIENTOS ADVERSARIOS</p><h3>MITRE ATT&amp;CK</h3><p>ATT&amp;CK describe tácticas y técnicas observadas en comportamientos adversarios; no clasifica protocolos por capas OSI.</p>
            <article><strong>{mitreReferences.arpPoisoning.id} · {mitreReferences.arpPoisoning.name} · v{mitreReferences.arpPoisoning.version}</strong><p>{mitreReferences.arpPoisoning.summary}</p><a href={mitreReferences.arpPoisoning.url} target="_blank" rel="noreferrer">Consultar MITRE</a></article>
            <article><strong>{mitreReferences.dnsC2.id} · {mitreReferences.dnsC2.name} · v{mitreReferences.dnsC2.version}</strong><p>{mitreReferences.dnsC2.summary}</p><a href={mitreReferences.dnsC2.url} target="_blank" rel="noreferrer">Consultar MITRE</a></article>
          </section>
          <section><p className="assessment-kicker">GESTIÓN DEL RIESGO Y RESPUESTA</p><h3>NIST</h3><p><a href={nistReferences.csf.url} target="_blank" rel="noreferrer">{nistReferences.csf.title}</a> define las funciones concurrentes Govern, Identify, Protect, Detect, Respond y Recover. Los ejemplos del curso son relaciones educativas, no declaraciones de cumplimiento.</p><article><strong>{nistReferences.incidentResponse.title}</strong><p>{nistReferences.incidentResponse.status}. Publicación vigente consultada para estructurar preparación, detección, respuesta y recuperación.</p><a href={nistReferences.incidentResponse.url} target="_blank" rel="noreferrer">Consultar NIST CSRC</a></article></section>
        </div>}
        <footer className="knowledge-footer"><span>Lectura local · sin cuenta ni servicios remotos</span><button type="button" onClick={onClose}>Volver a la lectura</button></footer>
      </section>
    </div>
  );
}
