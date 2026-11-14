import { useEffect, useMemo, useRef, useState } from "react";
import { createIntegratedAttempt, createLayerAttempt, isQuestionCorrect, scoreAssessment, type AnswerMap, type PreparedQuestion } from "./assessment-engine";
import type { AssessmentKind } from "./assessment-bank";
import type { AcademyLayer } from "./academy";
import type { AssessmentResult } from "./assessment-engine";

type Props = {
  kind: AssessmentKind;
  layer: AcademyLayer;
  previousQuestionIds?: string[];
  onClose: () => void;
  onFinish: (details: { result: AssessmentResult; questions: PreparedQuestion[]; answers: AnswerMap; seenIds: string[] }) => void;
};

function correctText(question: PreparedQuestion): string {
  return question.options.filter((option) => question.correctOptionIds.includes(option.id)).map((option) => option.text).join(" · ");
}

export function AssessmentDialog({ kind, layer, previousQuestionIds = [], onClose, onFinish }: Props) {
  const [questionSet] = useState(() => kind === "integrated"
    ? { questions: createIntegratedAttempt(), seenIds: [], cycleReset: false }
    : createLayerAttempt(layer, previousQuestionIds));
  const questions = questionSet.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const opener = useRef<HTMLElement | null>(null);
  const current = questions[index];
  const selected = answers[current?.id] ?? [];

  useEffect(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
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

  const close = () => onClose();
  const select = (optionId: string) => {
    if (confirmed || result) return;
    setAnswers((previous) => {
      const existing = previous[current.id] ?? [];
      const next = current.kind === "multiple"
        ? existing.includes(optionId) ? existing.filter((id) => id !== optionId) : [...existing, optionId]
        : [optionId];
      return { ...previous, [current.id]: next };
    });
  };

  const confirmAnswer = () => {
    if (!selected.length) return;
    setConfirmed(true);
  };

  const moveNext = () => {
    if (index + 1 < questions.length) { setIndex((value) => value + 1); setConfirmed(false); return; }
    const finalResult = scoreAssessment(questions, answers);
    setResult(finalResult);
    onFinish({ result: finalResult, questions, answers, seenIds: questionSet.seenIds });
  };

  const categories = useMemo(() => Object.entries(result?.byCategory ?? {}), [result]);
  const topics = useMemo(() => Object.entries(result?.byTopic ?? {}).sort(([left], [right]) => left.localeCompare(right, "es")), [result]);
  const missedTopics = result ? [...new Set(questions.filter((question) => result.missedIds.includes(question.id)).map((question) => question.topic))] : [];

  return (
    <div className="academy-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="academy-assessment" role="dialog" aria-modal="true" aria-labelledby="assessment-title" aria-describedby="assessment-description" ref={dialogRef} tabIndex={-1}>
        <header className="assessment-header">
          <div><p className="assessment-kicker">{kind === "integrated" ? "EVALUACIÓN INTEGRAL OSI" : `CAPÍTULO 0${layer} · EVALUACIÓN`}</p>
            <h2 id="assessment-title">{result ? "Revisión del intento" : kind === "integrated" ? "Análisis de red" : "Evaluar mis conocimientos"}</h2></div>
          <button className="assessment-close" type="button" aria-label="Cerrar evaluación" onClick={close}>Cerrar <span aria-hidden="true">×</span></button>
        </header>

        {result ? (
          <div className="assessment-result" id="assessment-description">
            <div className="result-score"><strong>{result.percent}%</strong><span>{result.correct} correctas de {result.total}</span><b>{result.passed ? "Dominio interno alcanzado" : "Requiere repaso"}</b></div>
            <p className="assessment-note">El 80 % es un umbral interno de este curso, no un criterio oficial de eJPT.</p>
            <section className="result-breakdown" aria-labelledby="breakdown-title"><h3 id="breakdown-title">Rendimiento por tema</h3>
              {topics.map(([topic, score]) => <div className="result-topic" key={topic}><span>{topic}</span><strong>{score.correct}/{score.total}</strong><progress max={score.total} value={score.correct} aria-label={`${topic}: ${score.correct} de ${score.total}`} /></div>)}
              <h3 className="result-category-heading">Áreas de evaluación</h3>
              {categories.map(([category, score]) => <div className="result-topic" key={category}><span>{category === "blue-team" ? "Blue Team" : category.replace(/-/g, " ")}</span><strong>{score.correct}/{score.total}</strong><progress max={score.total} value={score.correct} aria-label={`${category}: ${score.correct} de ${score.total}`} /></div>)}
              <div className="result-topic result-topic-blue"><span>Razonamiento Blue Team</span><strong>{result.blueTeam.correct}/{result.blueTeam.total}</strong></div>
            </section>
            <h3 className="review-heading">Respuestas razonadas</h3>
            <p className="assessment-note">{result.missedIds.length ? `Prioriza el repaso de ${missedTopics.join(", ")}.` : "Respondiste correctamente todas las preguntas de este intento."}</p>
            <ol className="assessment-review-list">{questions.map((question, itemIndex) => {
              const correct = isQuestionCorrect(question, answers[question.id] ?? []);
              const selectedText = question.options.filter((option) => (answers[question.id] ?? []).includes(option.id)).map((option) => option.text);
              return <li key={question.id} className={correct ? "is-correct" : "is-incorrect"}>
                <span className="review-status">{correct ? "Correcta" : "Repasar"} · {String(itemIndex + 1).padStart(2, "0")}</span>
                <h4>{question.prompt}</h4>
                {selectedText.length > 0 && <p><strong>Tu respuesta:</strong> {selectedText.join(" · ")}</p>}
                {!correct && <p><strong>Respuesta esperada:</strong> {correctText(question)}</p>}
                <p>{question.explanation}</p>
              </li>;
            })}</ol>
            <div className="assessment-actions"><button type="button" className="assessment-primary" onClick={close}>{kind === "integrated" ? "Volver a la biblioteca" : "Volver al capítulo"}</button></div>
          </div>
        ) : (
          <div className="assessment-question-view" id="assessment-description" aria-live="polite">
            <div className="assessment-progress-row"><span>Pregunta {index + 1} de {questions.length}</span><span>{current.category === "blue-team" ? "BLUE TEAM" : current.category.toUpperCase()}</span></div>
            <progress className="assessment-progress" max={questions.length} value={index + 1} aria-label={`Pregunta ${index + 1} de ${questions.length}`} />
            <p className="assessment-context">{current.difficulty} · {current.kind === "multiple" ? "selección múltiple" : current.kind === "evidence" ? "interpretación de evidencia" : current.kind === "scenario" ? "escenario" : "selección única"}</p>
            <h3 className="assessment-prompt">{current.prompt}</h3>
            {current.kind === "multiple" && <p className="assessment-hint">Selecciona todas las opciones que correspondan.</p>}
            <fieldset className="assessment-options" disabled={confirmed}>
              <legend className="visually-hidden">Opciones de respuesta</legend>
              {current.options.map((option) => <label className={selected.includes(option.id) ? "assessment-option is-selected" : "assessment-option"} key={option.id}>
                <input type={current.kind === "multiple" ? "checkbox" : "radio"} name={`answer-${current.id}`} value={option.id} checked={selected.includes(option.id)} onChange={() => select(option.id)} />
                <span>{option.text}</span>
              </label>)}
            </fieldset>
            {confirmed && <div className={isQuestionCorrect(current, selected) ? "assessment-feedback is-correct" : "assessment-feedback is-incorrect"} role="status">
              <strong>{isQuestionCorrect(current, selected) ? "Respuesta correcta" : "Revisa esta distinción"}</strong><p>{current.explanation}</p>
            </div>}
            {questionSet.cycleReset && index === 0 && <p className="assessment-note">Comenzó un nuevo ciclo de preguntas. Las preguntas se repiten después de completar el banco disponible.</p>}
            <div className="assessment-actions">
              <button type="button" className="assessment-secondary" onClick={close}>Salir</button>
              {!confirmed ? <button type="button" className="assessment-primary" onClick={confirmAnswer} disabled={!selected.length}>Confirmar respuesta</button>
                : <button type="button" className="assessment-primary" onClick={moveNext}>{index + 1 === questions.length ? "Ver resultados" : "Siguiente pregunta"}</button>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
