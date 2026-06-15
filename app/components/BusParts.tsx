"use client";

import { Vehicle, GRID, EXIT_ROW } from "@/lib/busGame";

type TxStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; hash: string }
  | { state: "rejected" }
  | { state: "error" }
  | { state: "no-wallet" };

// Сітка з кнопками-клітинками + накладені «машини»
export function BoardGrid({
  grid,
  vehicles,
  selected,
  won,
  onCell,
}: {
  grid: (string | null)[][];
  vehicles: Vehicle[];
  selected: string | null;
  won: boolean;
  onCell: (r: number, c: number) => void;
}) {
  return (
    <div className="relative">
      {/* підкладка-сітка */}
      <div
        className="grid gap-1.5 p-2.5 rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-2xl"
        style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: GRID }).map((_, r) =>
          Array.from({ length: GRID }).map((_, c) => (
            <button
              key={`${r},${c}`}
              onClick={() => onCell(r, c)}
              aria-label={`клітинка ${r},${c}`}
              className="aspect-square w-11 sm:w-12 rounded-lg bg-black/30 ring-1 ring-white/5"
            />
          ))
        )}
      </div>

      {/* транспорт поверх сітки */}
      {vehicles.map((v) => {
        const isMain = v.id === "X";
        const isSel = selected === v.id;
        // розмір клітинки = кнопка(w-11=2.75rem) + gap(0.375rem)
        const cell = 2.75; // rem (sm: 3rem, але лишаємо базове для простоти)
        const gap = 0.375;
        const top = `calc(0.625rem + ${v.row} * (${cell}rem + ${gap}rem))`;
        const left = `calc(0.625rem + ${v.col} * (${cell}rem + ${gap}rem))`;
        const wCells = v.orient === "h" ? v.len : 1;
        const hCells = v.orient === "v" ? v.len : 1;
        const width = `calc(${wCells} * ${cell}rem + ${(wCells - 1) * gap}rem)`;
        const height = `calc(${hCells} * ${cell}rem + ${(hCells - 1) * gap}rem)`;
        return (
          <div
            key={v.id}
            onClick={() => onCell(v.row, v.col)}
            className="absolute flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 select-none"
            style={{
              top,
              left,
              width,
              height,
              background: `${v.color}`,
              boxShadow: isSel
                ? `0 0 0 3px #fff, 0 4px 14px ${v.color}99`
                : `0 3px 10px ${v.color}66`,
              transform: isSel ? "scale(1.04)" : "scale(1)",
              zIndex: isMain ? 5 : 3,
              fontSize: v.len >= 3 ? "1.5rem" : "1.25rem",
            }}
          >
            {v.emoji}
          </div>
        );
      })}

      {/* позначка виходу праворуч */}
      <div
        className="absolute flex items-center text-lg"
        style={{
          top: `calc(0.625rem + ${EXIT_ROW} * (2.75rem + 0.375rem) + 0.6rem)`,
          left: `calc(0.625rem + ${GRID} * (2.75rem + 0.375rem) - 0.1rem)`,
        }}
      >
        🏁
      </div>
    </div>
  );
}

export function LevelStats({
  level,
  moves,
  best,
  levelName,
}: {
  level: number;
  moves: number;
  best: number | null;
  levelName: string;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-center text-sm font-semibold text-zinc-300">
        {levelName}
      </p>
      <div className="grid grid-cols-2 gap-3 w-full">
        <Stat label="Ходи" value={moves} accent="#0052ff" />
        <Stat
          label="Рекорд"
          value={best ?? "—"}
          accent="#a855f7"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 py-2.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <span className="text-xl font-bold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

export function BaseStatus({
  inMiniApp,
  wallet,
  txPerMove,
  setTxPerMove,
}: {
  inMiniApp: boolean;
  wallet: string | null;
  txPerMove: boolean;
  setTxPerMove: (v: boolean) => void;
}) {
  return (
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
  );
}

export function TxBanner({ status }: { status: TxStatus }) {
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
      className="w-full rounded-xl px-3 py-2 text-xs text-center ring-1 ring-white/10"
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

export function WinPanel({
  moves,
  hasNext,
  onNext,
  onReplay,
}: {
  moves: number;
  hasNext: boolean;
  onNext: () => void;
  onReplay: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center gap-3 rounded-2xl bg-[#0052ff]/15 ring-1 ring-[#0052ff]/40 py-4">
      <p className="text-xl font-bold text-white">🎉 Рівень пройдено!</p>
      <p className="text-zinc-300 text-sm">
        Ходів: <span className="font-bold text-[#0052ff]">{moves}</span>
      </p>
      <div className="flex gap-2">
        <button
          onClick={onReplay}
          className="px-5 py-2 rounded-full ring-1 ring-white/15 text-sm text-zinc-200 hover:bg-white/5"
        >
          ↻ Ще раз
        </button>
        {hasNext && (
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full bg-[#0052ff] text-white font-semibold hover:bg-[#0042cc]"
          >
            Далі →
          </button>
        )}
      </div>
    </div>
  );
}
