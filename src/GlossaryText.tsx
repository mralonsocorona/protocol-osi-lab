import type { ReactNode } from "react";
import { knowledgeConcepts, knowledgeById, type KnowledgeConcept } from "./knowledge";

type Props = { children: string; termIds: string[]; onOpenTerm: (id: string) => void };
type Match = { start: number; end: number; id: string };

function isWord(character: string | undefined): boolean {
  return Boolean(character && /[\p{L}\p{N}_]/u.test(character));
}

/** Annotates only editorially selected terms, by rendering text nodes and semantic buttons. */
export function GlossaryText({ children, termIds, onOpenTerm }: Props): ReactNode {
  const allowed = new Set(termIds);
  const candidates: Array<{ value: string; concept: KnowledgeConcept }> = [];
  for (const concept of knowledgeConcepts) {
    if (!allowed.has(concept.id)) continue;
    for (const value of new Set([concept.name, concept.acronym, ...concept.synonyms].filter(Boolean)))
      candidates.push({ value, concept });
  }
  candidates.sort((a, b) => b.value.length - a.value.length);
  const matches: Match[] = [];
  for (const candidate of candidates) {
    const matcher = new RegExp(candidate.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "giu");
    for (const found of children.matchAll(matcher)) {
      const start = found.index ?? 0;
      const end = start + found[0].length;
      if (isWord(children[start - 1]) || isWord(children[end])) continue;
      if (matches.some((item) => start < item.end && end > item.start)) continue;
      matches.push({ start, end, id: candidate.concept.id });
    }
  }
  if (!matches.length) return children;
  matches.sort((a, b) => a.start - b.start);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) parts.push(children.slice(cursor, match.start));
    const label = knowledgeById.get(match.id)?.name ?? children.slice(match.start, match.end);
    parts.push(<button className="glossary-term" type="button" key={`${match.start}-${match.id}`} aria-haspopup="dialog" onClick={() => onOpenTerm(match.id)}>{children.slice(match.start, match.end)}<span className="visually-hidden">: abrir definición de {label}</span></button>);
    cursor = match.end;
  }
  if (cursor < children.length) parts.push(children.slice(cursor));
  return <>{parts}</>;
}
