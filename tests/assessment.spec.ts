import { expect, test } from "@playwright/test";
import { layerQuestionBank, integratedQuestionBank, type AssessmentCategory, type AssessmentQuestion } from "../src/assessment-bank";
import { createIntegratedAttempt, createLayerAttempt, isQuestionCorrect, scoreAssessment, shuffle } from "../src/assessment-engine";
import { bestLayerScore, clearStudyProgress, loadStudyState, normalizeStudyState, recordAttempt, saveStudyState, STUDY_STORAGE_KEY, type StudyState } from "../src/academy-state";
import { knowledgeById, knowledgeConcepts, sectionKeys, termAnnotationsBySection } from "../src/knowledge";

const layers = [1, 2, 3, 4, 5, 6, 7] as const;
const categories: AssessmentCategory[] = ["fundamentals", "protocols", "workflow", "linux", "diagnosis", "red-team", "blue-team"];
const sectionRefs = new Set(["fundamentos", "flujo", "encapsulacion", "protocolos", "tecnologias", "comunicacion", "blue-team", "red-team", "comandos", "errores", "ejercicios"]);

function assertQuestionIntegrity(question: AssessmentQuestion) {
  expect(question.id).toBeTruthy();
  expect(question.topic.trim().length).toBeGreaterThan(2);
  expect(question.prompt.trim().length).toBeGreaterThan(25);
  expect(question.explanation.trim().length).toBeGreaterThan(60);
  expect(sectionRefs.has(question.sectionRef), `${question.id} references ${question.sectionRef}`).toBeTruthy();
  expect(question.options.length).toBeGreaterThanOrEqual(4);
  expect(new Set(question.options.map((option) => option.text.trim().toLocaleLowerCase())).size).toBe(question.options.length);
  expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
  expect(question.correctOptionIds.length).toBeGreaterThan(0);
  expect(question.correctOptionIds.every((id) => question.options.some((option) => option.id === id))).toBeTruthy();
  expect(question.kind === "multiple").toBe(question.correctOptionIds.length > 1);
}

test("the bank contains 30 distinct, referenced, explained questions for every layer", () => {
  expect(layerQuestionBank).toHaveLength(210);
  expect(new Set(layerQuestionBank.map((question) => question.id)).size).toBe(210);
  expect(new Set(layerQuestionBank.map((question) => question.prompt.trim().toLocaleLowerCase())).size).toBe(210);
  for (const layer of layers) {
    const layerQuestions = layerQuestionBank.filter((question) => question.layer === layer);
    expect(layerQuestions).toHaveLength(30);
    expect(new Set(layerQuestions.map((question) => question.prompt.trim().toLocaleLowerCase())).size).toBe(30);
    expect(layerQuestions.filter((question) => question.category === "blue-team")).toHaveLength(12);
    for (const category of categories.filter((entry) => entry !== "blue-team"))
      expect(layerQuestions.filter((question) => question.category === category)).toHaveLength(3);
    for (const question of layerQuestions) assertQuestionIntegrity(question);
  }
  expect(layerQuestionBank.filter((question) => question.kind === "multiple")).toHaveLength(7);
});

test("chapter attempts have ten unique questions, all six skill areas, and four Blue Team cases", () => {
  for (const layer of layers) {
    const attempt = createLayerAttempt(layer, [], () => 0.37);
    expect(attempt.questions).toHaveLength(10);
    expect(new Set(attempt.questions.map((question) => question.id)).size).toBe(10);
    expect(attempt.questions.filter((question) => question.category === "blue-team")).toHaveLength(4);
    expect(new Set(attempt.questions.map((question) => question.category))).toEqual(new Set(categories));
    expect(attempt.cycleReset).toBeFalsy();
  }
});

test("three consecutive attempts exhaust each category without repetition and a later attempt begins a new cycle", () => {
  for (const layer of layers) {
    let seen: string[] = [];
    for (let attemptNumber = 0; attemptNumber < 3; attemptNumber += 1) {
      const attempt = createLayerAttempt(layer, seen, () => 0.2 + attemptNumber * 0.15);
      expect(attempt.cycleReset).toBeFalsy();
      expect(attempt.questions.some((question) => seen.includes(question.id))).toBeFalsy();
      seen = attempt.seenIds;
    }
    expect(seen).toHaveLength(30);
    const repeatedCycle = createLayerAttempt(layer, seen, () => 0.52);
    expect(repeatedCycle.cycleReset).toBeTruthy();
    expect(repeatedCycle.questions).toHaveLength(10);
    expect(new Set(repeatedCycle.questions.map((question) => question.id)).size).toBe(10);
  }
});

test("option order is randomized and exact-set scoring supports single and multiple selection", () => {
  const target = layerQuestionBank.find((question) => question.kind === "multiple")!;
  const once = shuffle(target.options, () => 0.12);
  const twice = shuffle(target.options, () => 0.91);
  expect(once.map((option) => option.id)).not.toEqual(twice.map((option) => option.id));
  expect(isQuestionCorrect(target, target.correctOptionIds)).toBeTruthy();
  expect(isQuestionCorrect(target, [target.correctOptionIds[0]])).toBeFalsy();
  expect(isQuestionCorrect(target, [...target.correctOptionIds, target.options.find((option) => !target.correctOptionIds.includes(option.id))!.id])).toBeFalsy();
  const result = scoreAssessment([target], { [target.id]: target.correctOptionIds });
  expect(result).toMatchObject({ correct: 1, total: 1, percent: 100, passed: true });
  expect(result.byTopic[target.topic]).toEqual({ correct: 1, total: 1 });
});

test("the integrated bank has multi-layer scenarios and the exam selects a balanced unique set of 25", () => {
  expect(integratedQuestionBank.length).toBeGreaterThanOrEqual(14);
  expect(integratedQuestionBank.filter((question) => question.category === "blue-team").length).toBeGreaterThanOrEqual(13);
  for (const question of integratedQuestionBank) assertQuestionIntegrity(question);
  const attempt = createIntegratedAttempt(() => 0.41);
  expect(attempt).toHaveLength(25);
  expect(new Set(attempt.map((question) => question.id)).size).toBe(25);
  expect(new Set(attempt.filter((question) => question.layer !== "integrated").map((question) => question.layer))).toEqual(new Set(layers));
  expect(attempt.filter((question) => question.category === "blue-team").length).toBeGreaterThanOrEqual(9);
  expect(attempt.filter((question) => question.layer === "integrated")).toHaveLength(7);
});

test("dictionary records and every question prerequisite resolve to material taught before its assessment", () => {
  const sectionIds = new Set(Array.from({ length: 7 }, (_, index) => index + 1).flatMap((layer) => sectionKeys.map((key) => `l${layer}-${key}`)));
  expect(new Set(knowledgeConcepts.map((concept) => concept.id)).size).toBe(knowledgeConcepts.length);
  for (const concept of knowledgeConcepts) {
    expect(concept.simpleDefinition.length, `${concept.id} simple definition`).toBeGreaterThan(20);
    expect(concept.technicalDefinition.length, `${concept.id} technical definition`).toBeGreaterThan(30);
    expect(concept.example.length, `${concept.id} example`).toBeGreaterThan(15);
    expect(concept.layers.length, `${concept.id} layers`).toBeGreaterThan(0);
    expect(concept.sectionIds.length, `${concept.id} course sections`).toBeGreaterThan(0);
    expect(concept.references.length, `${concept.id} references`).toBeGreaterThan(0);
    expect(concept.references.every((reference) => /^https:\/\//.test(reference.url)), `${concept.id} reference URL`).toBeTruthy();
    expect(concept.relatedConceptIds.every((id) => knowledgeById.has(id)), `${concept.id} related concepts`).toBeTruthy();
    expect(concept.sectionIds.every((id) => sectionIds.has(id)), `${concept.id} sections`).toBeTruthy();
  }
  for (const [sectionId, conceptIds] of Object.entries(termAnnotationsBySection)) {
    expect(sectionIds.has(sectionId), `${sectionId} annotation section`).toBeTruthy();
    expect(conceptIds.every((id) => knowledgeById.has(id)), `${sectionId} annotation terms`).toBeTruthy();
  }

  const allQuestions = [...layerQuestionBank, ...integratedQuestionBank];
  const unteachableConcepts = allQuestions.filter((question) => question.layer !== "integrated").flatMap((question) => question.conceptIds.filter((conceptId) => !knowledgeById.get(conceptId)!.sectionIds.some((id) => Number(id.match(/^l([1-7])-/)?.[1]) <= question.layer)).map((conceptId) => `${question.id}:${conceptId}`));
  expect(unteachableConcepts).toEqual([]);
  for (const question of allQuestions) {
    expect(question.conceptIds.length, `${question.id} concepts`).toBeGreaterThan(0);
    expect(question.prerequisiteSectionIds.length, `${question.id} prerequisites`).toBeGreaterThan(0);
    expect(question.conceptIds.every((id) => knowledgeById.has(id)), `${question.id} concept IDs`).toBeTruthy();
    expect(question.prerequisiteSectionIds.every((id) => sectionIds.has(id)), `${question.id} section IDs`).toBeTruthy();
    expect(question.conceptIds.every((id) => knowledgeById.get(id)!.sectionIds.some((sectionId) => question.prerequisiteSectionIds.includes(sectionId))), `${question.id} concepts point to their teaching sections`).toBeTruthy();
    if (question.layer !== "integrated") {
      expect(question.prerequisiteSectionIds[0]).toBe(`l${question.layer}-${question.sectionRef}`);
      expect(question.prerequisiteSectionIds.every((id) => Number(id.match(/^l([1-7])-/)?.[1]) <= question.layer), `${question.id} cannot rely on a later chapter`).toBeTruthy();
      expect(question.conceptIds.every((conceptId) => {
        const concept = knowledgeById.get(conceptId)!;
        return concept.sectionIds.some((id) => Number(id.match(/^l([1-7])-/)?.[1]) <= question.layer && question.prerequisiteSectionIds.includes(id));
      }), `${question.id} every assessed concept has an earlier or current teaching section`).toBeTruthy();
    }
  }
});

test("study state migrates older versions, tolerates corrupt data, records attempts and preserves reader preferences on reset", () => {
  const legacy = normalizeStudyState({ version: 1, lastLayer: 3, readProgress: { 3: 45 }, scrollPositions: { 3: 410 }, preferences: { theme: "sepia", fontSize: 19 }, completedLayers: [1, 8] });
  expect(legacy).toMatchObject({ version: 2, lastLayer: 3, readProgress: { 3: 45 }, scrollPositions: { 3: 410 }, preferences: { theme: "sepia", fontSize: 19 }, completedLayers: [1] });
  expect(loadStudyState({ getItem: () => "{" })).toMatchObject({ version: 2, lastLayer: 1 });

  const memory = new Map<string, string>();
  const storage = { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => { memory.set(key, value); } };
  const start = { ...legacy, preferences: { ...legacy.preferences, theme: "dark" as const } };
  const result = scoreAssessment([layerQuestionBank[0]], { [layerQuestionBank[0].id]: layerQuestionBank[0].correctOptionIds });
  const saved = recordAttempt(start, "chapter", 1, result, [layerQuestionBank[0].id], { [layerQuestionBank[0].id]: layerQuestionBank[0].correctOptionIds }, new Date("2026-11-14T12:00:00Z"));
  saveStudyState(saved, storage);
  expect(memory.has(STUDY_STORAGE_KEY)).toBeTruthy();
  expect(loadStudyState(storage).attempts).toHaveLength(1);
  expect(loadStudyState(storage).attempts[0].byTopic).toBeDefined();
  const oldAttempt = { ...saved.attempts[0], byTopic: undefined };
  expect(normalizeStudyState({ ...saved, version: 2, attempts: [oldAttempt] }).attempts[0].byTopic).toEqual({});
  expect(bestLayerScore(saved.attempts, 1)).toBe(100);
  const reset = clearStudyProgress(saved);
  expect(reset.preferences.theme).toBe("dark");
  expect(reset.attempts).toHaveLength(0);
  expect(reset.readProgress).toEqual({});
});
