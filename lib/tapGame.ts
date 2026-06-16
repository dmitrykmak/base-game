// Логіка гри "Base Tap Rush" — чистий, незалежний від React модуль.
// Гравець тапає по цілі; швидкі послідовні тапи нарощують комбо й множник.
// Кожен тап = одна транзакція-мікроплата (логіка оплати у lib/baseTx.ts).

export type GameState = {
  score: number; // загальний рахунок
  taps: number; // скільки всього тапів зроблено
  combo: number; // поточна серія тапів
  bestCombo: number; // найкраще комбо за сесію
  multiplier: number; // поточний множник очок (1..5)
  lastTapTs: number; // час останнього тапу (мс)
};

// Якщо між тапами проходить більше цього часу — комбо скидається.
export const COMBO_WINDOW_MS = 1500;

// Базова кількість очок за тап.
const BASE_POINTS = 10;

export function initialState(): GameState {
  return {
    score: 0,
    taps: 0,
    combo: 0,
    bestCombo: 0,
    multiplier: 1,
    lastTapTs: 0,
  };
}

// Множник зростає з комбо: кожні 5 тапів поспіль +1, максимум x5.
export function comboToMultiplier(combo: number): number {
  return Math.min(5, 1 + Math.floor(combo / 5));
}

// Обробити один тап. Повертає новий стан + скільки очок нараховано за цей тап.
export function tap(
  state: GameState,
  now: number = Date.now(),
): { state: GameState; gained: number; comboKept: boolean } {
  const withinWindow =
    state.lastTapTs > 0 && now - state.lastTapTs <= COMBO_WINDOW_MS;

  const combo = withinWindow ? state.combo + 1 : 1;
  const multiplier = comboToMultiplier(combo);
  const gained = BASE_POINTS * multiplier;

  const next: GameState = {
    score: state.score + gained,
    taps: state.taps + 1,
    combo,
    bestCombo: Math.max(state.bestCombo, combo),
    multiplier,
    lastTapTs: now,
  };

  return { state: next, gained, comboKept: withinWindow };
}

// Перевірити, чи комбо вже згоріло (для UI-таймера). Не змінює рахунок.
export function isComboExpired(state: GameState, now: number = Date.now()): boolean {
  if (state.combo === 0 || state.lastTapTs === 0) return false;
  return now - state.lastTapTs > COMBO_WINDOW_MS;
}

// Скинути лише комбо (рахунок зберігається).
export function expireCombo(state: GameState): GameState {
  return { ...state, combo: 0, multiplier: 1 };
}

// Залишок часу комбо у відсотках (1..0) для прогрес-бара.
export function comboFraction(state: GameState, now: number = Date.now()): number {
  if (state.combo === 0 || state.lastTapTs === 0) return 0;
  const elapsed = now - state.lastTapTs;
  return Math.max(0, Math.min(1, 1 - elapsed / COMBO_WINDOW_MS));
}
