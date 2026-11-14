import { useEffect, useMemo, useRef, useState } from "react";
import { knowledgeById, sectionLabel, type AcademyLayer } from "./knowledge";

type Props = {
  conceptId: string;
  currentLayer: AcademyLayer;
  onClose: () => void;
  onOpenSection: (layer: AcademyLayer, sectionKey: string) => void;
};

export function ContextualTermDialog({ conceptId, currentLayer, onClose, onOpenSection }: Props) {
  const [selectedId, setSelectedId] = useState(conceptId);
  const [technical, setTechnical] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const concept = knowledgeById.get(selectedId) ?? knowledgeById.get(conceptId)!;
  const courseSection = useMemo(() => {
    const preferred = concept.sectionIds.find((id) => id.startsWith(`l${currentLayer}-`)) ?? concept.sectionIds[0];
    const match = preferred.match(/^l([1-7])-(.+)$/);
    return match ? { layer: Number(match[1]) as AcademyLayer, key: match[2], label: sectionLabel(preferred) } : null;
  }, [concept, currentLayer]);

  useEffect(() => {
    const readingPosition = window.scrollY;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) { event.preventDefault(); dialogRef.current.focus({ preventScroll: true }); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
      window.scrollTo({ top: readingPosition, behavior: "instant" });
      window.setTimeout(() => opener.current?.focus({ preventScroll: true }), 0);
    };
  }, []);

  useEffect(() => {
    if (selectedId !== conceptId) titleRef.current?.focus({ preventScroll: true });
  }, [selectedId, conceptId]);

  return (
    <div className="academy-dialog-backdrop contextual-term-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="contextual-term-dialog" role="dialog" aria-modal="true" aria-labelledby="contextual-term-title" ref={dialogRef} tabIndex={-1}>
        <header className="contextual-term-header">
          <div>
            <p className="assessment-kicker">DICCIONARIO CONTEXTUAL</p>
            <h2 id="contextual-term-title" ref={titleRef} tabIndex={-1}>{concept.name}</h2>
            {concept.expandedName && <p className="contextual-term-expanded">{concept.expandedName}</p>}
          </div>
          <button className="assessment-close" type="button" aria-label={`Cerrar definición de ${concept.name}`} onClick={onClose}>Cerrar <span aria-hidden="true">×</span></button>
        </header>
        <div className="contextual-term-layers" aria-label="Capas relacionadas">{concept.layers.map((layer) => <span key={layer}>Capa {layer}</span>)}</div>
        <div className="knowledge-definition-toggle" role="group" aria-label="Nivel de explicación">
          <button type="button" aria-pressed={!technical} onClick={() => setTechnical(false)}>Definición sencilla</button>
          <button type="button" aria-pressed={technical} onClick={() => setTechnical(true)}>Definición técnica</button>
        </div>
        <p className="contextual-term-definition">{technical ? concept.technicalDefinition : concept.simpleDefinition}</p>
        <section className="contextual-term-example"><h3>Ejemplo práctico</h3><p>{concept.example}</p></section>
        {concept.relatedConceptIds.length > 0 && <section className="contextual-term-related"><h3>También relacionado</h3><div>{concept.relatedConceptIds.map((id) => knowledgeById.get(id)).filter((item) => Boolean(item)).map((item) => <button type="button" key={item!.id} onClick={() => { setSelectedId(item!.id); setTechnical(false); }}>{item!.name}</button>)}</div></section>}
        {concept.references.length > 0 && <section className="contextual-term-references"><h3>Referencias</h3><ul>{concept.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul></section>}
        {courseSection && <footer className="contextual-term-footer"><button type="button" onClick={() => onOpenSection(courseSection.layer, courseSection.key)}>Profundizar · {courseSection.label}</button></footer>}
      </section>
    </div>
  );
}
