// Досягнення для "Base Tap Rush" — чистий модуль логіки.
// Перевіряються після кожного тапу. Кожне розблоковане досягнення можна
// позначити окремою on-chain транзакцією (див. TapRush.tsx).

import type { GameState } from "./tapGame";

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string; // емодзі лише для UI (НЕ для генерації зображень sharp)
  // Чи виконана умова за поточним станом гри
  check: (g: GameState) => boolean;
};

// Список досягнень. Порядок = порядок показу.
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-tap",
    title: "Перший тап",
    desc: "Зроби свій перший тап",
    icon: "👆",
    check: (g) => g.taps >= 1,
  },
  {
    id: "combo-5",
    title: "На розігріві",
    desc: "Набери комбо x5",
    icon: "🔥",
    check: (g) => g.bestCombo >= 5,
  },
  {
    id: "combo-10",
    title: "У вогні",
    desc: "Набери комбо x10",
    icon: "⚡",
    check: (g) => g.bestCombo >= 10,
  },
  {
    id: "combo-25",
    title: "Майстер комбо",
    desc: "Набери комбо x25",
    icon: "💫",
    check: (g) => g.bestCombo >= 25,
  },
  {
    id: "taps-50",
    title: "Розкочегарився",
    desc: "Зроби 50 тапів",
    icon: "🚀",
    check: (g) => g.taps >= 50,
  },
  {
    id: "taps-200",
    title: "Тап-машина",
    desc: "Зроби 200 тапів",
    icon: "🤖",
    check: (g) => g.taps >= 200,
  },
  {
    id: "score-500",
    title: "Перша сотня… й ще трохи",
    desc: "Набери 500 очок",
    icon: "🥉",
    check: (g) => g.score >= 500,
  },
  {
    id: "score-2000",
    title: "Серйозний гравець",
    desc: "Набери 2000 очок",
    icon: "🥈",
    check: (g) => g.score >= 2000,
  },
  {
    id: "score-5000",
    title: "Легенда Base",
    desc: "Набери 5000 очок",
    icon: "🥇",
    check: (g) => g.score >= 5000,
  },
];

const STORAGE_KEY = "tap-achievements";

// Прочитати розблоковані досягнення з localStorage.
export function loadUnlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

// Зберегти розблоковані досягнення.
export function saveUnlocked(unlocked: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {
    /* ignore */
  }
}

// Знайти досягнення, які щойно розблокувалися (виконані, але ще не в наборі).
export function newlyUnlocked(
  g: GameState,
  already: Set<string>,
): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !already.has(a.id) && a.check(g));
}
