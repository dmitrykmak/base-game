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
import { sendTapTx, connectWallet, isInMiniApp } from "@/lib/baseTx";
import { BaseStatus, TxBanner, ScorePanel, TapTarget } from "./TapParts";

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

  // Середовище Base
  useEffect(() => {
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

  const handleTap = useCallback((e: React.PointerEvent) => {
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

    // Зберегти рекорд
    if (typeof window !== "undefined") {
      const prev = parseInt(localStorage.getItem("tap-best-score") || "0", 10);
      if (next.score > prev) {
        localStorage.setItem("tap-best-score", String(next.score));
      }
    }
  }, []);

  const reset = useCallback(() => {
    const fresh = initialState();
    gameRef.current = fresh;
    setGame(fresh);
    setFloats([]);
    setTxStatus({ state: "idle" });
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md">
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
        onClick={reset}
        className="px-4 py-1.5 rounded-full text-xs ring-1 ring-white/15 text-zinc-300 hover:bg-white/5"
      >
        ↻ Нова гра
      </button>

      <p className="text-xs text-zinc-500 text-center max-w-xs">
        Тапай по синьому колу. Швидкі тапи поспіль нарощують комбо й множник
        очок (до 5×). Кожен тап — мікротранзакція в мережі Base.
      </p>
    </div>
  );
}
