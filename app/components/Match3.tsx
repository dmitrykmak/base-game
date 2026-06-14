"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Board,
  Pos,
  BOARD_SIZE,
  GEM_EMOJI,
  GEM_COLORS,
  createBoard,
  areAdjacent,
  swap,
  findMatches,
  clearMatches,
  applyGravity,
  hasValidMove,
  scoreForClear,
} from "@/lib/game";
import { sendMoveTx, connectWallet, isInMiniApp } from "@/lib/baseTx";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type TxStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; hash: string }
  | { state: "rejected" }
  | { state: "error" }
  | { state: "no-wallet" };

export default function Match3() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [moves, setMoves] = useState(30);
  const [selected, setSelected] = useState<Pos | null>(null);
  const [clearing, setClearing] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>({ state: "idle" });
  const [inMiniApp, setInMiniApp] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  // Чи вимагати транзакцію на кожен хід (можна вимкнути перемикачем)
  const [txPerMove, setTxPerMove] = useState(true);

  // Визначаємо середовище Base + пробуємо під'єднати гаманець
  useEffect(() => {
    (async () => {
      const inside = await isInMiniApp();
      setInMiniApp(inside);
      if (inside) {
        const addr = await connectWallet();
        setWallet(addr);
      }
    })();
  }, []);

  // Ініціалізація + завантаження рекорду
  useEffect(() => {
    setBoard(createBoard());
    const saved = typeof window !== "undefined" ? localStorage.getItem("base-match3-best") : null;
    if (saved) setBest(parseInt(saved, 10) || 0);
  }, []);

  // Оновлення рекорду
  useEffect(() => {
    if (score > best) {
      setBest(score);
      if (typeof window !== "undefined") localStorage.setItem("base-match3-best", String(score));
    }
  }, [score, best]);

  // Каскадне розв'язання збігів
  const resolveBoard = useCallback(async (start: Board) => {
    let current = start;
    let combo = 1;
    let totalGained = 0;

    while (true) {
      const matches = findMatches(current);
      if (matches.size === 0) break;

      setClearing(matches);
      await sleep(280);

      const gained = scoreForClear(matches.size, combo);
      totalGained += gained;
      setScore((s) => s + gained);

      const { board: cleared } = clearMatches(current, matches);
      setBoard(cleared);
      await sleep(140);

      current = applyGravity(cleared);
      setBoard(current);
      setClearing(new Set());
      await sleep(180);

      combo++;
    }
    return { board: current, gained: totalGained };
  }, []);

  const handleCell = useCallback(
    async (pos: Pos) => {
      if (busy || gameOver) return;

      if (!selected) {
        setSelected(pos);
        return;
      }

      if (selected.row === pos.row && selected.col === pos.col) {
        setSelected(null);
        return;
      }

      if (!areAdjacent(selected, pos)) {
        setSelected(pos);
        return;
      }

      // Спроба обміну
      setBusy(true);
      const swapped = swap(board, selected, pos);
      const matches = findMatches(swapped);

      if (matches.size === 0) {
        // Невалідний хід — анімація "відскоку"
        setBoard(swapped);
        setSelected(null);
        await sleep(220);
        setBoard(board);
        setBusy(false);
        return;
      }

      setBoard(swapped);
      setSelected(null);

      // 🔵 Base: на кожен валідний хід — транзакція в мережі Base.
      // Йде паралельно з анімацією; гра НЕ падає, якщо відхилити.
      if (txPerMove && inMiniApp) {
        setTxStatus({ state: "pending" });
        sendMoveTx({
          from: [selected.row, selected.col],
          to: [pos.row, pos.col],
          score,
        }).then((res) => {
          if (res.ok) setTxStatus({ state: "success", hash: res.hash });
          else setTxStatus({ state: res.reason });
          // авто-сховати банер успіху/помилки за 3.5с
          setTimeout(() => setTxStatus({ state: "idle" }), 3500);
        });
      }

      await sleep(160);

      const { board: settled } = await resolveBoard(swapped);

      const left = moves - 1;
      setMoves(left);

      if (left <= 0 || !hasValidMove(settled)) {
        setGameOver(true);
      }
      setBusy(false);
    },
    [busy, gameOver, selected, board, moves, resolveBoard, txPerMove, inMiniApp, score]
  );

  const restart = () => {
    setBoard(createBoard());
    setScore(0);
    setMoves(30);
    setSelected(null);
    setClearing(new Set());
    setGameOver(false);
    setBusy(false);
  };

  if (board.length === 0) {
    return <div className="text-zinc-400">Завантаження…</div>;
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md">
      {/* Шапка зі статистикою */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <Stat label="Рахунок" value={score} accent="#0052ff" />
        <Stat label="Ходи" value={moves} accent={moves <= 5 ? "#ef4444" : "#22c55e"} />
        <Stat label="Рекорд" value={best} accent="#a855f7" />
      </div>

      {/* Статус Base / транзакції */}
      <div className="flex items-center justify-between w-full gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: inMiniApp ? "#22c55e" : "#71717a" }}
          />
          <span className="text-zinc-400">
            {inMiniApp
              ? wallet
                ? `Base: ${wallet.slice(0, 6)}…${wallet.slice(-4)}`
                : "Base: підключення…"
              : "Поза Base (демо-режим)"}
          </span>
        </div>
        {inMiniApp && (
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-400">
            <input
              type="checkbox"
              checked={txPerMove}
              onChange={(e) => setTxPerMove(e.target.checked)}
              className="accent-[#0052ff]"
            />
            Tx на кожен хід
          </label>
        )}
      </div>

      {/* Банер статусу транзакції */}
      <TxBanner status={txStatus} />

      {/* Дошка */}
      <div
        className="relative grid gap-1.5 p-2.5 rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-2xl"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
      >
        {board.map((row, r) =>
          row.map((gem, c) => {
            const key = `${r},${c}`;
            const isSel = selected?.row === r && selected?.col === c;
            const isClearing = clearing.has(key);
            return (
              <button
                key={key}
                onClick={() => handleCell({ row: r, col: c })}
                disabled={busy || gameOver}
                aria-label={`клітинка ${r},${c}`}
                className="aspect-square w-9 sm:w-10 rounded-lg flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 select-none"
                style={{
                  background: gem === -1 ? "transparent" : `${GEM_COLORS[gem]}22`,
                  outline: isSel ? `3px solid ${GEM_COLORS[gem] ?? "#fff"}` : "none",
                  transform: isClearing
                    ? "scale(0.2)"
                    : isSel
                    ? "scale(1.12)"
                    : "scale(1)",
                  opacity: isClearing ? 0 : 1,
                }}
              >
                {gem === -1 ? "" : GEM_EMOJI[gem]}
              </button>
            );
          })
        )}

        {/* Оверлей кінця гри */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/80 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">Гру завершено!</p>
            <p className="text-zinc-300">
              Рахунок: <span className="font-bold text-[#0052ff]">{score}</span>
            </p>
            <button
              onClick={restart}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#0052ff] text-white font-semibold hover:bg-[#0042cc] transition-colors"
            >
              Грати ще
            </button>
          </div>
        )}
      </div>

      <button
        onClick={restart}
        className="px-5 py-2 rounded-full ring-1 ring-white/15 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
      >
        ↻ Нова гра
      </button>

      <p className="text-xs text-zinc-500 text-center max-w-xs">
        Тапни на фішку, потім на сусідню, щоб поміняти місцями. Збери 3+ однакових
        у ряд або стовпець.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-xl font-bold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

function TxBanner({ status }: { status: TxStatus }) {
  if (status.state === "idle") return null;

  const map: Record<string, { text: string; color: string; bg: string }> = {
    pending: { text: "⏳ Підтвердь транзакцію в гаманці…", color: "#fbbf24", bg: "#fbbf2422" },
    success: { text: "✅ Хід записано в Base", color: "#22c55e", bg: "#22c55e22" },
    rejected: { text: "✋ Транзакцію відхилено (хід зараховано)", color: "#f87171", bg: "#f8717122" },
    error: { text: "⚠️ Помилка транзакції (хід зараховано)", color: "#f87171", bg: "#f8717122" },
    "no-wallet": { text: "👛 Гаманець недоступний", color: "#a1a1aa", bg: "#a1a1aa22" },
  };
  const s = map[status.state];
  if (!s) return null;

  return (
    <div
      className="w-full rounded-xl px-3 py-2 text-xs text-center ring-1 ring-white/10 transition-all"
      style={{ background: s.bg, color: s.color }}
    >
      {s.text}
      {status.state === "success" && (
        <a
          href={`https://basescan.org/tx/${status.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1.5 underline opacity-80 hover:opacity-100"
        >
          переглянути ↗
        </a>
      )}
    </div>
  );
}

