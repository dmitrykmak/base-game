"use client";

import type { TxStatus } from "./TapRush";
import type { Achievement } from "@/lib/achievements";
import type { ScoreEntry } from "@/lib/leaderboard";

const MAIN = "#0052ff";

// Статус середовища Base + перемикач транзакцій
export function BaseStatus({
  inMiniApp,
  wallet,
  txPerTap,
  setTxPerTap,
}: {
  inMiniApp: boolean;
  wallet: string | null;
  txPerTap: boolean;
  setTxPerTap: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-2 text-xs">
        <span
          className="inline-flex h-2 w-2 rounded-full"
          style={{ background: inMiniApp ? "#22c55e" : "#71717a" }}
        />
        {inMiniApp ? (
          <span className="text-zinc-400">
            Гаманець:{" "}
            <span className="text-zinc-200 font-mono">
              {wallet
                ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
                : "підключення…"}
            </span>
          </span>
        ) : (
          <span className="text-zinc-500">
            Демо-режим (відкрий у Base App, щоб грати on-chain)
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={txPerTap}
          onChange={(e) => setTxPerTap(e.target.checked)}
          className="accent-[#0052ff]"
        />
        Транзакція в Base на кожен тап
      </label>
    </div>
  );
}

// Банер статусу транзакції
export function TxBanner({ status }: { status: TxStatus }) {
  if (status.state === "idle") return null;

  const map: Record<string, { text: string; cls: string }> = {
    pending: {
      text: "⏳ Транзакція надсилається…",
      cls: "bg-blue-500/10 text-blue-300 ring-blue-500/30",
    },
    success: {
      text: "✅ Тап записано в Base",
      cls: "bg-green-500/10 text-green-300 ring-green-500/30",
    },
    rejected: {
      text: "✋ Транзакцію відхилено — тап все одно зараховано",
      cls: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
    },
    error: {
      text: "⚠️ Помилка транзакції — тап все одно зараховано",
      cls: "bg-red-500/10 text-red-300 ring-red-500/30",
    },
    "no-wallet": {
      text: "👛 Гаманець недоступний — граєш у демо-режимі",
      cls: "bg-zinc-500/10 text-zinc-300 ring-zinc-500/30",
    },
  };

  const m = map[status.state];
  if (!m) return null;

  return (
    <div
      className={`w-full text-center text-xs px-3 py-2 rounded-lg ring-1 ${m.cls}`}
    >
      {m.text}
      {status.state === "success" && status.hash && (
        <>
          {" · "}
          <a
            href={`https://basescan.org/tx/${status.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            BaseScan ↗
          </a>
        </>
      )}
    </div>
  );
}

// Велика панель рахунку
export function ScorePanel({
  score,
  taps,
  bestCombo,
}: {
  score: number;
  taps: number;
  bestCombo: number;
}) {
  return (
    <div className="flex items-stretch gap-3 w-full">
      <Stat label="Очки" value={score.toLocaleString("uk")} big />
      <Stat label="Тапів" value={taps.toLocaleString("uk")} />
      <Stat label="Реко комбо" value={`x${bestCombo}`} />
    </div>
  );
}

function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex-1 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-2 text-center">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div
        className={`font-black tabular-nums ${
          big ? "text-2xl text-white" : "text-lg text-zinc-200"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// Велика кнопка-ціль для тапів + індикатор комбо
export function TapTarget({
  onTap,
  combo,
  multiplier,
  comboPct,
  pulse,
  floats,
}: {
  onTap: (e: React.PointerEvent) => void;
  combo: number;
  multiplier: number;
  comboPct: number;
  pulse: number;
  floats: { id: number; x: number; y: number; text: string }[];
}) {
  return (
    <div className="relative flex flex-col items-center gap-3 w-full">
      {/* Множник */}
      <div className="h-8 flex items-center">
        {combo > 1 ? (
          <span
            className="text-lg font-black"
            style={{
              color: multiplier >= 5 ? "#a855f7" : multiplier >= 3 ? "#22d3ee" : "#3b82f6",
            }}
          >
            COMBO x{combo} · {multiplier}× очок
          </span>
        ) : (
          <span className="text-sm text-zinc-500">Тапай швидко для комбо!</span>
        )}
      </div>

      {/* Прогрес-бар комбо */}
      <div className="h-1.5 w-full max-w-xs rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${comboPct * 100}%`,
            background:
              multiplier >= 5
                ? "#a855f7"
                : multiplier >= 3
                  ? "#22d3ee"
                  : MAIN,
          }}
        />
      </div>

      {/* Кнопка */}
      <button
        onPointerDown={onTap}
        className="relative h-56 w-56 rounded-full font-black text-white text-2xl select-none touch-none active:scale-95 transition-transform"
        style={{
          background: `radial-gradient(circle at 30% 30%, #3b82f6, ${MAIN} 60%, #001a66)`,
          boxShadow: `0 0 ${20 + pulse * 30}px ${pulse * 6}px rgba(0,82,255,0.5)`,
        }}
      >
        TAP
        {/* Спливаючі очки */}
        {floats.map((f) => (
          <span
            key={f.id}
            className="pointer-events-none absolute text-lg font-black text-cyan-200 animate-[floatUp_0.8s_ease-out_forwards]"
            style={{ left: f.x, top: f.y }}
          >
            {f.text}
          </span>
        ))}
      </button>
    </div>
  );
}

// Тост розблокованого досягнення (зверху екрана)
export function AchievementToast({
  achievement,
}: {
  achievement: Achievement | null;
}) {
  if (!achievement) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-[floatUp_0.4s_ease-out] ">
      <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#0052ff] to-[#a855f7] px-4 py-3 shadow-2xl ring-1 ring-white/20">
        <span className="text-2xl">{achievement.icon}</span>
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-white/70">
            Досягнення розблоковано
          </div>
          <div className="text-sm font-black text-white">
            {achievement.title}
          </div>
        </div>
      </div>
    </div>
  );
}

// Сітка досягнень (розблоковані / заблоковані)
export function AchievementsPanel({
  all,
  unlocked,
}: {
  all: Achievement[];
  unlocked: Set<string>;
}) {
  const done = all.filter((a) => unlocked.has(a.id)).length;
  return (
    <details className="w-full rounded-xl bg-white/5 ring-1 ring-white/10">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-zinc-200 flex items-center justify-between">
        <span>🏅 Досягнення</span>
        <span className="text-xs text-zinc-400">
          {done}/{all.length}
        </span>
      </summary>
      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        {all.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              title={a.desc}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center ring-1 transition-colors ${
                got
                  ? "bg-[#0052ff]/15 ring-[#0052ff]/40"
                  : "bg-white/5 ring-white/10 opacity-50"
              }`}
            >
              <span className="text-xl">{got ? a.icon : "🔒"}</span>
              <span className="text-[10px] leading-tight text-zinc-300">
                {a.title}
              </span>
            </div>
          );
        })}
      </div>
    </details>
  );
}

// Лідерборд топ-результатів (локальний)
export function Leaderboard({
  entries,
  currentScore,
}: {
  entries: ScoreEntry[];
  currentScore: number;
}) {
  if (entries.length === 0) return null;
  return (
    <details className="w-full rounded-xl bg-white/5 ring-1 ring-white/10">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-zinc-200 flex items-center justify-between">
        <span>🏆 Топ результатів</span>
        <span className="text-xs text-zinc-400">{entries.length}</span>
      </summary>
      <ol className="px-3 pb-3 flex flex-col gap-1">
        {entries.map((e, i) => {
          const isCurrent = e.score === currentScore && currentScore > 0;
          return (
            <li
              key={`${e.ts}-${i}`}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${
                isCurrent
                  ? "bg-[#0052ff]/20 ring-1 ring-[#0052ff]/40"
                  : "bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-zinc-500 tabular-nums">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="font-black tabular-nums text-zinc-100">
                  {e.score.toLocaleString("uk")}
                </span>
              </span>
              <span className="text-[11px] text-zinc-500">
                {e.taps} тапів · комбо x{e.bestCombo}
              </span>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
