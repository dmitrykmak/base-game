// Логіка гри "три в ряд" (match-3). Чистий TypeScript, без залежностей.

export const BOARD_SIZE = 8;
export const GEM_TYPES = 6;

// Кольори/емодзі для фішок
export const GEM_EMOJI = ["💎", "🔷", "🟢", "🟡", "🔴", "🟣"];
export const GEM_COLORS = [
  "#38bdf8", // блакитний
  "#3b82f6", // синій
  "#22c55e", // зелений
  "#eab308", // жовтий
  "#ef4444", // червоний
  "#a855f7", // фіолетовий
];

export type Board = number[][];
export type Pos = { row: number; col: number };

// Випадкова фішка
function randomGem(): number {
  return Math.floor(Math.random() * GEM_TYPES);
}

// Створити дошку без початкових збігів
export function createBoard(): Board {
  let board: Board;
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomGem())
    );
  } while (findMatches(board).size > 0);
  return board;
}

// Чи сусідні дві клітинки
export function areAdjacent(a: Pos, b: Pos): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return dr + dc === 1;
}

// Знайти всі клітинки, що входять у збіги (3+ в ряд або стовпець)
export function findMatches(board: Board): Set<string> {
  const matched = new Set<string>();

  // горизонтальні
  for (let r = 0; r < BOARD_SIZE; r++) {
    let runStart = 0;
    for (let c = 1; c <= BOARD_SIZE; c++) {
      if (c < BOARD_SIZE && board[r][c] === board[r][runStart]) continue;
      const len = c - runStart;
      if (len >= 3) {
        for (let k = runStart; k < c; k++) matched.add(`${r},${k}`);
      }
      runStart = c;
    }
  }

  // вертикальні
  for (let c = 0; c < BOARD_SIZE; c++) {
    let runStart = 0;
    for (let r = 1; r <= BOARD_SIZE; r++) {
      if (r < BOARD_SIZE && board[r][c] === board[runStart][c]) continue;
      const len = r - runStart;
      if (len >= 3) {
        for (let k = runStart; k < r; k++) matched.add(`${k},${c}`);
      }
      runStart = r;
    }
  }

  return matched;
}

// Поміняти місцями дві клітинки (повертає НОВУ дошку)
export function swap(board: Board, a: Pos, b: Pos): Board {
  const next = board.map((row) => [...row]);
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

// Прибрати збіги (-1 = порожньо). Повертає нову дошку і кількість прибраних.
export function clearMatches(
  board: Board,
  matches: Set<string>
): { board: Board; cleared: number } {
  const next = board.map((row) => [...row]);
  matches.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    next[r][c] = -1;
  });
  return { board: next, cleared: matches.size };
}

// Гравітація: фішки падають вниз, зверху падають нові
export function applyGravity(board: Board): Board {
  const next = board.map((row) => [...row]);
  for (let c = 0; c < BOARD_SIZE; c++) {
    const column: number[] = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (next[r][c] !== -1) column.push(next[r][c]);
    }
    while (column.length < BOARD_SIZE) column.push(randomGem());
    for (let r = BOARD_SIZE - 1, i = 0; r >= 0; r--, i++) {
      next[r][c] = column[i];
    }
  }
  return next;
}

// Чи існує хоч один валідний хід (чи не застрягла дошка)
export function hasValidMove(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const right = { row: r, col: c + 1 };
      const down = { row: r + 1, col: c };
      const here = { row: r, col: c };
      if (c + 1 < BOARD_SIZE) {
        const t = swap(board, here, right);
        if (findMatches(t).size > 0) return true;
      }
      if (r + 1 < BOARD_SIZE) {
        const t = swap(board, here, down);
        if (findMatches(t).size > 0) return true;
      }
    }
  }
  return false;
}

// Очки за прибрані фішки (комбо множить рахунок)
export function scoreForClear(cleared: number, combo: number): number {
  return cleared * 10 * combo;
}
