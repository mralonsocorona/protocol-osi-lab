export type BasesTheme = "paper" | "mono" | "dark" | "sepia";
export type BasesFont = "serif" | "sans" | "mono";

export type BasesPreferences = {
  theme: BasesTheme;
  font: BasesFont;
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
};

export type ChapterProgress = {
  status: "in-progress" | "completed";
  percent: number;
  scrollY: number;
};

export type BasesProgress = {
  lastSlug: string;
  chapters: Record<string, ChapterProgress>;
};

export type BasesQuizResult = {
  chapterSlug: string;
  date: string;
  correct: number;
  total: number;
  percent: number;
};

export const BASES_PREFERENCES_KEY = "blacknova:bases:preferences";
export const BASES_PROGRESS_KEY = "blacknova:bases:progress";
export const BASES_QUIZ_RESULTS_KEY = "blacknova:bases:quiz-results";

export const defaultBasesPreferences: BasesPreferences = {
  theme: "paper", font: "serif", fontSize: 17, lineHeight: 1.78, paragraphSpacing: 13,
};

export const defaultBasesProgress: BasesProgress = { lastSlug: "", chapters: {} };

function readJson<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch { return fallback; }
}

export function loadBasesPreferences(): BasesPreferences {
  const source = readJson<Partial<BasesPreferences>>(BASES_PREFERENCES_KEY, {});
  const bounded = (value: unknown, minimum: number, maximum: number, fallback: number) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : fallback;
  };
  return {
    theme: source.theme === "mono" || source.theme === "dark" || source.theme === "sepia" ? source.theme : "paper",
    font: source.font === "sans" || source.font === "mono" ? source.font : "serif",
    fontSize: bounded(source.fontSize, 16, 28, defaultBasesPreferences.fontSize),
    lineHeight: bounded(source.lineHeight, 1.55, 1.95, defaultBasesPreferences.lineHeight),
    paragraphSpacing: bounded(source.paragraphSpacing, 8, 22, defaultBasesPreferences.paragraphSpacing),
  };
}

export function loadBasesProgress(): BasesProgress {
  const source = readJson<Partial<BasesProgress>>(BASES_PROGRESS_KEY, {});
  const chapters: BasesProgress["chapters"] = {};
  if (source.chapters && typeof source.chapters === "object") {
    for (const [slug, value] of Object.entries(source.chapters)) {
      if (!value || typeof value !== "object") continue;
      chapters[slug] = {
        status: value.status === "completed" ? "completed" : "in-progress",
        percent: Math.max(0, Math.min(100, Number(value.percent) || 0)),
        scrollY: Math.max(0, Number(value.scrollY) || 0),
      };
    }
  }
  return { lastSlug: typeof source.lastSlug === "string" ? source.lastSlug : "", chapters };
}

export function loadBasesQuizResults(): BasesQuizResult[] {
  const results = readJson<unknown>(BASES_QUIZ_RESULTS_KEY, []);
  return Array.isArray(results) ? results.filter((value): value is BasesQuizResult => Boolean(value)
    && typeof value === "object" && typeof (value as BasesQuizResult).chapterSlug === "string"
    && Number.isFinite((value as BasesQuizResult).percent)) : [];
}

export function saveBasesPreferences(value: BasesPreferences) {
  try { localStorage.setItem(BASES_PREFERENCES_KEY, JSON.stringify(value)); } catch { /* Local storage may be unavailable. */ }
}

export function saveBasesProgress(value: BasesProgress) {
  try { localStorage.setItem(BASES_PROGRESS_KEY, JSON.stringify(value)); } catch { /* Local storage may be unavailable. */ }
}

export function saveBasesQuizResults(value: BasesQuizResult[]) {
  try { localStorage.setItem(BASES_QUIZ_RESULTS_KEY, JSON.stringify(value.slice(-100))); } catch { /* Local storage may be unavailable. */ }
}
