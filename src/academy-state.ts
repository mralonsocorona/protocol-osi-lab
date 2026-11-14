import type { AcademyLayer } from "./academy";
import type { AssessmentCategory, AssessmentKind } from "./assessment-bank";
import type { AnswerMap, AssessmentResult } from "./assessment-engine";

export type ReaderPreferences = {
  theme: "paper" | "dark" | "sepia";
  font: "serif" | "sans";
  fontSize: number;
  lineHeight: number;
  columnWidth: number;
  paragraphSpacing: number;
};

export type StudyAttemptRecord = {
  id: string;
  date: string;
  kind: AssessmentKind;
  layer: AcademyLayer | "integrated";
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  byCategory: AssessmentResult["byCategory"];
  byTopic: AssessmentResult["byTopic"];
  blueTeam: AssessmentResult["blueTeam"];
  questionIds: string[];
  answers: AnswerMap;
};

export type StudyState = {
  version: 2;
  lastLayer: AcademyLayer;
  scrollPositions: Partial<Record<AcademyLayer, number>>;
  readProgress: Partial<Record<AcademyLayer, number>>;
  completedLayers: AcademyLayer[];
  bookmarks: Partial<Record<AcademyLayer, number>>;
  preferences: ReaderPreferences;
  usedQuestionIds: Partial<Record<AcademyLayer, string[]>>;
  attempts: StudyAttemptRecord[];
};

export const STUDY_STORAGE_KEY = "atlas-osi.study.v2";
const legacyStorageKey = "atlas-osi.study.v1";

export const defaultPreferences: ReaderPreferences = {
  theme: "paper", font: "serif", fontSize: 17, lineHeight: 1.78, columnWidth: 680, paragraphSpacing: 13,
};

export function createDefaultStudyState(): StudyState {
  return {
    version: 2, lastLayer: 1, scrollPositions: {}, readProgress: {}, completedLayers: [],
    bookmarks: {}, preferences: { ...defaultPreferences }, usedQuestionIds: {}, attempts: [],
  };
}

function validLayer(value: unknown): value is AcademyLayer {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 7;
}

function boundedNumber(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
}

function cleanLayerNumbers(value: unknown, maximum: number): Partial<Record<AcademyLayer, number>> {
  const clean: Partial<Record<AcademyLayer, number>> = {};
  if (!value || typeof value !== "object") return clean;
  for (const [key, entry] of Object.entries(value)) {
    const layer = Number(key);
    if (validLayer(layer)) clean[layer] = boundedNumber(entry, 0, maximum, 0);
  }
  return clean;
}

function cleanPreferences(value: unknown): ReaderPreferences {
  const defaults = defaultPreferences;
  if (!value || typeof value !== "object") return { ...defaults };
  const record = value as Record<string, unknown>;
  return {
    theme: record.theme === "dark" || record.theme === "sepia" ? record.theme : "paper",
    font: record.font === "sans" ? "sans" : "serif",
    fontSize: boundedNumber(record.fontSize, 15, 21, defaults.fontSize),
    lineHeight: boundedNumber(record.lineHeight, 1.55, 1.95, defaults.lineHeight),
    columnWidth: boundedNumber(record.columnWidth, 600, 780, defaults.columnWidth),
    paragraphSpacing: boundedNumber(record.paragraphSpacing, 8, 22, defaults.paragraphSpacing),
  };
}

function cleanAttempts(value: unknown): StudyAttemptRecord[] {
  if (!Array.isArray(value)) return [];
  const valid = value.filter((entry): entry is StudyAttemptRecord => {
    if (!entry || typeof entry !== "object") return false;
    const record = entry as Partial<StudyAttemptRecord>;
    return typeof record.id === "string" && typeof record.date === "string"
      && (record.layer === "integrated" || validLayer(record.layer))
      && (record.kind === "chapter" || record.kind === "integrated") && Array.isArray(record.questionIds)
      && Number.isFinite(record.percent) && Number.isFinite(record.correct) && Number.isFinite(record.total)
      && record.byCategory !== undefined && record.blueTeam !== undefined;
  });
  return valid.map((entry) => ({ ...entry, byTopic: entry.byTopic && typeof entry.byTopic === "object" ? entry.byTopic : {} })).slice(-200);
}

export function normalizeStudyState(value: unknown): StudyState {
  const defaults = createDefaultStudyState();
  if (!value || typeof value !== "object") return defaults;
  const record = value as Record<string, unknown>;
  if (record.version !== 1 && record.version !== 2) return defaults;
  const readProgress = cleanLayerNumbers(record.readProgress, 100);
  const scrollPositions = cleanLayerNumbers(record.scrollPositions, 10_000_000);
  const bookmarks = cleanLayerNumbers(record.bookmarks, 10_000_000);
  const completedLayers = Array.isArray(record.completedLayers) ? [...new Set(record.completedLayers.filter(validLayer))] : [];
  const usedQuestionIds: Partial<Record<AcademyLayer, string[]>> = {};
  if (record.usedQuestionIds && typeof record.usedQuestionIds === "object") {
    for (const [key, ids] of Object.entries(record.usedQuestionIds)) {
      const layer = Number(key);
      if (validLayer(layer) && Array.isArray(ids)) usedQuestionIds[layer] = ids.filter((id): id is string => typeof id === "string").slice(-30);
    }
  }
  return {
    version: 2,
    lastLayer: validLayer(record.lastLayer) ? record.lastLayer : 1,
    scrollPositions,
    readProgress,
    completedLayers,
    bookmarks,
    preferences: cleanPreferences(record.preferences),
    usedQuestionIds,
    attempts: cleanAttempts(record.attempts),
  };
}

export function loadStudyState(storage: Pick<Storage, "getItem"> | undefined = typeof localStorage === "undefined" ? undefined : localStorage): StudyState {
  if (!storage) return createDefaultStudyState();
  try {
    const current = storage.getItem(STUDY_STORAGE_KEY);
    if (current) return normalizeStudyState(JSON.parse(current) as unknown);
    const legacy = storage.getItem(legacyStorageKey);
    if (legacy) return normalizeStudyState(JSON.parse(legacy) as unknown);
  } catch {
    return createDefaultStudyState();
  }
  return createDefaultStudyState();
}

export function saveStudyState(state: StudyState, storage: Pick<Storage, "setItem"> | undefined = typeof localStorage === "undefined" ? undefined : localStorage): void {
  try { storage?.setItem(STUDY_STORAGE_KEY, JSON.stringify({ ...state, version: 2 })); } catch { /* Storage may be full or disabled. */ }
}

export function recordAttempt(state: StudyState, kind: AssessmentKind, layer: AcademyLayer | "integrated", result: AssessmentResult, questionIds: string[], answers: AnswerMap, date = new Date()): StudyState {
  const attempt: StudyAttemptRecord = {
    id: `${date.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    date: date.toISOString(), kind, layer, correct: result.correct, total: result.total, percent: result.percent,
    passed: result.passed, byCategory: result.byCategory, byTopic: result.byTopic, blueTeam: result.blueTeam, questionIds: [...questionIds],
    answers: Object.fromEntries(Object.entries(answers).map(([id, selected]) => [id, [...selected]])),
  };
  const attempts = [...state.attempts, attempt].slice(-200);
  const completedLayers = kind === "chapter" && result.passed && layer !== "integrated"
    ? [...new Set([...state.completedLayers, layer])].sort() as AcademyLayer[]
    : state.completedLayers;
  return { ...state, attempts, completedLayers };
}

export function clearStudyProgress(state: StudyState): StudyState {
  return { ...createDefaultStudyState(), preferences: { ...state.preferences } };
}

export function bestLayerScore(attempts: readonly StudyAttemptRecord[], layer: AcademyLayer): number | undefined {
  const scores = attempts.filter((attempt) => attempt.layer === layer && attempt.kind === "chapter").map((attempt) => attempt.percent);
  return scores.length ? Math.max(...scores) : undefined;
}
