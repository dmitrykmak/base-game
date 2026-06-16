"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GameState,
  initialState,
  tap as applyTap,
  isComboExpired,
  expireCombo,
  comboFraction,
} from "@/lib/tapGame";
import {
  ACHIEVEMENTS,
  loadUnlocked,
  saveUnlocked,
  newlyUnlocked,
  type Achievement,
} from "@/lib/achievements";
import {
  loadLeaderboard,
  addScore,
  type ScoreEntry,
} from "@/lib/leaderboard";
import {
  sendTapTx,
  sendAchievementTx,
  connectWallet,
  isInMiniApp,
} from "@/lib/baseTx";
import {
  BaseStatus,
  TxBanner,
  ScorePanel,
  TapTarget,
  AchievementToast,
  AchievementsPanel,
  Leaderboard,
} from "./TapParts";

export type TxStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "success"; hash: string }
  | { state: "rejected" }
  | { state: "error" }
  | { state: "no-wallet" };

type Float = { id: number; x: number; y: number; text: string };

export default function TapRush() {
  const [game, setGame] = useState<GameState>(initialState());
  const gameRef = useRef<GameState>(game);
  gameRef.current = game;
  const [txStatus, setTxStatus] = useState<TxStatus>({ state: "idle" });
  const [inMiniApp, setInMiniApp] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [txPerTap, setTxPerTap] = useState(true);
  const txPerTapRef = useRef(txPerTap);
  txPerTapRef.current = txPerTap;
  const inMiniAppRef = useRef(inMiniApp);
  inMiniAppRef.current = inMiniApp;
  const [comboPct, setComboPct] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const floatId = useRef(0);
  const txTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Досягнення
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const unlockedRef = useRef<Set<string>>(unlocked);
  unlockedRef.current = unlocked;
  const [toast, setToast] = useState<Achievement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Лідерборд
  const [board, setBoard] = useState<ScoreEntry[]>([]);

  // Ініціалізація: середовище Base + збережені дані
  useEffect(() => {
    setUnlocked(loadUnlocked());
    setBoard(loadLeaderboard());
    (async () => {
      const inside = await isInMiniApp();
      setInMiniApp(inside);
      if (inside) setWallet(await connectWallet());
    })();
  }, []);

  // Анімація прогрес-бара комбо + згоряння комбо
  useEffect(() => {
    const t = setInterval(() => {
      setGame((g) => (isComboExpired(g) ? expireCombo(g) : g));
      setComboPct(comboFraction(gameRef.current));
    }, 80);
    return () => clearInterval(t);
  }, []);

  // Перевірити нові досягнення за поточним станом гри
  const checkAchievements = useCallback((state: GameState) => {
    const fresh = newlyUnlocked(state, unlockedRef.current);
    if (fresh.length === 0) return;

    const nextSet = new Set(unlockedRef.current);
    fresh.forEach((a) => nextSet.add(a.id));
    unlockedRef.current = nextSet;
    setUnlocked(nextSet);
    saveUnlocked(nextSet);

    // Показати тост для останнього розблокованого
    const last = fresh[fresh.length - 1];
    setToast(last);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);

    // 🏅 Окрема транзакція за кожне досягнення (бонусна мікроплата)
    if (txPerTapRef.current && inMiniAppRef.current) {
      fresh.forEach((a) => {
        sendAchievementTx({ id: a.id, title: a.title, score: state.score });
      });
    }
  }, []);

  const handleTap = useCallback(
    (e: React.PointerEvent) => {
      const now = Date.now();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Рахуємо від АКТУАЛЬНОГО стану (ref), щоб серії швидких тапів
      // не губилися через stale-замикання React.
      const { state: next, gained } = applyTap(gameRef.current, now);
      gameRef.current = next;
      setGame(next);

      // Спливаюче "+очки"
      const id = floatId.current++;
      setFloats((f) => [...f, { id, x, y, text: `+${gained}` }]);
      setTimeout(() => {
        setFloats((f) => f.filter((fl) => fl.id !== id));
      }, 800);

      // Пульсація кнопки
      setPulse(1);
      setTimeout(() => setPulse(0), 120);

      // 🔵 Мікроплата-транзакція в Base на кожен тап
      if (txPerTapRef.current && inMiniAppRef.current) {
        setTxStatus({ state: "pending" });
        sendTapTx({ score: next.score, combo: next.combo, ts: now }).then(
          (res) => {
            if (res.ok) setTxStatus({ state: "success", hash: res.hash });
            else setTxStatus({ state: res.reason });
            if (txTimer.current) clearTimeout(txTimer.current);
            txTimer.current = setTimeout(
              () => setTxStatus({ state: "idle" }),
              3500,
            );
          },
        );
      }

      // Перевірити досягнення
      checkAchievements(next);

      // Зберегти рекорд очок
      if (typeof window !== "undefined") {
        const prev = parseInt(
          localStorage.getItem("tap-best-score") || "0",
          10,
        );
        if (next.score > prev) {
          localStorage.setItem("tap-best-score", String(next.score));
        }
      }
    },
    [checkAchievements],
  );

  // Завершити сесію: записати результат у лідерборд і почати нову гру
  const finishAndReset = useCallback(() => {
    const cur = gameRef.current;
    if (cur.score > 0) {
      const updated = addScore({
        score: cur.score,
        taps: cur.taps,
        bestCombo: cur.bestCombo,
        ts: Date.now(),
      });
      setBoard(updated);
    }
    const fresh = initialState();
    gameRef.current = fresh;
    setGame(fresh);
    setFloats([]);
    setTxStatus({ state: "idle" });
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <AchievementToast achievement={toast} />

      <ScorePanel
        score={game.score}
        taps={game.taps}
        bestCombo={game.bestCombo}
      />

      <BaseStatus
        inMiniApp={inMiniApp}
        wallet={wallet}
        txPerTap={txPerTap}
        setTxPerTap={setTxPerTap}
      />

      <TxBanner status={txStatus} />

      <TapTarget
        onTap={handleTap}
        combo={game.combo}
        multiplier={game.multiplier}
        comboPct={comboPct}
        pulse={pulse}
        floats={floats}
      />

      <button
        onClick={finishAndReset}
        className="px-4 py-1.5 rounded-full text-xs ring-1 ring-white/15 text-zinc-300 hover:bg-white/5"
      >
        ↻ Завершити й зберегти результат
      </button>

      <AchievementsPanel all={ACHIEVEMENTS} unlocked={unlocked} />

      <Leaderboard entries={board} currentScore={game.score} />

      <p className="text-xs text-zinc-500 text-center max-w-xs">
        Тапай по синьому колу. Швидкі тапи поспіль нарощують комбо й множник
        очок (до 5×). Кожен тап — мікротранзакція в мережі Base. Розблоковуй
        досягнення й піднімайся в топі!
      </p>
    </div>
  );
}
