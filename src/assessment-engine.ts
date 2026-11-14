import type { AcademyLayer } from "./academy";
import { integratedQuestionBank, layerQuestionBank, type AssessmentCategory, type AssessmentKind, type AssessmentQuestion } from "./assessment-bank";

export type PreparedQuestion = AssessmentQuestion & { options: AssessmentQuestion["options"] };
export type AnswerValue = string[];
export type AnswerMap = Record<string, AnswerValue>;
export type AssessmentResult = {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  byCategory: Partial<Record<AssessmentCategory, { correct: number; total: number }>>;
  byTopic: Record<string, { correct: number; total: number }>;
  blueTeam: { correct: number; total: number };
  missedIds: string[];
};

const blueCategory: AssessmentCategory = "blue-team";
const chapterCategories: AssessmentCategory[] = ["fundamentals", "protocols", "workflow", "linux", "diagnosis", "red-team"];

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function sample<T>(items: readonly T[], count: number, random: () => number): T[] {
  if (items.length < count) throw new Error(`No hay suficientes preguntas: se necesitan ${count} y hay ${items.length}.`);
  return shuffle(items, random).slice(0, count);
}

export type LayerAttempt = { questions: PreparedQuestion[]; seenIds: string[]; cycleReset: boolean };

export function createLayerAttempt(layer: AcademyLayer, previouslySeen: readonly string[] = [], random: () => number = Math.random): LayerAttempt {
  let seen = new Set(previouslySeen);
  const pick = (reset: boolean) => {
    const pool = layerQuestionBank.filter((entry) => entry.layer === layer);
    const available = pool.filter((entry) => !seen.has(entry.id));
    const byCategory = (category: AssessmentCategory) => available.filter((entry) => entry.category === category);
    const selected = sample(byCategory(blueCategory), 4, random);
    for (const category of chapterCategories) selected.push(...sample(byCategory(category), 1, random));
    const unique = shuffle(selected, random).map((entry) => ({ ...entry, options: shuffle(entry.options, random) }));
    return { questions: unique, seenIds: [...new Set([...seen, ...selected.map((entry) => entry.id)])], cycleReset: reset };
  };

  const pool = layerQuestionBank.filter((entry) => entry.layer === layer);
  const remaining = pool.filter((entry) => !seen.has(entry.id));
  if (remaining.filter((entry) => entry.category === blueCategory).length >= 4
      && chapterCategories.every((category) => remaining.filter((entry) => entry.category === category).length >= 1)) return pick(false);
  seen = new Set();
  return pick(true);
}

export function createIntegratedAttempt(random: () => number = Math.random): PreparedQuestion[] {
  const integrated = sample(integratedQuestionBank, 7, random);
  const ordinary = (layer: AcademyLayer) => layerQuestionBank.filter((entry) => entry.layer === layer && entry.category !== blueCategory);
  const selected: AssessmentQuestion[] = [...integrated];
  const layers = [1, 2, 3, 4, 5, 6, 7] as AcademyLayer[];
  for (const layer of layers) selected.push(...sample(ordinary(layer), 2, random));
  const moreOrdinary = layers.flatMap((layer) => ordinary(layer).filter((entry) => !selected.some((chosen) => chosen.id === entry.id)));
  selected.push(...sample(moreOrdinary, 1, random));
  const blueCandidates = shuffle(layerQuestionBank.filter((entry) => entry.category === blueCategory), random);
  const blueByLayer = new Map<AcademyLayer, AssessmentQuestion>();
  for (const entry of blueCandidates) if (!blueByLayer.has(entry.layer as AcademyLayer)) blueByLayer.set(entry.layer as AcademyLayer, entry);
  selected.push(...sample([...blueByLayer.values()], 3, random));
  return shuffle(selected, random).map((entry) => ({ ...entry, options: shuffle(entry.options, random) }));
}

export function scoreAssessment(questions: readonly AssessmentQuestion[], answers: AnswerMap): AssessmentResult {
  let correct = 0;
  const byCategory: AssessmentResult["byCategory"] = {};
  const byTopic: AssessmentResult["byTopic"] = {};
  const blueTeam = { correct: 0, total: 0 };
  const missedIds: string[] = [];
  for (const question of questions) {
    const selected = [...new Set(answers[question.id] ?? [])].sort();
    const expected = [...question.correctOptionIds].sort();
    const isCorrect = selected.length === expected.length && selected.every((value, index) => value === expected[index]);
    const categoryScore = byCategory[question.category] ?? { correct: 0, total: 0 };
    categoryScore.total += 1;
    if (isCorrect) { correct += 1; categoryScore.correct += 1; }
    else missedIds.push(question.id);
    byCategory[question.category] = categoryScore;
    const topicScore = byTopic[question.topic] ?? { correct: 0, total: 0 };
    topicScore.total += 1;
    if (isCorrect) topicScore.correct += 1;
    byTopic[question.topic] = topicScore;
    if (question.category === blueCategory) {
      blueTeam.total += 1;
      if (isCorrect) blueTeam.correct += 1;
    }
  }
  const total = questions.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  return { correct, total, percent, passed: percent >= 80, byCategory, byTopic, blueTeam, missedIds };
}

export function isQuestionCorrect(question: AssessmentQuestion, selectedOptionIds: readonly string[]): boolean {
  const actual = [...new Set(selectedOptionIds)].sort();
  const expected = [...question.correctOptionIds].sort();
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}
