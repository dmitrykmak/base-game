// Локальний лідерборд найкращих результатів (зберігається у localStorage).
// Тримаємо топ-10. Це особистий рекорд-борд гравця на цьому пристрої —
// глобальний лідерборд потребує бекенду/контракту (можна додати пізніше).

export type ScoreEntry = {
  score: number;
  taps: number;
  bestCombo: number;
  ts: number; // час досягнення (мс)
};

const STORAGE_KEY = "tap-leaderboard";
const MAX_ENTRIES = 10;

export function loadLeaderboard(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreEntry[];
  } catch {
    return [];
  }
}

// Додати результат і повернути оновлений топ-10 (відсортований за очками).
export function addScore(entry: ScoreEntry): ScoreEntry[] {
  const list = loadLeaderboard();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const top = list.slice(0, MAX_ENTRIES);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
    } catch {
      /* ignore */
    }
  }
  return top;
}

// Чи потрапляє результат у топ-10 (для підсвічування "новий рекорд").
export function isTopScore(score: number): boolean {
  const list = loadLeaderboard();
  if (list.length < MAX_ENTRIES) return score > 0;
  return score > list[list.length - 1].score;
}
